"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { api } from '@/trpc/react'; // Adjust path
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import AnimatedCircularProgress from '@/components/animatedCircularProgress'; // Adjust path
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PlusCircle, ClipboardList, Smile, Frown, Lightbulb, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { Interview } from '@/lib/types'; // Adjust path

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Animation Variants
const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.5 } },
};

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.4,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
};


export default function PastInterviewsPage() {
  const { data: interviews, isLoading, error } = api.manageDB.getPastInterviews.useQuery(undefined, {
    refetchOnWindowFocus: false, // Optional: depends on your needs
  });

  const renderSkeletons = () => (
    Array.from({ length: 3 }).map((_, index) => (
      <motion.div key={index} variants={itemVariants}>
        <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
          <CardHeader>
            <Skeleton className="h-6 w-3/4 mb-1" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-1 flex justify-center">
              <Skeleton className="w-32 h-32 rounded-full" />
            </div>
            <div className="md:col-span-2 space-y-4">
              <div>
                <Skeleton className="h-5 w-24 mb-2" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-28 rounded-full" />
                </div>
              </div>
              <div>
                <Skeleton className="h-5 w-28 mb-2" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
             <Skeleton className="h-8 w-full" />
          </CardFooter>
        </Card>
      </motion.div>
    ))
  );


  return (
    <motion.div
      className="container mx-auto min-h-screen py-12 px-4 md:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-slate-50"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.header
        className="flex flex-col md:flex-row justify-between items-center mb-10 md:mb-16"
        variants={headerVariants}
      >
        <div className="mb-6 md:mb-0 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400">
            Your Interview History
          </h1>
          <p className="text-lg text-slate-400 mt-2">
            Review your past performance and track your progress.
          </p>
        </div>
        <Link href="/interview/new" passHref> {/* Assuming '/interview/new' is the path to start an interview */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-300 ease-in-out group whitespace-nowrap">
              <PlusCircle className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
              Start New Interview
            </Button>
          </motion.div>
        </Link>
      </motion.header>

      {error && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}}>
            <Alert variant="destructive" className="bg-red-900/30 border-red-700 text-red-300">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <AlertTitle className="font-semibold text-red-200">Error Loading Interviews</AlertTitle>
                <AlertDescription>
                    There was a problem fetching your past interviews. Please try again later.
                    <p className="text-xs mt-1">({error.message})</p>
                </AlertDescription>
            </Alert>
        </motion.div>
      )}

      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8"
      >
        {isLoading && !error && renderSkeletons()}

        {!isLoading && !error && interviews && interviews.length === 0 && (
          <motion.div className="lg:col-span-2" initial={{opacity:0}} animate={{opacity:1}}>
            <Alert className="bg-slate-800/60 border-slate-700 text-slate-300">
                <Info className="h-5 w-5 text-sky-400" />
                <AlertTitle className="font-semibold text-sky-300">No Interviews Yet!</AlertTitle>
                <AlertDescription>
                You haven't completed any interviews. Click "Start New Interview" to begin your practice.
                </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {!isLoading && !error && interviews && interviews.map((interview: Interview, index: number) => (
          <motion.div key={interview.id} variants={itemVariants} whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }} transition={{type: "spring", stiffness: 300}}>
            <Card className="bg-slate-800/50 border-slate-700 shadow-lg hover:shadow-primary/20 transition-shadow duration-300 flex flex-col h-full overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl md:text-2xl font-semibold text-slate-100">
                  Interview #{interviews.length - index}
                </CardTitle>
                <CardDescription className="text-sm text-slate-400">
                  Completed on: {formatDate(interview.createdAt)}
                </CardDescription>
              </CardHeader>
              <Separator className="bg-slate-700" />
              <CardContent className="pt-6 grid md:grid-cols-3 gap-6 items-start flex-grow">
                <div className="md:col-span-1 flex flex-col items-center justify-start">
                  <AnimatedCircularProgress percentage={interview.overallScorePercentage} />
                  <p className="mt-2 text-sm text-slate-400 font-medium">Overall Score</p>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h4 className="text-md font-semibold text-green-400 mb-2 flex items-center">
                      <CheckCircle2 className="mr-2 h-5 w-5" /> Strengths
                    </h4>
                    {interview.strengths.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                        {interview.strengths.map((strength, i) => (
                            <Badge key={i} variant="outline" className="bg-green-500/10 text-green-300 border-green-500/30 text-xs sm:text-sm">
                            {strength}
                            </Badge>
                        ))}
                        </div>
                    ) : <p className="text-sm text-slate-500 italic">No specific strengths highlighted.</p>}
                  </div>
                  <div>
                    <h4 className="text-md font-semibold text-yellow-400 mb-2 flex items-center">
                      <AlertTriangle className="mr-2 h-5 w-5" /> Areas for Improvement
                    </h4>
                     {interview.weaknesses.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                        {interview.weaknesses.map((weakness, i) => (
                            <Badge key={i} variant="outline" className="bg-yellow-500/10 text-yellow-300 border-yellow-500/30 text-xs sm:text-sm">
                            {weakness}
                            </Badge>
                        ))}
                        </div>
                     ) : <p className="text-sm text-slate-500 italic">No specific weaknesses highlighted.</p>}
                  </div>
                </div>
              </CardContent>
              {interview.studyPlanSummary && (
                <>
                <Separator className="bg-slate-700 mt-auto"/>
                <CardFooter className="pt-4 pb-6 bg-slate-800/30">
                    <div>
                        <h4 className="text-md font-semibold text-sky-400 mb-1 flex items-center">
                            <Lightbulb className="mr-2 h-5 w-5" /> Study Plan
                        </h4>
                        <p className="text-sm text-slate-300 leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                            {interview.studyPlanSummary}
                        </p>
                    </div>
                </CardFooter>
                </>
              )}
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}