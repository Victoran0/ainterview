// app/resume/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { api } from '@/trpc/react'; 
import ResumeDisplayPage from './ResumeDisplayPage'; 
import CreateResume from './CreateResume';   
import { ResumeData } from '@/lib/types'; 
import { Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import EditResumeForm from './editResumeForm'; 

// Define the expected type for fetchedResumeData more precisely based on your tRPC output
// This should match the .output() of your getResumeAnalysis procedure
// type FetchedResumeDataType = (ResumeAnalysis & {
//   id: string;
//   experiences?: (ResumeAnalysis['experiences'] extends (infer E)[] | undefined ? (E & { id: string }) : never)[];
//   education?: (ResumeAnalysis['education'] extends (infer Ed)[] | undefined ? (Ed & { id: string }) : never)[];
//   projects?: (ResumeAnalysis['projects'] extends (infer P)[] | undefined ? (P & { id: string }) : never)[];
// }) | null;


type ViewMode = 'loading' | 'display' | 'edit' | 'create';

export default function ResumePageController() {
  const [viewMode, setViewMode] = useState<ViewMode>('loading');
  const [currentResumeData, setCurrentResumeData] = useState<ResumeData | null>(null);


  const utils = api.useUtils();

  const { data: resumeCheck, isLoading: isLoadingCheck, error: checkError } = api.manageDB.checkResumeExists.useQuery(
    undefined,
    {
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  const { 
    data: fetchedResumeData, 
    isLoading: isLoadingData, 
    refetch: refetchResumeData, 
    error: dataError,
    isSuccess: isDataSuccess, // New: Use this flag
    isError: isDataFetchError  // New: Use this flag
  } = api.manageDB.getResumeAnalysis.useQuery(
    undefined,
    {
      enabled: false, // Will be enabled manually
      retry: false,
      refetchOnWindowFocus: false,
      // onSuccess and onError are removed from here
    }
  );

  // Effect to trigger fetching resume data if it exists
  useEffect(() => {
    if (!isLoadingCheck && resumeCheck) { // Ensure resumeCheck is not undefined
      if (resumeCheck.exists) {
        refetchResumeData();
      } else {
        setViewMode('create');
        setCurrentResumeData(null);
      }
    }
  }, [resumeCheck, isLoadingCheck, refetchResumeData]);


  // Effect to handle the result of getResumeAnalysis
  useEffect(() => {
    // Only proceed if the query is enabled (i.e., refetchResumeData was called) and not loading
    if (resumeCheck?.exists && !isLoadingData) {
        if (isDataSuccess && fetchedResumeData) {
            setCurrentResumeData({
              skills: fetchedResumeData.skills as string[] || [],
              summary: fetchedResumeData.summary || '',
              experiences: fetchedResumeData.Experience,
              education: fetchedResumeData.Education,
              projects: fetchedResumeData.Project,
            }); // Apply the more specific type
            setViewMode('display');
        } else if (isDataFetchError || (isDataSuccess && !fetchedResumeData)) {
            // If error fetching, or success but no data (which implies an issue if checkResume.exists was true)
            // allow creation or show an error. For now, defaulting to create.
            toast.error("Failed to load resume details.", { description: dataError?.message || "No resume data found."});
            setViewMode('create');
            setCurrentResumeData(null);
        }
    }
  }, [isLoadingData, isDataSuccess, isDataFetchError, fetchedResumeData, dataError, resumeCheck?.exists]);


  const handleEdit = () => {
    if (currentResumeData) {
      setViewMode('edit');
    } else {
      setViewMode('create');
    }
  };

  const handleSaveSuccessFromEdit = (updatedData: ResumeData) => {
    // Update local state immediately for a smoother UX
    setCurrentResumeData(updatedData as ResumeData); // Ensure type compatibility
    setViewMode('display'); // Switch back to display mode

    // Optionally, you can still invalidate and refetch in the background
    // to ensure data consistency if other parts of the app might change it,
    // but for direct edits, updating local state first is often preferred.
    utils.manageDB.getResumeAnalysis.invalidate();
    utils.manageDB.checkResumeExists.invalidate(); // If the existence check might change
    toast.info("Resume data synced with server."); // Give feedback
  };

  const handleSaveSuccess = async () => {
    setViewMode('loading'); // Show loading indicator immediately
    await utils.manageDB.checkResumeExists.invalidate();
    // Instead of directly setting viewMode, let the useEffects handle it based on new data
    // Forcing a refetch of resumeCheck which will then trigger getResumeAnalysis if needed
    // This ensures the flow is consistent.
    // Or, more directly:
    const refetchResult = await refetchResumeData();
    if(refetchResult.isSuccess && refetchResult.data){
        setCurrentResumeData({
          skills: refetchResult.data.skills as string[] || [],
          summary: refetchResult.data.summary || '',
          experiences: refetchResult.data.Experience,
          education: refetchResult.data.Education,
          projects: refetchResult.data.Project,
        });
        setViewMode('display');
    } else {
        // If refetch fails or no data, go to create mode
        toast.error("Could not reload resume after saving.", { description: refetchResult.error?.message });
        setViewMode('create');
    }
  };

  const handleCancelEdit = () => {
    if(currentResumeData) {
        setViewMode('display');
    } else {
        setViewMode('create'); 
    }
  }

  const pageTransitionVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  if (viewMode === 'loading' || isLoadingCheck || (resumeCheck?.exists && isLoadingData && viewMode !== 'edit' && viewMode !== 'create') ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // ... (rest of your error handling and rendering logic for display/edit/create) ...
  // ... (make sure to import toast from 'sonner' if you use it) ...
  // Example of toast import:
  // import { toast } from 'sonner';


  return (
    <AnimatePresence mode="wait">
      {viewMode === 'display' && currentResumeData && (
        <motion.div /* ... */ >
          <ResumeDisplayPage resumeData={currentResumeData} onEdit={handleEdit} />
        </motion.div>
      )}
      {viewMode === 'edit' && currentResumeData && ( // Render EditResumeForm for 'edit'
         <motion.div
          key="edit-form" // Unique key for AnimatePresence
          initial="initial" animate="animate" exit="exit"
          variants={pageTransitionVariants}
          transition={{ duration: 0.3 }}
        >
          <EditResumeForm
            initialData={currentResumeData as ResumeData & { id: string }} // Ensure ID is passed
            onSaveSuccess={handleSaveSuccessFromEdit}
            onCancel={handleCancelEdit}
          />
        </motion.div>
      )}
      {viewMode === 'create' && ( // Keep UpdateResumePage for 'create'
         <motion.div /* ... */ >
          {/* <UpdateResumePage
            // initialData is undefined for create mode
            onSaveSuccess={handleSaveSuccess} // Original handleSaveSuccess for creation
            mode="create"
          /> */}
          <CreateResume 
            onSaveSuccess={handleSaveSuccess} // Original handleSaveSuccess for creation
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}