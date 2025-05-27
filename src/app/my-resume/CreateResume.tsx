// components/MyResumeForm.tsx (or whatever you name this file)
"use client"
import Head from 'next/head';
import React, { useState, ChangeEvent, FormEvent } from 'react';
// useRouter is not used in the provided logic for onSaveSuccess, so can be removed if not needed elsewhere
// import { useRouter } from 'next/navigation'; 
import { AnimatePresence, motion } from 'framer-motion'; // Corrected framer-motion import
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, UploadCloud, PlusCircle, XCircle as TrashIcon, User, Sparkles, Briefcase, GraduationCap, Lightbulb } from 'lucide-react'; // Renamed XCircle to TrashIcon for clarity, added section icons
import { Switch } from '@/components/ui/switch';

// --- Internal Type Definitions (as provided) ---
interface Experience {
  id: string;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  responsibilities: string; // Note: Our other designs used string[] for responsibilities. This uses string.
}
interface Education {
  id: string;
  degree: string;
  institution: string;
  year: string;
}
interface Project {
  id: string;
  name: string;
  description: string;
}
interface ManualResumeData {
  summary: string;
  skills: string[]; // This is an array, but skillsInput is a string. Handled in submit.
  experiences: Experience[];
  educations: Education[];
  projects: Project[];
}

interface MyResumeProps {
  onSaveSuccess: () => void;
  // mode prop was in your interface, but not used in the provided logic.
  // If it's for distinguishing create/edit, this component seems geared for creation.
  // For simplicity, I'll assume it's primarily for creation based on the UI.
}

