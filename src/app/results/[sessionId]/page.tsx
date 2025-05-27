// pages/results/[sessionId].tsx
"use client"
import Head from 'next/head';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Lightbulb, ListChecks, Loader2, TrendingDown, TrendingUp } from 'lucide-react';
import { z } from 'zod'; // Assuming fullReportSchema is defined with Zod as in the API
import { OverallFeedback, AnswerEvaluation, FullReport, FullReportSchema } from '@/lib/types'; // Import your defined types
import { motion } from "motion/react"
import AnimatedCircularProgress from '../../../components/animatedCircularProgress';


export default function ResultsPage() {
    const router = useRouter();
    const params = useParams();
    const sessionId = params.sessionId;
    const [report, setReport] = useState<FullReport | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (typeof sessionId === 'string') {
            const storedResults = localStorage.getItem(`interviewResults_${sessionId}`);
            if (storedResults) {
                try {
                    const parsedResults = JSON.parse(storedResults);
                    console.log("parsedResults: ", parsedResults)
                    // Validate with Zod before setting state
                    const validationResult = FullReportSchema.safeParse(parsedResults);
                    if (validationResult.success) {
                        setReport(validationResult.data);
                    } else {
                        console.error("Zod validation error on stored results:", validationResult.error);
                        setError("Failed to parse feedback data. It might be corrupted.");
                         // Optionally clear corrupted data: localStorage.removeItem(`interviewResults_${sessionId}`);
                    }
                } catch (e) {
                    console.error("JSON parsing error on stored results:", e);
                    setError("Failed to load feedback data.");
                }
                setIsLoading(false);
            } else {
                // Potentially fetch from backend if not found in localStorage,
                // but for this example, we assume it was stored by the interview page after submission.
                setError("Interview results not found. The session may have expired or was not completed.");
                setIsLoading(false);
            }
        } else if (sessionId) { // sessionId is defined but not a string (e.g. string[]) - less likely for this setup
             setError("Invalid session ID.");
             setIsLoading(false);
        }
        // If sessionId is undefined, router.query might not be ready yet, useEffect will re-run.
    }, [sessionId]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-xl">Loading your results...</p>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <p className="text-xl text-destructive">{error || "Could not load interview report."}</p>
                <Button onClick={() => router.push('/my-resume')} className="mt-4">Start New Interview</Button>
            </div>
        );
    }

    function isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch (_) {
            return false;
        }
    }

    const { answerEvaluations, overallFeedback } = report;

    return (
        <>
            <Head>
                <title>Interview Results - {sessionId}</title>
            </Head>
            <div className="container mx-auto px-4 py-12">
                <motion.div initial={{ opacity: 0, y:20 }} animate={{ opacity: 1, y:0 }} transition={{ duration: 0.5 }}>
                <Card className="w-full max-w-4xl mx-auto shadow-xl mb-8">
                    <CardHeader className="text-center bg-muted/30 p-6 rounded-t-lg">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                        >
                            <h1 className="text-4xl font-bold text-primary">Interview Report</h1>
                        </motion.div>
                        <CardDescription className="text-lg mt-2">
                            Here's a breakdown of your performance.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8">
                        <div className="mb-8 text-center">
                            <h2 className="text-2xl font-semibold mb-3">Overall Score</h2>
                            <AnimatedCircularProgress percentage={overallFeedback.overallScorePercentage} />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <Card>
                                <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                                    <TrendingUp className="h-6 w-6 text-green-500" />
                                    <CardTitle className="text-xl">Strengths</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {overallFeedback.strengths.length > 0 ? (
                                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                            {overallFeedback.strengths.map((strength, i) => <li key={i}>{strength}</li>)}
                                        </ul>
                                    ) : <p className="text-muted-foreground">No specific strengths highlighted in this report.</p>}
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                                    <TrendingDown className="h-6 w-6 text-red-500" />
                                    <CardTitle className="text-xl">Areas for Improvement</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {overallFeedback.weaknesses.length > 0 ? (
                                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                        {overallFeedback.weaknesses.map((weakness, i) => <li key={i}>{weakness}</li>)}
                                    </ul>
                                     ) : <p className="text-muted-foreground">No specific weaknesses highlighted in this report.</p>}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4 flex items-center"><Lightbulb className="h-6 w-6 text-yellow-500 mr-2" /> Improvement Suggestions</h2>
                            {overallFeedback.improvementSuggestions.length > 0 ? (
                            <Accordion type="single" collapsible className="w-full">
                                {overallFeedback.improvementSuggestions.map((item, i) => (
                                    <AccordionItem value={`suggestion-${i}`} key={i}>
                                        <AccordionTrigger className="text-lg hover:no-underline">{item.area}</AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground space-y-2">
                                            <ul className="list-disc list-inside space-y-1 pl-2">
                                                {item.suggestions.map((suggestion, j) => <li key={j}>{suggestion}</li>)}
                                            </ul>
                                            {item.resources && item.resources.length > 0 && (
                                                <div className="mt-3 pt-3 border-t">
                                                    <h4 className="font-semibold text-foreground mb-1">Recommended Resources:</h4>
                                                    <ul className="list-disc list-inside space-y-1 pl-2">
                                                        {item.resources.map((res, k) => (
                                                            <li key={k}><a href={isValidUrl(res.url || "") ? res.url : `https://www.google.com/search?q=${encodeURIComponent(res.name)}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{res.name}</a></li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                             ) : <p className="text-muted-foreground">No specific improvement suggestions provided.</p>}
                        </div>
                        
                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4 flex items-center"><ListChecks className="h-6 w-6 text-blue-500 mr-2" /> Study Plan Summary</h2>
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <p className="text-muted-foreground whitespace-pre-wrap">{overallFeedback.studyPlanSummary || "No detailed study plan summary was generated."}</p>
                            </div>
                        </div>

                        {answerEvaluations.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">Detailed Answer Breakdown</h2>
                                <Accordion type="single" collapsible className="w-full">
                                    {answerEvaluations.map((evalItem, i) => (
                                        <AccordionItem value={`answer-${i}`} key={evalItem.questionId}>
                                            <AccordionTrigger className="text-md hover:no-underline">
                                                <div className="flex justify-between w-full pr-4">
                                                    <span>Question ID: {evalItem.questionId.substring(0,15)}... (Score: {evalItem.score}/5)</span>
                                                    {evalItem.isCorrect !== undefined && (
                                                        evalItem.isCorrect ? <CheckCircle className="text-green-500" /> : <AlertCircle className="text-red-500" />
                                                    )}
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="text-muted-foreground">
                                                <p className="font-semibold text-foreground mb-1">Feedback:</p>
                                                <p>{evalItem.feedback}</p>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="p-6 text-center">
                        <Button onClick={() => router.push('/my-resume')} size="lg">
                            Start New Interview
                        </Button>
                    </CardFooter>
                </Card>
                </motion.div>
            </div>
        </>
    );
}

// Dummy motion component for example, if not using framer-motion directly
// const motion = {
//     div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { initial?: any, animate?: any, transition?: any }) => <div {...props}>{children}</div>
// };