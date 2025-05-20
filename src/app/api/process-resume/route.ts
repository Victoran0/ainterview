import type { NextApiRequest, NextApiResponse } from 'next';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"; // Correct import for Gemini LLM
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "langchain/output_parsers";
import formidable from 'formidable';
import fs from 'fs';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { ResumeAnalysisSchema, ResumeAnalysis } from '@/lib/types'; // Import your Zod schema
import { NextRequest, NextResponse } from 'next/server';
import next from 'next';
import { createResumePath } from './createResumePath';

export const config = { api: { bodyParser: false } }; // Disable default bodyParser

const resumeParser = StructuredOutputParser.fromZodSchema(ResumeAnalysisSchema);
// console.log('Resume Parser instructions:', resumeParser.getFormatInstructions());

const resumeExtractionPromptTemplate = new PromptTemplate({
  template: `You are an expert HR assistant and resume parser. Extract structured information from the following resume text.
  Focus on skills, work experiences (job title, company, duration, key responsibilities/achievements), and education.
  If some information is missing, use sensible defaults or omit the field where appropriate (e.g., empty array for skills if none are found).
  Format your output according to the provided schema.
  Your output must be a JSON object that matches the provided schema in Format Instructions.
  No 3 backticks with json tags, just the JSON object, i.e. your output must start and end with a curly brace.

  Resume Text:
  {resume_text}

  Format Instructions:
  {format_instructions}`,
  inputVariables: ["resume_text"],
  partialVariables: { format_instructions: resumeParser.getFormatInstructions() },
});

async function getTextFromDoc(filePath: string, fileType: string): Promise<string> {
  if (fileType === 'application/pdf') {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    console.log('PDF text:', data);
    return data.text;
  } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileType === 'application/msword') { // Added application/msword for .doc
    const result = await mammoth.extractRawText({ path: filePath });
    console.log('DOCX/DOC text extracted, length:', result.value.length);
    return result.value;
  }
  throw new Error(`Unsupported file type: ${fileType}`);
}

const llm = new ChatGoogleGenerativeAI({
  // openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0.1, // Low temperature for factual extraction
  model: "gemini-2.0-flash", // Or "gpt-4-turbo-preview" for better results
});

const allowedMimeTypes = [
  'application/pdf', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword' // .doc (though mammoth might have limitations with very old .doc)
];

export async function POST(req: NextRequest) {
  // console.log("the request: ", req)
  // console.log("the body type: ", typeof req.body)
  
  let tempFilePath: string | null = null; // To store temp file path for cleanup
  try {
    let resumeText: string;
    const contentType = req.headers.get('content-type');
    // console.log('Content-Type:', contentType);

    if (contentType?.includes('multipart/form-data')) {
      // const form = formidable({});
      // const [fields, files] = await form.parse(req);
      // const uploadedFile = files.resume?.[0];
      const formData = await req.formData();
      // console.log('Files: ', formData);
      
      const fileEntry = formData.get('resume');
      console.log('File Entry:', fileEntry);

      if (!fileEntry || !(fileEntry instanceof File)) {
        return NextResponse.json({ error: 'No resume file uploaded or not a file.' }, { status: 400 });
      }
      
      const uploadedFile = fileEntry as File;

      if (uploadedFile.size === 0) {
        return NextResponse.json({ error: 'Uploaded file is empty.' }, { status: 400 });
      }
      if (uploadedFile.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'File too large (max 5MB).' }, { status: 400 });
      if (!uploadedFile.type || !allowedMimeTypes.includes(uploadedFile.type)) {
        return NextResponse.json({ error: `Invalid file type: ${uploadedFile.type}. PDF, DOCX, or DOC only.` }, { status: 400 });
      }

      tempFilePath = await createResumePath(uploadedFile);
      resumeText = await getTextFromDoc(tempFilePath, uploadedFile.type);

    } else if (contentType?.includes('application/json')) {
      // Re-enable body parser for this specific case or parse manually
      // For simplicity, assuming Next.js parsed it if not multipart
      // This part needs careful handling of how Next.js parses JSON when bodyParser is false globally for the route.
      // A common pattern is to use a middleware or conditional parsing.
      // Let's assume the frontend stringifies the manualData and sends it as a field.
      // Or, better, have two separate endpoints or check `req.body` directly if Next.js somehow parsed it.
      // For this example, let's assume the frontend sends { manualData: stringified_json }
      // This is a simplification. A robust solution would handle JSON body parsing properly.
      // A quick fix for JSON:
      // Re-parse if it's JSON and bodyParser was off.
      let bodyData;
      if (typeof req.body === 'string') bodyData = JSON.parse(req.body); else bodyData = await req.json();
      const manualData = bodyData.dataToSubmit as ResumeAnalysis; // Type assertion
      // console.log('Manual Data:', manualData);
      if (!manualData) return NextResponse.json({ error: 'No manual data provided.' }, { status: 400 });
      // Convert manualData object to a text representation for the LLM
      resumeText = `Candidate provided data manually:
        Full Name: ${manualData.fullName || 'N/A'}
        Email: ${manualData.email || 'N/A'}
        Summary: ${manualData.summary}
        Skills: ${manualData.skills.join(', ')}
        Experiences: ${manualData.experiences?.map(e => `${e.jobTitle} at ${e.company}: ${e.responsibilities.join('. ')}`).join('\n')}
        Education: ${manualData.education?.map(e => `${e.degree} from ${e.institution}`).join('\n')}
        Projects: ${manualData.projects?.map(p => `${p.name}: ${p.description}`).join('\n')}
      `;
    } else {
      return NextResponse.json({ error: 'Unsupported content type.' }, { status: 400 });
    }

    if (!resumeText || resumeText.trim().length < 20) {
        return NextResponse.json({ error: 'Not enough content in resume to process.' }, { status: 400 });
    }

    const input = await resumeExtractionPromptTemplate.format({ resume_text: resumeText });
    const response = await llm.invoke(input);
    console.log('LLM response!: ', response.content);

    const parsedAnalysis: ResumeAnalysis = await resumeParser.invoke(response.content);
    
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    
    // In a real app, you'd save this analysis to a DB associated with sessionId
    // For now, we'll pass it to the next step or expect client to hold it.
    // Returning analysis and sessionId. Client should store analysis for /start-interview
    return NextResponse.json({ analysis: parsedAnalysis, sessionId }, { status: 200 });

  } catch (error: any) {
    console.error('Resume processing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during resume processing.';
    const errorDetails = process.env.NODE_ENV === 'development' ? { message: errorMessage, stack: error.stack } : { message: errorMessage };
    return NextResponse.json({ error: 'Failed to process resume.', details: errorDetails }, { status: 500 });
  } finally {
    // Clean up the temporary file if it was created
    if (tempFilePath) {
      try {
        fs.unlinkSync(tempFilePath);
        console.log(`Successfully deleted temporary file: ${tempFilePath}`);
      } catch (cleanupError) {
        console.error(`Error deleting temporary file ${tempFilePath}:`, cleanupError);
      }
    }
  }
}