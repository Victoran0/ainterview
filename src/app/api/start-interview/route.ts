import type { NextApiRequest, NextApiResponse } from 'next';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { ResumeAnalysis, InterviewStructureSchema, InterviewStructure, InterviewSession } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';
import { zodToJsonSchema } from "zod-to-json-schema";
import { api } from '@/trpc/server';

const interviewJsonSchema = zodToJsonSchema(InterviewStructureSchema, "InterviewStructure");

// This prompt needs to be carefully engineered.
const questionGenerationPromptText = `
You are an AI Interview Question Generator. Based on the candidate's resume analysis, create a comprehensive and structured interview.
The interview should include sections for:
1.  Background & Resume: Questions about their resume, motivations, career goals. (2-3 questions)
2.  Technical Skills: Questions targeting specific skills listed. Vary difficulty. Include theoretical and practical/coding concept questions if applicable. (5-7 questions)
3.  Problem-Solving: Present 1-2 scenarios or problems relevant to their field/skills.
4.  Behavioral: STAR-method type questions related to teamwork, challenges, leadership. (3-4 questions)
5.  Aptitude (Multiple Choice): Generate 3-5 multiple-choice questions testing logical reasoning, basic domain knowledge, or quick thinking. Provide 3-4 options and indicate the correct answer text.

Candidate Resume Analysis:
Summary: {summary}
Skills: {skills}
Experience Highlights: {experience_highlights}
Education: {education_highlights}
Projects: {projects_highlights}

For each question, specify its type (technical, behavioral, problem-solving, theoretical, aptitude-mcq, background), text, options (for MCQ), correctAnswerText (for MCQ, or ideal answer keywords for others), topic, and difficulty (easy, medium, hard).
Structure the entire output as a single JSON object matching the InterviewStructureSchema provided by the tool call.
Ensure questions are diverse and strongly aligned with the candidate's profile.
Each section should have a name and a suggested time limit in minutes (e.g., Technical: 20 mins, Behavioral: 15 mins) and the total duration must not exceed 60 minutes.
`;

const llm = new ChatGoogleGenerativeAI({
  // openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0.5, // Moderate temperature for creative but relevant questions
  model: "gemini-2.0-flash", // GPT-4 recommended for this complexity
});

// Use OpenAI Functions for reliable structured output
const toolCallingModel = llm.bind({
  tools: [
    {
      type: "function",
      function: {
        name: "generate_interview_structure",
        description: "Generates a structured interview with sections and questions based on candidate profile.",
        parameters: interviewJsonSchema.definitions?.InterviewStructure || interviewJsonSchema, // Your Zod to JSON schema for the desired output
      },
    },
  ],
  tool_choice: { type: "function", function: { name: "generate_interview_structure" } },
});


export async function POST(req: NextRequest, res: NextResponse) {

  // const storedAnalysis = await req.json();
  // console.log('Received request to start interview:', storedAnalysis);
  const  resumeAnalysis: ResumeAnalysis = await api.manageDB.getResumeAnalysis();
  console.log('Received request to start interview: \n\n', "resumeAnalysis: ", resumeAnalysis);

  if (!resumeAnalysis) {
    return new Response(JSON.stringify({ error: 'Resume analysis is required.' }), {status: 400});
  }
  

  //   const outputParser = new JsonOutputFunctionsParser(); // Parses the function call arguments
  const outputParser = new JsonOutputParser<InterviewStructure>(); // Parses the function call arguments

  try {
    const prompt = PromptTemplate.fromTemplate(questionGenerationPromptText);
    const input = await prompt.format({
        summary: resumeAnalysis.summary,
        skills: resumeAnalysis.skills.join(', '),
        experience_highlights: resumeAnalysis.experiences?.map(e => `${e.jobTitle} at ${e.company}`).join('; '),
        education_highlights: resumeAnalysis.education?.map(e => e.degree).join('; '),
        projects_highlights: resumeAnalysis.projects?.map(p => p.name).join('; '),
    });
    
    const llmResponse = await toolCallingModel.invoke(input);
    console.log('LLM Response:', llmResponse.content);
    
    const interviewStructure: InterviewStructure = await outputParser.invoke(llmResponse.content ); // Should be parsed JSON

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

    const interviewSession: InterviewSession = {
        sessionId,
        resumeAnalysis,
        interviewStructure,
        currentSectionIndex: 0,
        currentQuestionIndex: 0,
        answers: {},
        startTime: new Date().toISOString(),
    };

    // In a real app, save interviewSession to DB.
    // For now, client will receive it and manage state.
    return NextResponse.json(interviewSession, { status: 200 });

  } catch (error: any) {
    console.error('Question generation error:', error);
    return NextResponse.json({ error: 'Failed to generate interview questions.', details: error.message }, { status: 500 });
  }
}