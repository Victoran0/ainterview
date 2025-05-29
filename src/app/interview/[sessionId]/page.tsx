// app/interview/[sessionId]/page.tsx (or your file path)
"use client"
import Head from 'next/head';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { toast } from "sonner";
import { motion, AnimatePresence } from 'framer-motion'; // Using framer-motion
import { InterviewSession, Question, InterviewSection } from '@/lib/types'; // Assuming types are in lib/types
import { AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Loader2, Timer, BookOpen, Brain, ListChecks } from 'lucide-react'; // Added more icons
import SectionTimer from './SectionTimer'; // Assuming this component is styled or we style it here
import { api } from '@/trpc/react';
import Link from 'next/link';

// --- Helper to get section icon and color ---
const getSectionTheme = (sectionName: string | undefined) => {
    const name = sectionName?.toLowerCase() || '';
    if (name.includes('behavioral')) return { Icon: Brain, color: 'text-sky-400', progressColor: 'bg-sky-500' };
    if (name.includes('technical') || name.includes('coding')) return { Icon: ListChecks, color: 'text-amber-400', progressColor: 'bg-amber-500' };
    if (name.includes('aptitude')) return { Icon: Brain, color: 'text-emerald-400', progressColor: 'bg-emerald-500' };
    // Add more cases as needed
    return { Icon: BookOpen, color: 'text-purple-400', progressColor: 'bg-purple-500' };
};


