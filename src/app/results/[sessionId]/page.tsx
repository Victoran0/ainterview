// pages/results/[sessionId].tsx
"use client"
import Head from 'next/head';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
// Progress component is not used in the provided JSX, but keeping import if needed later
// import { Progress } from '@/components/ui/progress'; 
import { AlertCircle, CheckCircle, Lightbulb, ListChecks, Loader2, TrendingDown, TrendingUp, BookOpen, Sparkles, Brain } from 'lucide-react'; // Added more icons
import { FullReport, FullReportSchema } from '@/lib/types'; // Assuming types are in lib/types
import { motion, AnimatePresence } from 'framer-motion'; // Using framer-motion
import AnimatedCircularProgress from '@/components/animatedCircularProgress'; // Corrected path assuming it's in components/ui

// --- Animation Variants ---
const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeInOut" } },
};

const cardItemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function ResultsPage() {
    const router = useRouter();
    const params = useParams();
    const sessionId = params.sessionId;
    const [report, setReport] = useState<FullReport | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Existing useEffect and logic (NO CHANGES) ---
    useEffect(() => {
        if (typeof sessionId === 'string') {
            const storedResults = localStorage.getItem(`interviewResults_${sessionId}`);
            if (storedResults) {
                try {
                    const parsedResults = JSON.parse(storedResults);
                    const validationResult = FullReportSchema.safeParse(parsedResults);
                    if (validationResult.success) {
                        setReport(validationResult.data);
                    } else {
                        console.error("Zod validation error on stored results:", validationResult.error);
                        setError("Failed to parse feedback data. It might be corrupted.");
                    }
                } catch (e) {
                    console.error("JSON parsing error on stored results:", e);
                    setError("Failed to load feedback data.");
                }
                setIsLoading(false);
            } else {
                setError("Interview results not found. The session may have expired or was not completed.");
                setIsLoading(false);
            }
        } else if (sessionId) {
             setError("Invalid session ID.");
             setIsLoading(false);
        }
    }, [sessionId]);

    // --- Loading State UI Update ---
    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-slate-100 p-4">
                <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
                <p className="text-2xl font-semibold">Loading Your Results...</p>
                <p className="text-slate-400">Hang tight, we're crunching the numbers!</p>
            </div>
        );
    }

    // --- Error State UI Update ---
    if (error || !report) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-slate-100 p-6 text-center">
                <AlertCircle className="h-16 w-16 text-red-500 mb-6" />
                <p className="text-2xl font-semibold text-red-400 mb-2">Oops! Something Went Wrong</p>
                <p className="text-slate-300 mb-6 max-w-md">{error || "Could not load your interview report."}</p>
                <Button 
                    onClick={() => router.push('/interview/new')} // Changed redirect to start new interview
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base shadow-lg hover:shadow-primary/40 transition-all"
                >
                    Start New Interview
                </Button>
            </div>
        );
    }

    // --- Existing isValidUrl function (NO CHANGES) ---
    function isValidUrl(url: string): boolean {
        try { new URL(url); return true; } catch (_) { return false; }
    }

    const { answerEvaluations, overallFeedback } = report;

    return (
        <>
            <Head>
                <title>Interview Report - Session {sessionId}</title>
                <meta name="description" content={`Detailed feedback and analysis for your interview session ${sessionId}.`} />
            </Head>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-slate-50 py-12 px-4 md:px-6 lg:px-8">
                <motion.div 
                    variants={pageVariants}
                    initial="hidden"
                    animate="visible"
                    className="container mx-auto max-w-4xl"
                >
                    <Card className="bg-slate-800/70 border-slate-700 shadow-2xl backdrop-blur-md overflow-hidden">
                        <CardHeader className="text-center p-8 border-b border-slate-700 bg-slate-800/50">
                            <motion.div
                                initial={{ scale: 0.7, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 180, damping: 20, delay: 0.1 }}
                            >
                                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                                    Interview Report
                                </h1>
                            </motion.div>
                            <CardDescription className="text-lg text-slate-400 mt-3">
                                Here's a detailed breakdown of your performance.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="p-6 md:p-8 space-y-10">
                            {/* Overall Score Section */}
                            <motion.section variants={cardItemVariants} initial="hidden" animate="visible" transition={{delay:0.2}}>
                                <Card className="bg-slate-700/40 border-slate-600 p-6 shadow-lg">
                                    <CardTitle className="text-2xl font-semibold mb-6 text-center text-sky-400 flex items-center justify-center">
                                        <Sparkles className="mr-3 h-7 w-7" /> Overall Score
                                    </CardTitle>
                                    <AnimatedCircularProgress percentage={overallFeedback.overallScorePercentage} />
                                </Card>
                            </motion.section>

                            {/* Strengths and Weaknesses Grid */}
                            <motion.section 
                                initial="hidden" animate="visible" 
                                variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 }}}}
                                className="grid md:grid-cols-2 gap-6 md:gap-8"
                            >
                                <motion.div variants={cardItemVariants}>
                                    <Card className="bg-slate-700/40 border-slate-600 h-full shadow-lg">
                                        <CardHeader className="flex flex-row items-center space-x-3 pb-3">
                                            <TrendingUp className="h-7 w-7 text-green-400" />
                                            <CardTitle className="text-xl font-semibold text-green-400">Strengths</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {overallFeedback.strengths.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {overallFeedback.strengths.map((strength, i) => 
                                                        <li key={i} className="flex items-start">
                                                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" /> 
                                                            <span className="text-slate-300">{strength}</span>
                                                        </li>
                                                    )}
                                                </ul>
                                            ) : <p className="text-slate-400 italic">No specific strengths highlighted.</p>}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                                <motion.div variants={cardItemVariants}>
                                    <Card className="bg-slate-700/40 border-slate-600 h-full shadow-lg">
                                        <CardHeader className="flex flex-row items-center space-x-3 pb-3">
                                            <TrendingDown className="h-7 w-7 text-yellow-400" />
                                            <CardTitle className="text-xl font-semibold text-yellow-400">Areas for Improvement</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {overallFeedback.weaknesses.length > 0 ? (
                                            <ul className="space-y-2">
                                                {overallFeedback.weaknesses.map((weakness, i) => 
                                                    <li key={i} className="flex items-start">
                                                        <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 shrink-0" />
                                                        <span className="text-slate-300">{weakness}</span>
                                                    </li>
                                                )}
                                            </ul>
                                            ) : <p className="text-slate-400 italic">No specific areas for improvement highlighted.</p>}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </motion.section>

                            {/* Improvement Suggestions Section */}
                            {overallFeedback.improvementSuggestions.length > 0 && (
                                <motion.section variants={cardItemVariants} initial="hidden" animate="visible" transition={{delay:0.4}}>
                                    <Card className="bg-slate-700/40 border-slate-600 shadow-lg">
                                        <CardHeader>
                                            <CardTitle className="text-2xl font-semibold flex items-center text-rose-400">
                                                <Lightbulb className="mr-3 h-7 w-7" /> Improvement Suggestions
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Accordion type="single" collapsible className="w-full">
                                                {overallFeedback.improvementSuggestions.map((item, i) => (
                                                    <AccordionItem value={`suggestion-${i}`} key={i} className="border-slate-600">
                                                        <AccordionTrigger className="text-lg font-medium text-slate-200 hover:no-underline hover:text-rose-300 py-4">
                                                            {item.area}
                                                        </AccordionTrigger>
                                                        <AccordionContent className="text-slate-300 space-y-3 pt-2 pb-4">
                                                            <ul className="space-y-1.5 pl-1">
                                                                {item.suggestions.map((suggestion, j) => 
                                                                    <li key={j} className="flex">
                                                                        <span className="text-rose-400 mr-2 mt-1">‣</span> {/* Bullet point */}
                                                                        {suggestion}
                                                                    </li>
                                                                )}
                                                            </ul>
                                                            {item.resources && item.resources.length > 0 && (
                                                                <div className="mt-4 pt-3 border-t border-slate-600">
                                                                    <h4 className="font-semibold text-slate-100 mb-2">Recommended Resources:</h4>
                                                                    <ul className="space-y-1.5 pl-1">
                                                                        {item.resources.map((res, k) => (
                                                                            <li key={k} className="flex items-center">
                                                                                <BookOpen className="h-4 w-4 text-rose-400 mr-2 shrink-0" />
                                                                                <a href={isValidUrl(res.url || "") ? res.url : `https://www.google.com/search?q=${encodeURIComponent(res.name)}`} target="_blank" rel="noopener noreferrer" className="text-rose-300 hover:text-rose-200 hover:underline">
                                                                                    {res.name}
                                                                                </a>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                ))}
                                            </Accordion>
                                        </CardContent>
                                    </Card>
                                </motion.section>
                            )}
                            
                            {/* Study Plan Summary Section */}
                            <motion.section variants={cardItemVariants} initial="hidden" animate="visible" transition={{delay:0.5}}>
                                <Card className="bg-slate-700/40 border-slate-600 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="text-2xl font-semibold flex items-center text-teal-400">
                                            <Brain className="mr-3 h-7 w-7" /> Study Plan Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="bg-slate-600/30 p-4 rounded-lg border border-slate-600">
                                            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{overallFeedback.studyPlanSummary || "No detailed study plan summary was generated for this session."}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.section>

                            {/* Detailed Answer Breakdown Section */}
                            {answerEvaluations.length > 0 && (
                                <motion.section variants={cardItemVariants} initial="hidden" animate="visible" transition={{delay:0.6}}>
                                    <Card className="bg-slate-700/40 border-slate-600 shadow-lg">
                                        <CardHeader>
                                            <CardTitle className="text-2xl font-semibold flex items-center text-purple-400">
                                                <ListChecks className="mr-3 h-7 w-7" /> Detailed Answer Breakdown
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Accordion type="single" collapsible className="w-full">
                                                {answerEvaluations.map((evalItem, i) => (
                                                    <AccordionItem value={`answer-${i}`} key={evalItem.questionId} className="border-slate-600">
                                                        <AccordionTrigger className="text-md font-medium text-slate-200 hover:no-underline hover:text-purple-300 py-4 text-left w-full">
                                                            <div className="flex justify-between items-start w-full gap-x-4"> {/* items-start */}
                                                                {/* Apply line-clamp utility */}
                                                                <span className="flex-grow line-clamp-2"> {/* Or line-clamp-3 */}
                                                                    Q: {evalItem.questionText || `ID: ${evalItem.questionId.substring(0,12)}...`}
                                                                </span>
                                                                <div className="flex items-center shrink-0 ml-2 whitespace-nowrap">
                                                                    <span className={`font-semibold mr-3 ${evalItem.score >= 3 ? 'text-green-400' : evalItem.score >=1 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                                        Score: {evalItem.score}/5
                                                                    </span>
                                                                    {evalItem.isCorrect !== undefined && (
                                                                        evalItem.isCorrect ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-red-500" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </AccordionTrigger>
                                                        <AccordionContent className="text-slate-300 pt-2 pb-4">
                                                            <p className="font-semibold text-slate-100 mb-1.5">Feedback:</p>
                                                            <p className="leading-relaxed">{evalItem.feedback}</p>
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                ))}
                                            </Accordion>
                                        </CardContent>
                                    </Card>
                                </motion.section>
                            )}
                        </CardContent>

                        <CardFooter className="p-6 md:p-8 text-center border-t border-slate-700">
                            <Button 
                                onClick={() => router.push('/interview/new')} // Changed redirect
                                size="lg" 
                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-pink-500/30 transition-all px-10 py-6 text-lg"
                            >
                                Start Another Interview
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        </>
    );
}