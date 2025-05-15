// lib/types.ts
import { z } from 'zod';

// Schema for resume analysis (used by LLM and frontend)
export const ResumeAnalysisSchema = z.object({
  fullName: z.string().optional().describe("Full name of the candidate"),
  email: z.string().email().optional().describe("Email address"),
  phone: z.string().optional().describe("Phone number"),
  summary: z.string().describe("A brief summary or objective from the resume."),
  skills: z.array(z.string()).describe("List of key skills (technical, soft skills, tools, programming languages, etc.)."),
  experiences: z.array(
    z.object({
      jobTitle: z.string().describe("Job title"),
      company: z.string().describe("Company name"),
      duration: z.string().optional().describe("Employment duration (e.g., 'Jan 2020 - Present', '3 years')"),
      responsibilities: z.array(z.string()).describe("Key responsibilities and achievements"),
    })
  ).describe("Professional experiences."),
  education: z.array(
    z.object({
      degree: z.string().describe("Degree obtained (e.g., 'B.S. Computer Science')"),
      institution: z.string().describe("Name of the institution"),
      graduationYear: z.string().optional().describe("Year of graduation or expected graduation"),
    })
  ).describe("Educational background."),
  projects: z.array(
    z.object({
        name: z.string().describe("Project name"),
        description: z.string().describe("Brief project description and technologies used"),
    })
  ).optional().describe("Personal or academic projects.")
});
export type ResumeAnalysis = z.infer<typeof ResumeAnalysisSchema>;

// Schemas for Questions and Interview Structure
export const QuestionSchema = z.object({
    id: z.string().uuid().describe("Unique ID for the question"),
    type: z.enum(['technical', 'behavioral', 'problem-solving', 'theoretical', 'aptitude-mcq', 'background']).describe("Type of the question"),
    text: z.string().describe("The question text"),
    options: z.array(z.string()).optional().describe("Multiple choice options, if type is aptitude-mcq"),
    correctAnswerText: z.string().optional().describe("The text of the correct answer for MCQ. For non-MCQ, this can be an ideal answer snippet or keywords."),
    topic: z.string().optional().describe("Primary topic or skill this question relates to"),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional().describe("Estimated difficulty"),
    keywordsForEvaluation: z.array(z.string()).optional().describe("Keywords to look for in a good answer (for non-MCQ).")
});
export type Question = z.infer<typeof QuestionSchema>;

export const InterviewSectionSchema = z.object({
    name: z.string().describe("Name of the interview section"),
    type: z.enum(['technical', 'behavioral', 'problem-solving', 'theoretical', 'aptitude-mcq', 'background', 'mixed']).describe("Primary type of questions in this section"),
    timeLimitMinutes: z.number().int().positive().describe("Time limit in minutes for this section"),
    questions: z.array(QuestionSchema).describe("List of questions for this section")
});
export type InterviewSection = z.infer<typeof InterviewSectionSchema>;

export const InterviewStructureSchema = z.object({
    sections: z.array(InterviewSectionSchema)
});
export type InterviewStructure = z.infer<typeof InterviewStructureSchema>;

export interface InterviewSession {
  sessionId: string;
  resumeAnalysis: ResumeAnalysis;
  interviewStructure: InterviewStructure; // Contains all sections and questions
  currentSectionIndex: number;
  currentQuestionIndex: number; // Within the current section
  answers: Record<string, string | number>; // questionId: answer
  startTime?: string; // ISO string
  endTime?: string; // ISO string
}

// Schemas for Feedback
export const AnswerEvaluationSchema = z.object({
    questionId: z.string(),
    questionText: z.string(), // Good to have for display
    answerProvided: z.string(),
    score: z.number().min(0).max(5).describe("Score for the answer (0-5)"),
    feedback: z.string().describe("Specific feedback for this answer."),
    isCorrect: z.boolean().optional().describe("For MCQs, was it correct?"),
});
export type AnswerEvaluation = z.infer<typeof AnswerEvaluationSchema>;

export const OverallFeedbackSchema = z.object({
    overallScorePercentage: z.number().min(0).max(100).describe("Overall interview score"),
    strengths: z.array(z.string()).describe("Key strengths demonstrated"),
    weaknesses: z.array(z.string()).describe("Areas for improvement"),
    improvementSuggestions: z.array(z.object({
        area: z.string().describe("Specific area for improvement"),
        suggestions: z.array(z.string()).describe("Actionable suggestions"),
        resources: z.array(z.object({ name: z.string(), url: z.string().url() })).optional().describe("Learning resources")
    })).describe("Detailed suggestions for improvement."),
    studyPlanSummary: z.string().describe("A concise summary of a personalized study plan."),
});
export type OverallFeedback = z.infer<typeof OverallFeedbackSchema>;

export const FullReportSchema = z.object({
    answerEvaluations: z.array(AnswerEvaluationSchema),
    overallFeedback: OverallFeedbackSchema,
    sessionId: z.string()
});
export type FullReport = z.infer<typeof FullReportSchema>;