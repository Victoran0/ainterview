import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { InterviewSession, FullReportSchema, FullReport, Question } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';
import zodToJsonSchema from "zod-to-json-schema";
// LangGraph imports would go here if used:
// import { StateGraph, END } from "@langchain/langgraph";
// import { RunnableLambda, RunnablePassthrough } from "@langchain/core/runnables";

const FullReportJsonSchema = zodToJsonSchema(FullReportSchema, "FullReport");

const feedbackPromptText = `
You are an AI Interview Performance Analyzer.
You will receive the candidate's resume analysis, the interview questions, and their answers.
Your task is to:
1.  Evaluate each answer individually:
    - Provide a score from 0 to 5 (0=poor, 5=excellent).
    - Give specific, constructive feedback on the answer.
    - For MCQs, state if it was correct and score accordingly (5 for correct, 0 for incorrect).
    - Consider the question type, keywords (if provided with the question), and ideal answer concepts.
2.  Provide overall feedback:
    - Calculate an overall score percentage.
    - List key strengths demonstrated.
    - List key weaknesses or areas for improvement.
    - Offer detailed improvement suggestions for each weakness, including potential learning resources (provide placeholder names/URLs if actual ones are unknown).
    - Write a concise study plan summary.

Candidate Resume Summary: {resume_summary}
Candidate Skills: {resume_skills}

Interview Questions & Answers:
{questions_and_answers_formatted_string}

Please structure your entire response as a single JSON object matching the FullReportSchema.
Be fair, constructive, and thorough.
`;

// Helper to format Q&A for the prompt
function formatQuestionsAndAnswers(session: InterviewSession): string {
    let qaString = "";
    session.interviewStructure.sections.forEach(section => {
        qaString += `\nSection: ${section.name}\n`;
        section.questions.forEach(q => {
            const answer = session.answers[q.id] || "No answer provided.";
            qaString += `  Q (ID: ${q.id}, Type: ${q.type}): ${q.text}\n`;
            if (q.type === 'aptitude-mcq' && q.options) {
                qaString += `    Options: ${q.options.join(' | ')}\n`;
                if (q.correctAnswerText) qaString += `    Correct Answer: ${q.correctAnswerText}\n`;
            }
            if (q.keywordsForEvaluation && q.keywordsForEvaluation.length > 0) {
                qaString += `    Keywords for good answer: ${q.keywordsForEvaluation.join(', ')}\n`;
            }
            qaString += `    A: ${answer}\n`;
        });
    });
    return qaString;
}

const llm = new ChatGoogleGenerativeAI({
    // openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.3,
    model: "gemini-2.0-flash", 
});

const functionCallingModel = llm.bind({
    tools: [
        {   
            type: "function",
            function: {
                name: "generate_interview_full_report",
                description: "Generates a complete interview feedback report including individual answer evaluations and overall feedback.",
                parameters: FullReportJsonSchema.definitions?.FullReport || FullReportJsonSchema,
            },
        },
    ],
    tool_choice: { type: "function", function: { name: "generate_interview_full_report" }},
});


export async function POST(req: NextRequest, res: NextResponse) {

    const sessionData: InterviewSession = await req.json();

    if (!sessionData || !sessionData.answers || !sessionData.interviewStructure || !sessionData.resumeAnalysis) {
        return NextResponse.json({ error: 'Incomplete interview session data.' }, { status: 400 });
    }

    // const outputParser = new JsonOutputFunctionsParser();
    const outputParser = new JsonOutputParser<FullReport>(); // Parses the tool call arguments

    try {
        const questions_and_answers_formatted_string = formatQuestionsAndAnswers(sessionData);
        const prompt = PromptTemplate.fromTemplate(feedbackPromptText);
        const input = await prompt.format({
            resume_summary: sessionData.resumeAnalysis.summary,
            resume_skills: sessionData.resumeAnalysis.skills.join(', '),
            questions_and_answers_formatted_string,
        });

        const llmResponse = await functionCallingModel.invoke(input);
        console.log('LLM response:', llmResponse);

        let fullReport: FullReport = await outputParser.invoke(llmResponse.content as string);

        // Augment report with question texts and answers for easier display on frontend
        fullReport.answerEvaluations = fullReport.answerEvaluations.map(ev => {
            let questionText = "Question not found";
            let answerProvided = sessionData.answers[ev.questionId] as string || "N/A";
            for (const section of sessionData.interviewStructure.sections) {
                const q = section.questions.find(q => q.id === ev.questionId);
                if (q) {
                    questionText = q.text;
                    break;
                }
            }
            return { ...ev, questionText, answerProvided };
        });
        fullReport.sessionId = sessionData.sessionId;


        // TODO: Store fullReport in DB
        return NextResponse.json(fullReport, { status: 200 });

    } catch (error: any) {
        console.error('Feedback generation error:', error);
        return NextResponse.json({ error: 'Failed to generate feedback.', details: error.message }, { status: 500 });
    }
}