// --- Animation Variants (can be shared or component-specific) ---
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const listItemVariants = {
    initial: { opacity: 0, height: 0, y: -10 },
    animate: { opacity: 1, height: 'auto', y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { opacity: 0, height: 0, y: -10, transition: { duration: 0.2 } },
};

export default function MyResumeForm({ onSaveSuccess }: MyResumeProps) {
  // const router = useRouter(); // Remove if not used
  const [isLoading, setIsLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [manualData, setManualData] = useState<ManualResumeData>({
    summary: '', skills: [], experiences: [], educations: [], projects: []
  });
  const [skillsInput, setSkillsInput] = useState<string>('');

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2, 9); // Corrected ID generation

  // --- Event Handlers (Keep existing logic) ---
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large", { description: "Please upload a resume under 5MB."});
        return;
      }
      if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        toast.error("Invalid file type", { description: "Please upload a PDF or DOCX file."});
        return;
      }
      setResumeFile(file);
      toast.info("File selected", { description: file.name });
    }
  };

  const handleManualInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Assuming 'summary' is the only top-level text field in manualData based on current structure
    if (name === 'summary') {
        setManualData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const addExperience = () => {
    setManualData(prev => ({ ...prev, experiences: [...prev.experiences, { id: generateId(), jobTitle: '', company: '', startDate: '', endDate: '', responsibilities: '' }] }));
  };
  const removeExperience = (id: string) => {
    setManualData(prev => ({ ...prev, experiences: prev.experiences.filter(exp => exp.id !== id) }));
  };
  const handleExperienceChange = (id: string, field: keyof Omit<Experience, 'id'>, value: string) => {
    setManualData(prev => ({ ...prev, experiences: prev.experiences.map(exp => exp.id === id ? { ...exp, [field]: value } : exp) }));
  };

  const handleSkillsInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSkillsInput(event.target.value);
  };

  const addProject = () => {
    setManualData(prev => ({ ...prev, projects: [...prev.projects, { id: generateId(), name: '', description: ''}] }));
  };
  const removeProject = (id: string) => {
    setManualData(prev => ({ ...prev, projects: prev.projects.filter(proj => proj.id !== id) }));
  };
  const handleProjectChange = (id: string, field: keyof Omit<Project, 'id'>, value: string) => {
    setManualData(prev => ({ ...prev, projects: prev.projects.map(proj => proj.id === id ? { ...proj, [field]: value } : proj) }));
  };

  const addEducation = () => {
    setManualData(prev => ({ ...prev, educations: [...prev.educations, { id: generateId(), degree: '', institution: '', year: '' }] }));
  };
  const removeEducation = (id: string) => {
    setManualData(prev => ({ ...prev, educations: prev.educations.filter(edu => edu.id !== id) }));
  };
  const handleEducationChange = (id: string, field: keyof Omit<Education, 'id'>, value: string) => {
    setManualData(prev => ({ ...prev, educations: prev.educations.map(edu => edu.id === id ? { ...edu, [field]: value } : edu) }));
  };

  // --- Submit Handlers (Keep existing logic, ensure onSaveSuccess is called) ---
  const handleSubmitResume = async () => {
    if (!resumeFile) {
        toast.error("No file selected", {description: "Please select a resume file to upload."});
        return;
    }
    setIsLoading(true);
    const formData = new FormData();
    formData.append('resume', resumeFile);
    toast.info("Processing Resume...", {description: "Please wait while we analyze your resume." }); // Updated toast message
    try {
      const response = await fetch('/api/process-resume', { method: 'POST', body: formData });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to process resume');
      toast.success(result.message || "Resume processed successfully!");
      onSaveSuccess();
    } catch (error: any) {
      toast.error("Upload Error", {description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitManualData = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const skillsArray = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
    // Construct dataToSubmit using the component's internal ManualResumeData structure
    const dataToSubmit = {
      summary: manualData.summary,
      skills: skillsArray, // skillsInput is converted to array here
      experiences: manualData.experiences,
      educations: manualData.educations,
      projects: manualData.projects,
    };
  
    setIsLoading(true);
    if (!dataToSubmit.summary || dataToSubmit.skills.length === 0) {
        toast.error("Missing Information", {description: "Summary and at least one skill are required." });
        setIsLoading(false);
        return;
    }
    toast.info("Saving Data...", {description: "Please wait while we save your information." }); // Updated toast message
    try {
      // This fetch call remains as per your original logic.
      // It sends `dataToSubmit` which includes the `skills` array.
      const response = await fetch('/api/process-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataToSubmit }), // Sending the structured data
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to process data');
      toast.success(result.message || "Data saved successfully!");
      onSaveSuccess();
    } catch (error: any) {
      toast.error("Save Error", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create Your Profile - AI Interviewer</title>
        <meta name="description" content="Provide your resume details to get started." />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "circOut" }}
          className="w-full max-w-3xl" // Wider for better form layout
        >
          <Card className="bg-slate-800/70 border-slate-700 shadow-2xl backdrop-blur-md">
            <CardHeader className="text-center p-6 sm:p-8">
              <motion.h1 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness:150 }}
                className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"
              >
                Build Your Profile
              </motion.h1>
              <CardDescription className="mt-2 text-base text-slate-400">
                Upload your resume or fill in the details manually to get started.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-16 gap-2 p-1.5 bg-slate-700/50 rounded-lg mb-8">
                  <TabsTrigger 
                    value="upload" 
                    className="py-3 text-sm sm:text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl rounded-md transition-all duration-200 ease-in-out"
                  >
                    <UploadCloud className="mr-2 h-5 w-5 opacity-80" /> Upload Resume
                  </TabsTrigger>
                  <TabsTrigger 
                    value="manual" 
                    className="py-3 text-sm sm:text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl rounded-md transition-all duration-200 ease-in-out"
                  >
                    <User className="mr-2 h-5 w-5 opacity-80" /> Enter Manually
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-8"
                  >
                    <Label htmlFor="resume-file-input" className="text-lg font-semibold text-slate-200 block text-center">
                      Upload your Resume (PDF or DOCX)
                    </Label>
                    <div className="flex items-center justify-center w-full">
                        <label 
                            htmlFor="resume-file-input" 
                            className="flex flex-col items-center justify-center w-full min-h-[12rem] border-2 border-dashed border-slate-600 hover:border-primary rounded-xl cursor-pointer bg-slate-700/30 hover:bg-slate-700/50 transition-all duration-200 group p-6"
                        >
                            <UploadCloud className="w-12 h-12 mb-4 text-slate-400 group-hover:text-primary transition-colors" />
                            <p className="mb-2 text-base text-slate-300 group-hover:text-slate-100">
                              <span className="font-semibold text-primary">
                                Click to {resumeFile ? "change" : "upload"}
                              </span> or drag & drop
                            </p>
                            <p className="text-xs text-slate-500">PDF, DOC, DOCX (MAX. 5MB)</p>
                            <Input id="resume-file-input" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
                        </label>
                    </div>
                    {resumeFile && (
                        <motion.div 
                            initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}
                            className="text-sm text-slate-300 bg-slate-700/50 p-3 rounded-md text-center"
                        >
                            Selected: <span className="font-semibold text-primary">{resumeFile.name}</span>
                        </motion.div>
                    )}
                    <Button onClick={handleSubmitResume} disabled={isLoading || !resumeFile} className="w-full text-lg py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-pink-500/30 transition-all duration-300">
                      {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Process & Save Resume'}
                    </Button>
                  </motion.div>
                </TabsContent>

                <TabsContent value="manual">
                  <motion.form 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    onSubmit={handleSubmitManualData} className="space-y-10"
                  >
                    {/* Summary Section */}
                    <motion.div variants={sectionVariants}>
                        <Card className="bg-slate-700/40 border-slate-600 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center text-xl font-semibold text-sky-400">
                            <User className="mr-2.5 h-6 w-6" /> Summary / Objective
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Label htmlFor="summary" className="sr-only">Summary</Label>
                            <Textarea id="summary" name="summary" value={manualData.summary} onChange={handleManualInputChange} required placeholder="A brief overview of your career goals and key skills..." rows={4} className="bg-slate-600/50 border-slate-500 text-slate-100 focus:border-sky-500 placeholder-slate-400" />
                        </CardContent>
                        </Card>
                    </motion.div>

                    {/* Skills Section */}
                    <motion.div variants={sectionVariants} transition={{delay:0.05}}>
                        <Card className="bg-slate-700/40 border-slate-600 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center text-xl font-semibold text-emerald-400">
                            <Sparkles className="mr-2.5 h-6 w-6" /> Skills
                            </CardTitle>
                            <CardDescription className="text-slate-400 text-sm">Enter skills separated by commas.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Label htmlFor="skillsInput" className="sr-only">Skills</Label>
                            <Input id="skillsInput" name="skillsInput" value={skillsInput} onChange={handleSkillsInputChange} required placeholder="e.g., JavaScript, React, Node.js" className="bg-slate-600/50 border-slate-500 text-slate-100 focus:border-emerald-500 placeholder-slate-400" />
                        </CardContent>
                        </Card>
                    </motion.div>
                    
                    {/* --- Experience Section --- */}
                    <motion.div variants={sectionVariants} transition={{delay:0.1}}>
                        <Card className="bg-slate-700/40 border-slate-600 shadow-lg">
                        <CardHeader className="flex flex-row justify-between items-center">
                            <CardTitle className="flex items-center text-xl font-semibold text-amber-400">
                            <Briefcase className="mr-2.5 h-6 w-6" /> Professional Experience
                            </CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={addExperience} className="text-amber-300 border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-200">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {manualData.experiences.length > 0 ? (
                                <AnimatePresence>
                                {manualData.experiences.map((exp) => ( // Using exp.id as key
                                    <motion.div key={exp.id} variants={listItemVariants} initial="initial" animate="animate" exit="exit" className="p-4 border border-slate-600 rounded-lg bg-slate-600/20 space-y-3 relative group">
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeExperience(exp.id)} className="absolute top-1.5 right-1.5 h-7 w-7 text-slate-400 hover:text-red-400 opacity-50 group-hover:opacity-100 transition-opacity">
                                            <TrashIcon className="h-4 w-4" />
                                        </Button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div><Label htmlFor={`exp-jobTitle-${exp.id}`} className="text-slate-300 mb-1 block text-xs">Job Title</Label><Input id={`exp-jobTitle-${exp.id}`} value={exp.jobTitle} onChange={e => handleExperienceChange(exp.id, 'jobTitle', e.target.value)} className="bg-slate-500/40 border-slate-500/70" /></div>
                                            <div><Label htmlFor={`exp-company-${exp.id}`} className="text-slate-300 mb-1 block text-xs">Company</Label><Input id={`exp-company-${exp.id}`} value={exp.company} onChange={e => handleExperienceChange(exp.id, 'company', e.target.value)} className="bg-slate-500/40 border-slate-500/70" /></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div><Label htmlFor={`exp-startDate-${exp.id}`} className="text-slate-300 mb-1 block text-xs">Start Date</Label><Input id={`exp-startDate-${exp.id}`} value={exp.startDate} onChange={e => handleExperienceChange(exp.id, 'startDate', e.target.value)} placeholder="MM/YYYY" className="bg-slate-500/40 border-slate-500/70" /></div>
                                            <div><Label htmlFor={`exp-endDate-${exp.id}`} className="text-slate-300 mb-1 block text-xs">End Date (or "Present")</Label><Input id={`exp-endDate-${exp.id}`} value={exp.endDate} onChange={e => handleExperienceChange(exp.id, 'endDate', e.target.value)} placeholder="MM/YYYY or Present" className="bg-slate-500/40 border-slate-500/70" /></div>
                                        </div>
                                        <div>
                                            <Label htmlFor={`exp-responsibilities-${exp.id}`} className="text-slate-300 mb-1 block text-xs">Responsibilities</Label>
                                            <Textarea id={`exp-responsibilities-${exp.id}`} value={exp.responsibilities} onChange={e => handleExperienceChange(exp.id, 'responsibilities', e.target.value)} rows={3} placeholder="Describe your key responsibilities and achievements..." className="bg-slate-500/40 border-slate-500/70" />
                                        </div>
                                        {/* Switch for "I currently work here" - kept from original */}
                                        <div className="flex items-center gap-2 pt-1">
                                            <Switch id={`currentJob-${exp.id}`} checked={exp.endDate.toLowerCase() === 'present' || exp.endDate === new Date().toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' })} onCheckedChange={(checked) => handleExperienceChange(exp.id, 'endDate', checked ? 'Present' : '')} />
                                            <Label htmlFor={`currentJob-${exp.id}`} className="text-sm text-slate-300">I currently work here</Label>
                                        </div>
                                    </motion.div>
                                ))}
                                </AnimatePresence>
                            ) : <p className="text-sm text-slate-400 text-center py-2">No experience added yet.</p>}
                        </CardContent>
                        </Card>
                    </motion.div>
                    
                    {/* --- Education Section --- */}
                    <motion.div variants={sectionVariants} transition={{delay:0.15}}>
                        <Card className="bg-slate-700/40 border-slate-600 shadow-lg">
                        <CardHeader className="flex flex-row justify-between items-center">
                            <CardTitle className="flex items-center text-xl font-semibold text-rose-400">
                            <GraduationCap className="mr-2.5 h-6 w-6" /> Education
                            </CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={addEducation} className="text-rose-300 border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-200">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             {manualData.educations.length > 0 ? (
                                <AnimatePresence>
                                {manualData.educations.map((edu) => ( // Using edu.id as key
                                    <motion.div key={edu.id} variants={listItemVariants} initial="initial" animate="animate" exit="exit" className="p-4 border border-slate-600 rounded-lg bg-slate-600/20 space-y-3 relative group">
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeEducation(edu.id)} className="absolute top-1.5 right-1.5 h-7 w-7 text-slate-400 hover:text-red-400 opacity-50 group-hover:opacity-100 transition-opacity"><TrashIcon className="h-4 w-4" /></Button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div><Label htmlFor={`edu-degree-${edu.id}`} className="text-slate-300 mb-1 block text-xs">Degree/Certificate</Label><Input id={`edu-degree-${edu.id}`} value={edu.degree} onChange={e => handleEducationChange(edu.id, 'degree', e.target.value)} className="bg-slate-500/40 border-slate-500/70" /></div>
                                            <div><Label htmlFor={`edu-institution-${edu.id}`} className="text-slate-300 mb-1 block text-xs">Institution</Label><Input id={`edu-institution-${edu.id}`} value={edu.institution} onChange={e => handleEducationChange(edu.id, 'institution', e.target.value)} className="bg-slate-500/40 border-slate-500/70" /></div>
                                        </div>
                                        <div><Label htmlFor={`edu-year-${edu.id}`} className="text-slate-300 mb-1 block text-xs">Year of Completion/Expiry</Label><Input id={`edu-year-${edu.id}`} value={edu.year} onChange={e => handleEducationChange(edu.id, 'year', e.target.value)} placeholder="YYYY or 'Still Attending'" className="bg-slate-500/40 border-slate-500/70" /></div>
                                        {/* Switch for "I currently study here" - kept from original */}
                                        <div className="flex items-center gap-2 pt-1">
                                            <Switch id={`currentStudy-${edu.id}`} checked={edu.year.toLowerCase() === 'still attending'} onCheckedChange={(checked) => handleEducationChange(edu.id, 'year', checked ? 'Still Attending' : '')} />
                                            <Label htmlFor={`currentStudy-${edu.id}`} className="text-sm text-slate-300">I currently study here</Label>
                                        </div>
                                    </motion.div>
                                ))}
                                </AnimatePresence>
                            ) : <p className="text-sm text-slate-400 text-center py-2">No education entries added yet.</p>}
                        </CardContent>
                        </Card>
                    </motion.div>

                    {/* --- Project Section --- */}
                    <motion.div variants={sectionVariants} transition={{delay:0.2}}>
                        <Card className="bg-slate-700/40 border-slate-600 shadow-lg">
                        <CardHeader className="flex flex-row justify-between items-center">
                            <CardTitle className="flex items-center text-xl font-semibold text-teal-400">
                            <Lightbulb className="mr-2.5 h-6 w-6" /> Projects
                            </CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={addProject} className="text-teal-300 border-teal-500/50 hover:bg-teal-500/10 hover:text-teal-200">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {manualData.projects.length > 0 ? (
                                <AnimatePresence>
                                {manualData.projects.map((proj) => ( // Using proj.id as key
                                    <motion.div key={proj.id} variants={listItemVariants} initial="initial" animate="animate" exit="exit" className="p-4 border border-slate-600 rounded-lg bg-slate-600/20 space-y-3 relative group">
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeProject(proj.id)} className="absolute top-1.5 right-1.5 h-7 w-7 text-slate-400 hover:text-red-400 opacity-50 group-hover:opacity-100 transition-opacity"><TrashIcon className="h-4 w-4" /></Button>
                                        <div><Label htmlFor={`proj-name-${proj.id}`} className="text-slate-300 mb-1 block text-xs">Project Name</Label><Input id={`proj-name-${proj.id}`} value={proj.name} onChange={e => handleProjectChange(proj.id, 'name', e.target.value)} className="bg-slate-500/40 border-slate-500/70" /></div>
                                        <div><Label htmlFor={`proj-desc-${proj.id}`} className="text-slate-300 mb-1 block text-xs">Description</Label><Textarea id={`proj-desc-${proj.id}`} value={proj.description} onChange={e => handleProjectChange(proj.id, 'description', e.target.value)} rows={2} className="bg-slate-500/40 border-slate-500/70" /></div>
                                    </motion.div>
                                ))}
                                </AnimatePresence>
                            ) : <p className="text-sm text-slate-400 text-center py-2">No projects added yet.</p>}
                        </CardContent>
                        </Card>
                    </motion.div>

                    <Button type="submit" disabled={isLoading} className="w-full text-lg py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-pink-500/30 transition-all duration-300 mt-8">
                      {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Save My Resume'}
                    </Button>
                  </motion.form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}