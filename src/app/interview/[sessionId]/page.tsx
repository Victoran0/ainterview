"use client"
import Head from 'next/head';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress'; // For overall progress
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // For MCQ
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { toast } from "sonner";
import {motion} from 'motion/react';
import { InterviewSession, Question, InterviewSection, ResumeAnalysis } from '@/lib/types';
import { AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Loader2, TimerIcon } from 'lucide-react';

// Simple Timer Component
const SectionTimer = ({ durationMinutes, onTimeUp }: { durationMinutes: number, onTimeUp: () => void }) => {
    const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp();
            return;
        }
        const intervalId = setInterval(() => {
            setTimeLeft(prevTime => prevTime - 1);
        }, 1000);
        return () => clearInterval(intervalId);
    }, [timeLeft, onTimeUp]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className={`text-lg font-semibold p-2 rounded-md flex items-center ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-foreground'}`}>
            <TimerIcon className="mr-2 h-5 w-5" />
            Time Left: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </div>
    );
};


export default function InterviewPage() {
    const router = useRouter();
    const params = useParams();
    const sessionId = params.sessionId; // This would be 'new' or an actual ID

    const [interviewSession, setInterviewSession] = useState<InterviewSession | null>(null);
    const [currentAnswer, setCurrentAnswer] = useState<string | number>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [currentSection, setCurrentSection] = useState<InterviewSection | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [currentQuestionInSectionIndex, setCurrentQuestionInSectionIndex] = useState(0);


    // Fetch or initialize interview session
    useEffect(() => {
        console.log("Session ID:", sessionId);
        if (sessionId === 'new') { // Start a new interview
            const storedAnalysis = localStorage.getItem('resumeAnalysis');
            console.log("Stored Analysis:", storedAnalysis);
            if (!storedAnalysis) {
                toast.error("Error", {description: "Resume analysis not found. Please start over."});
                router.push('/get-started');
                return;
            }
            // const storedAnalysisJson: any = JSON.parse(storedAnalysis)
            // const id: string = storedAnalysisJson.id;
            // const resumeAnalysis: ResumeAnalysis = storedAnalysisJson.analysis;
            
            const startInterview = async () => {
                setIsLoading(true);
                try {
                    const response = await fetch('/api/start-interview', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: storedAnalysis,
                    });
                    if (!response.ok) {
                        const errData = await response.json();
                        throw new Error(errData.error || 'Failed to start interview');
                    }
                    const sessionData: InterviewSession = await response.json();
                    setInterviewSession(sessionData);
                    // Store session in localStorage to persist across refreshes (basic persistence)
                    localStorage.setItem(`interviewSession_${sessionData.sessionId}`, JSON.stringify(sessionData));
                    router.replace(`/interview/${sessionData.sessionId}`, undefined); // Update URL without reload
                    setIsLoading(false);
                } catch (err: any) {
                    setError(err.message);
                    toast.error("Error", {description: err.message});
                    setIsLoading(false);
                }
            };
            startInterview();

        } else if (typeof sessionId === 'string') { // Load existing session
            const storedSession = localStorage.getItem(`interviewSession_${sessionId}`);
            if (storedSession) {
                const session: InterviewSession = JSON.parse(storedSession);
                setInterviewSession(session);
                setIsLoading(false);
            } else {
                // Potentially fetch from backend if implementing server-side sessions
                setError("Interview session not found or expired.");
                toast.error("Error", {description: "Session not found. Please start over." });
                router.push('/get-started');
            }
        }
    }, [sessionId, router]);

    // Update current section and question when interviewSession or its indices change
    useEffect(() => {
        if (interviewSession) {
            const section = interviewSession.interviewStructure.sections[interviewSession.currentSectionIndex];
            setCurrentSection(section);
            if (section) {
                const question = section.questions[interviewSession.currentQuestionIndex];
                setCurrentQuestion(question);
                setCurrentQuestionInSectionIndex(interviewSession.currentQuestionIndex);
                // Reset answer field for new question
                const existingAnswer = interviewSession.answers[question?.id || ''];
                setCurrentAnswer(existingAnswer || '');
            } else {
                setCurrentQuestion(null); // No more sections or questions
            }
        }
    }, [interviewSession]);


    const saveAndProceed = (updatedSession: InterviewSession) => {
        setInterviewSession(updatedSession);
        localStorage.setItem(`interviewSession_${updatedSession.sessionId}`, JSON.stringify(updatedSession));
    };

    const handleNextQuestion = () => {
        if (!interviewSession || !currentSection || !currentQuestion) return;

        // Save current answer
        const updatedAnswers = { ...interviewSession.answers, [currentQuestion.id]: currentAnswer };
        let nextQuestionIndex = interviewSession.currentQuestionIndex + 1;
        let nextSectionIndex = interviewSession.currentSectionIndex;

        if (nextQuestionIndex >= currentSection.questions.length) {
            // Move to next section
            nextQuestionIndex = 0;
            nextSectionIndex++;
            if (nextSectionIndex >= interviewSession.interviewStructure.sections.length) {
                // End of interview
                handleFinishInterview(updatedAnswers);
                return;
            }
            toast.success( `Section Complete!`, {description: `Moving to ${interviewSession.interviewStructure.sections[nextSectionIndex].name}.`});
        }
        
        saveAndProceed({
            ...interviewSession,
            answers: updatedAnswers,
            currentQuestionIndex: nextQuestionIndex,
            currentSectionIndex: nextSectionIndex,
        });
        setCurrentAnswer(''); // Clear for next question
    };
    
    const handlePreviousQuestion = () => {
        if (!interviewSession || !currentSection || !currentQuestion) return;

        // Save current answer before moving
        const updatedAnswers = { ...interviewSession.answers, [currentQuestion.id]: currentAnswer };
        let prevQuestionIndex = interviewSession.currentQuestionIndex - 1;
        let prevSectionIndex = interviewSession.currentSectionIndex;

        if (prevQuestionIndex < 0) {
            // Move to previous section's last question
            prevSectionIndex--;
            if (prevSectionIndex < 0) {
                toast.warning( "Already at the first question.");
                return; // Already at the very beginning
            }
            prevQuestionIndex = interviewSession.interviewStructure.sections[prevSectionIndex].questions.length - 1;
            toast.warning( `Moving back`, {description: `Returning to ${interviewSession.interviewStructure.sections[prevSectionIndex].name}.`});
        }
        
        saveAndProceed({
            ...interviewSession,
            answers: updatedAnswers, // Save current answer even when going back
            currentQuestionIndex: prevQuestionIndex,
            currentSectionIndex: prevSectionIndex,
        });
        // setCurrentAnswer will be updated by useEffect based on the new currentQuestion
    };


    const handleTimeUp = useCallback(() => {
        if (!interviewSession || !currentSection) return;
        toast.error("Time's Up!", {description: `Time for section "${currentSection.name}" has expired. Moving to the next section.`,});
        
        // Save current answer if any
        const updatedAnswers = currentQuestion ? { ...interviewSession.answers, [currentQuestion.id]: currentAnswer } : interviewSession.answers;

        let nextQuestionIndex = 0;
        let nextSectionIndex = interviewSession.currentSectionIndex + 1;

        if (nextSectionIndex >= interviewSession.interviewStructure.sections.length) {
            handleFinishInterview(updatedAnswers);
            return;
        }
        
        saveAndProceed({
            ...interviewSession,
            answers: updatedAnswers,
            currentQuestionIndex: nextQuestionIndex,
            currentSectionIndex: nextSectionIndex,
        });
        setCurrentAnswer('');
    }, [interviewSession, currentSection, currentQuestion, currentAnswer, toast]);


    const handleFinishInterview = async (finalAnswers?: InterviewSession['answers']) => {
        if (!interviewSession) return;
        setIsSubmitting(true);
        const answersToSubmit = finalAnswers || interviewSession.answers;
        // Ensure the last answer is captured if finish is clicked directly
        if (currentQuestion && !finalAnswers) {
             answersToSubmit[currentQuestion.id] = currentAnswer;
        }

        const finalSessionState = {
            ...interviewSession,
            answers: answersToSubmit,
            // Mark interview as completed, maybe set endTime
        };
        localStorage.setItem(`interviewSession_${interviewSession.sessionId}`, JSON.stringify(finalSessionState));

        // Send all answers to the backend for evaluation
        try {
            const response = await fetch('/api/interview-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalSessionState), // Send the whole session or just answers + questions
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to submit interview for feedback.');
            }
            const feedbackResult = await response.json();
            // Store feedback in localStorage or pass via state to results page
            localStorage.setItem(`interviewResults_${interviewSession.sessionId}`, JSON.stringify(feedbackResult));
            router.push(`/results/${interviewSession.sessionId}`);
            toast.success( "Interview Submitted!", {description: "Your feedback is being generated." });
        } catch (err: any) {
            toast.error( "Submission Error", {description: err.message});
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-xl">Preparing your interview...</p>
            </div>
        );
    }

    if (error) {
         return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <p className="text-xl text-destructive">Error: {error}</p>
                <Button onClick={() => router.push('/get-started')} className="mt-4">Start Over</Button>
            </div>
        );
    }

    if (!interviewSession || !currentSection || !currentQuestion) {
        // This case should ideally be handled by isLoading or error, or redirect if interview is truly over
        // but if it's reached after loading and no error, it might mean interview ended.
        // Check if all sections are done
        if (interviewSession && interviewSession.currentSectionIndex >= interviewSession.interviewStructure.sections.length) {
            return (
                 <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                    <p className="text-xl">Interview Completed!</p>
                    <p className="text-muted-foreground mb-4">You should have been redirected to results. If not, click below.</p>
                    <Button onClick={() => router.push(`/results/${interviewSession.sessionId}`)} className="mt-4">View Results</Button>
                </div>
            );
        }
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-xl">Loading question...</p>
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
                <title>Interview in Progress - {currentSection.name}</title>
            </Head>
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4 md:p-8">
                <Card className="w-full max-w-3xl shadow-2xl">
                    <CardHeader>
                        <div className="flex justify-between items-center mb-2">
                            <CardTitle className="text-2xl md:text-3xl">
                                {currentSection.name}
                            </CardTitle>
                            {currentSection.timeLimitMinutes > 0 && (
                                <SectionTimer durationMinutes={currentSection.timeLimitMinutes} onTimeUp={handleTimeUp} />
                            )}
                        </div>
                        <CardDescription>
                            Question {currentQuestionInSectionIndex + 1} of {currentSection.questions.length}
                        </CardDescription>
                        <Progress value={overallProgress} className="w-full mt-2" />
                    </CardHeader>
                    <CardContent className="min-h-[250px] md:min-h-[300px] py-6">
                        <motion.div
                            key={currentQuestion.id} // Animate when question changes
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h3 className="text-lg md:text-xl font-semibold mb-4 whitespace-pre-wrap">{currentQuestion.text}</h3>
                            {currentQuestion.type === 'aptitude-mcq' && currentQuestion.options ? (
                                <RadioGroup
                                    value={currentAnswer as string}
                                    onValueChange={(val) => setCurrentAnswer(val)}
                                    className="space-y-2"
                                >
                                    {currentQuestion.options.map((option, index) => (
                                        <div key={index} className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted/50 transition-colors">
                                            <RadioGroupItem value={option} id={`option-${index}`} />
                                            <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">{option}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            ) : (
                                <Textarea
                                    value={currentAnswer as string}
                                    onChange={(e) => setCurrentAnswer(e.target.value)}
                                    placeholder="Type your answer here..."
                                    rows={8}
                                    className="text-base"
                                />
                            )}
                        </motion.div>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6">
                        <Button variant="outline" onClick={handlePreviousQuestion} disabled={isSubmitting || (interviewSession.currentSectionIndex === 0 && currentQuestionInSectionIndex === 0)}>
                            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                        </Button>
                        
                        {interviewSession.currentSectionIndex === interviewSession.interviewStructure.sections.length - 1 &&
                         currentQuestionInSectionIndex === currentSection.questions.length - 1 ? (
                            <Button onClick={() => handleFinishInterview()} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                Finish Interview
                            </Button>
                        ) : (
                            <Button onClick={handleNextQuestion} disabled={isSubmitting}>
                                Next <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </CardFooter>
                </Card>
                <p className="text-xs text-muted-foreground mt-4 text-center">Session ID: {sessionId}</p>
            </div>
        </>
    );
}