export default function InterviewPage() {
    const router = useRouter();
    const params = useParams();
    const sessionId = params.sessionId;

    // --- State and Hooks (NO CHANGES TO LOGIC) ---
    const [interviewSession, setInterviewSession] = useState<InterviewSession | null>(null);
    const [currentAnswer, setCurrentAnswer] = useState<string | number>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentSection, setCurrentSection] = useState<InterviewSection | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [currentQuestionInSectionIndex, setCurrentQuestionInSectionIndex] = useState(0);
    // const [interviewHasBeenDone, setInterviewHasBeenDone] = useState(false); // Not used in provided logic

    const { data: resumeData } = api.manageDB.checkResumeExists.useQuery();
    const { data: interviewData } = api.manageDB.checkInterviewExists.useQuery(
        { interviewId: sessionId as string },
        { enabled: typeof sessionId === 'string' && sessionId !== 'new' } // Only run if sessionId is an actual ID
    );

    useEffect(() => {
        if (sessionId === 'new') {
            if (!resumeData?.exists && !resumeData?.isLoading) { // check isLoading to prevent premature redirect
                toast.error("Resume Required", {description: "Please add your resume before starting an interview."});
                router.push('/my-resume'); // Assuming /resume is the page to add/view resume
                return;
            }
            if(resumeData?.exists) { // Only start if resume exists
                const startInterview = async () => {
                    setIsLoading(true);
                    try {
                        const response = await fetch('/api/start-interview', { method: 'POST' });
                        if (!response.ok) {
                            const errData = await response.json();
                            throw new Error(errData.error || 'Failed to start interview');
                        }
                        const sessionData: InterviewSession = await response.json();
                        setInterviewSession(sessionData);
                        localStorage.setItem(`interviewSession_${sessionData.sessionId}`, JSON.stringify(sessionData));
                        router.replace(`/interview/${sessionData.sessionId}`, undefined);
                        setIsLoading(false);
                    } catch (err: any) {
                        setError(err.message);
                        toast.error("Start Error", {description: err.message});
                        setIsLoading(false);
                    }
                };
                startInterview();
            }
        } else if (typeof sessionId === 'string') {
            let storedSession = localStorage.getItem(`interviewSession_${sessionId}`);
            if (interviewData?.exists) { // If interview is marked as done in DB
                if (storedSession) {
                    localStorage.removeItem(`interviewSession_${sessionId}`);
                    storedSession = null; // Force redirect to results or error
                }
                setError("This interview session has already been completed.");
                toast.info("Interview Completed", { description: "Redirecting to results..." });
                router.push(`/results/${sessionId}`); // Redirect to results page
                setIsLoading(false);
                return;
            }

            if (storedSession) {
                const session: InterviewSession = JSON.parse(storedSession);
                setInterviewSession(session);
                setIsLoading(false);
            } else if (!interviewData?.isLoading) { // Only if not loading and no stored session
                setError("Interview session not found or has expired.");
                toast.error("Session Error", {description: "Session not found. Please start a new interview." });
                // router.push('/interview/new'); // Or to a dashboard
                setIsLoading(false);
            }
        }
    }, [sessionId, router, resumeData, interviewData]);

    useEffect(() => {
        if (interviewSession) {
            const section = interviewSession.interviewStructure.sections[interviewSession.currentSectionIndex];
            setCurrentSection(section);
            if (section) {
                const question = section.questions[interviewSession.currentQuestionIndex];
                setCurrentQuestion(question);
                setCurrentQuestionInSectionIndex(interviewSession.currentQuestionIndex);
                const existingAnswer = interviewSession.answers[question?.id || ''];
                setCurrentAnswer(existingAnswer || '');
            } else {
                setCurrentQuestion(null);
            }
        }
    }, [interviewSession]);

    const saveAndProceed = (updatedSession: InterviewSession) => {
        setInterviewSession(updatedSession);
        localStorage.setItem(`interviewSession_${updatedSession.sessionId}`, JSON.stringify(updatedSession));
    };

    const handleNextQuestion = () => {
        if (!interviewSession || !currentSection || !currentQuestion) return;
        const updatedAnswers = { ...interviewSession.answers, [currentQuestion.id]: currentAnswer };
        let nextQuestionIndex = interviewSession.currentQuestionIndex + 1;
        let nextSectionIndex = interviewSession.currentSectionIndex;
        if (nextQuestionIndex >= currentSection.questions.length) {
            nextQuestionIndex = 0;
            nextSectionIndex++;
            if (nextSectionIndex >= interviewSession.interviewStructure.sections.length) {
                handleFinishInterview(updatedAnswers); return;
            }
            toast.success( `Section Complete!`, {description: `Moving to ${interviewSession.interviewStructure.sections[nextSectionIndex].name}.`});
        }
        saveAndProceed({ ...interviewSession, answers: updatedAnswers, currentQuestionIndex: nextQuestionIndex, currentSectionIndex: nextSectionIndex });
    };
    
    const handlePreviousQuestion = () => {
        if (!interviewSession || !currentSection || !currentQuestion) return;
        const updatedAnswers = { ...interviewSession.answers, [currentQuestion.id]: currentAnswer };
        let prevQuestionIndex = interviewSession.currentQuestionIndex - 1;
        let prevSectionIndex = interviewSession.currentSectionIndex;
        if (prevQuestionIndex < 0) {
            prevSectionIndex--;
            if (prevSectionIndex < 0) { toast.info( "Already at the first question."); return; }
            prevQuestionIndex = interviewSession.interviewStructure.sections[prevSectionIndex].questions.length - 1;
            toast.info( `Moving back`, {description: `Returning to ${interviewSession.interviewStructure.sections[prevSectionIndex].name}.`});
        }
        saveAndProceed({ ...interviewSession, answers: updatedAnswers, currentQuestionIndex: prevQuestionIndex, currentSectionIndex: prevSectionIndex });
    };

    const handleTimeUp = useCallback(() => {
        if (!interviewSession || !currentSection) return;
        toast.error("Time's Up!", {description: `Time for section "${currentSection.name}" has expired. Moving on.`});
        const updatedAnswers = currentQuestion ? { ...interviewSession.answers, [currentQuestion.id]: currentAnswer } : interviewSession.answers;
        let nextQuestionIndex = 0;
        let nextSectionIndex = interviewSession.currentSectionIndex + 1;
        if (nextSectionIndex >= interviewSession.interviewStructure.sections.length) {
            handleFinishInterview(updatedAnswers); return;
        }
        saveAndProceed({ ...interviewSession, answers: updatedAnswers, currentQuestionIndex: nextQuestionIndex, currentSectionIndex: nextSectionIndex });
    }, [interviewSession, currentSection, currentQuestion, currentAnswer]);

    const handleFinishInterview = async (finalAnswers?: InterviewSession['answers']) => {
        if (!interviewSession) return;
        setIsSubmitting(true);
        toast.info("Submitting Interview...", { description: "Please wait while we process your responses." });
        const answersToSubmit = finalAnswers || interviewSession.answers;
        if (currentQuestion && !finalAnswers) { answersToSubmit[currentQuestion.id] = currentAnswer; }
        const finalSessionState = { ...interviewSession, answers: answersToSubmit };
        localStorage.setItem(`interviewSession_${interviewSession.sessionId}`, JSON.stringify(finalSessionState));
        try {
            const response = await fetch('/api/interview-feedback', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(finalSessionState),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to submit interview.');
            }
            const feedbackResult = await response.json();
            localStorage.setItem(`interviewResults_${interviewSession.sessionId}`, JSON.stringify(feedbackResult)); // Store results
            localStorage.removeItem(`interviewSession_${interviewSession.sessionId}`); // Clean up session
            router.push(`/results/${interviewSession.sessionId}`);
            toast.success( "Interview Submitted!", {description: "Your feedback is ready." });
        } catch (err: any) {
            toast.error( "Submission Error", {description: err.message});
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- UI Rendering with New Styles ---
    const { Icon: SectionIcon, color: sectionColor, progressColor } = getSectionTheme(currentSection?.name);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-slate-100 p-4">
                <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
                <p className="text-2xl font-semibold">Preparing your interview...</p>
                <p className="text-slate-400">Please wait a moment.</p>
            </div>
        );
    }

    if (error) {
         return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-slate-100 p-6 text-center">
                <AlertCircle className="h-16 w-16 text-red-500 mb-6" />
                <p className="text-2xl font-semibold text-red-400 mb-2">An Error Occurred</p>
                <p className="text-slate-300 mb-6 max-w-md">{error}</p>
                <Button 
                    onClick={() => router.push('/interview/new')} 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base"
                >
                    Start New Interview
                </Button>
            </div>
        );
    }

    if (!interviewSession || !currentSection || !currentQuestion) {
        if (interviewSession && interviewSession.currentSectionIndex >= interviewSession.interviewStructure.sections.length) {
            return ( // Should be caught by finish logic, but as a fallback
                 <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-slate-100 p-4">
                    <CheckCircle className="h-16 w-16 text-green-500 mb-6" />
                    <p className="text-2xl font-semibold">Interview Completed!</p>
                    <Button onClick={() => router.push(`/results/${interviewSession.sessionId}`)} className="mt-6 bg-green-600 hover:bg-green-700 px-8 py-3 text-base">View Results</Button>
                </div>
            );
        }
        return ( // Fallback if still loading question somehow
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-slate-100 p-4">
                <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
                <p className="text-2xl font-semibold">Loading question...</p>
            </div>
        );
    }
    
    const overallProgress = interviewSession ? 
        (interviewSession.interviewStructure.sections.reduce((acc, section, idx) => {
            if (idx < interviewSession.currentSectionIndex) return acc + section.questions.length;
            if (idx === interviewSession.currentSectionIndex) return acc + interviewSession.currentQuestionIndex;
            return acc;
        }, 0) / interviewSession.interviewStructure.sections.reduce((total, sec) => total + sec.questions.length, 0)) * 100
        : 0;

    return (
        <>
            <Head>
                <title>{currentSection.name} - AI Interview Practice</title>
                <meta name="description" content={`Currently in the ${currentSection.name} section of your AI-powered interview.`} />
            </Head>
            <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-slate-50 p-4 md:p-6 lg:p-8 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-3xl" // Can adjust max-width
                >
                    <Card className="bg-slate-800/70 border-slate-700 shadow-2xl backdrop-blur-md overflow-hidden">
                        <CardHeader className="p-6 border-b border-slate-700">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center">
                                    <SectionIcon className={`mr-3 h-8 w-8 ${sectionColor}`} />
                                    <div>
                                        <CardTitle className={`text-2xl md:text-3xl font-bold ${sectionColor}`}>
                                            {currentSection.name}
                                        </CardTitle>
                                        <CardDescription className="text-slate-400 text-sm">
                                            Question {currentQuestionInSectionIndex + 1} of {currentSection.questions.length} in this section
                                        </CardDescription>
                                    </div>
                                </div>
                                {currentSection.timeLimitMinutes > 0 && (
                                    <div className="flex items-center text-sm bg-slate-700/50 px-3 py-1.5 rounded-lg text-slate-300">
                                        <Timer className="mr-2 h-4 w-4 text-slate-400" />
                                        <SectionTimer 
                                            key={`${sessionId}-${currentSection.name}`} // Re-mount timer on section change
                                            durationMinutes={currentSection.timeLimitMinutes} 
                                            onTimeUp={handleTimeUp} 
                                            className="font-mono"
                                        />
                                    </div>
                                )}
                            </div>
                            <Progress value={overallProgress} className={`w-full h-2.5 [&>*]:${progressColor} bg-slate-700`} />
                            <p className="text-xs text-slate-500 mt-1.5 text-right">Overall Progress: {Math.round(overallProgress)}%</p>
                        </CardHeader>

                        <CardContent className="min-h-[280px] md:min-h-[320px] p-6 flex flex-col">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentQuestion.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -30 }}
                                    transition={{ duration: 0.4, ease: "easeInOut" }}
                                    className="flex-grow flex flex-col"
                                >
                                    <h3 className="text-lg md:text-xl font-semibold mb-6 text-slate-100 leading-relaxed whitespace-pre-wrap">
                                        {currentQuestion.text}
                                    </h3>
                                    
                                    {currentQuestion.type === 'aptitude-mcq' && currentQuestion.options ? (
                                        <RadioGroup
                                            value={currentAnswer as string}
                                            onValueChange={(val) => setCurrentAnswer(val)}
                                            className="space-y-3"
                                        >
                                            {currentQuestion.options.map((option, index) => (
                                                <motion.div 
                                                    key={index}
                                                    initial={{opacity:0, x: -10}} animate={{opacity:1, x:0}} transition={{delay: 0.1 + index * 0.05}}
                                                >
                                                    <Label 
                                                        htmlFor={`option-${index}-${currentQuestion.id}`} // More unique ID
                                                        className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all duration-200
                                                            ${currentAnswer === option ? 'bg-primary/20 border-primary shadow-md' : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700/80 hover:border-slate-500'}
                                                        `}
                                                    >
                                                        <RadioGroupItem value={option} id={`option-${index}-${currentQuestion.id}`} className="border-slate-500 data-[state=checked]:border-primary data-[state=checked]:text-primary" />
                                                        <span className="flex-1 text-slate-200">{option}</span>
                                                    </Label>
                                                </motion.div>
                                            ))}
                                        </RadioGroup>
                                    ) : (
                                        <Textarea
                                            value={currentAnswer as string}
                                            onChange={(e) => setCurrentAnswer(e.target.value)}
                                            placeholder="Type your answer here..."
                                            rows={10} // Increased rows
                                            className="text-base bg-slate-700/50 border-slate-600 text-slate-100 focus:border-primary placeholder-slate-400 flex-grow resize-none"
                                        />
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </CardContent>

                        <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 border-t border-slate-700">
                            <Button 
                                variant="outline" 
                                onClick={handlePreviousQuestion} 
                                disabled={isSubmitting || (interviewSession.currentSectionIndex === 0 && currentQuestionInSectionIndex === 0)}
                                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-100 w-full sm:w-auto transition-all group"
                            >
                                <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Previous
                            </Button>
                            
                            {interviewSession.currentSectionIndex === interviewSession.interviewStructure.sections.length - 1 &&
                             currentQuestionInSectionIndex === currentSection.questions.length - 1 ? (
                                <Button 
                                    onClick={() => handleFinishInterview()} 
                                    disabled={isSubmitting} 
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-emerald-500/30 w-full sm:w-auto transition-all group"
                                >
                                    {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />}
                                    Finish Interview
                                </Button>
                            ) : (
                                <Button 
                                    onClick={handleNextQuestion} 
                                    disabled={isSubmitting}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg w-full sm:w-auto transition-all group"
                                >
                                    Next <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                    <p className="text-xs text-slate-500 mt-6 text-center">
                        Session ID: <span className="font-mono">{sessionId}</span>
                    </p>
                </motion.div>
            </div>
        </>
    );
}