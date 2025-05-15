"use client"
import Head from 'next/head';
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // For manual entry
import { Toaster, toast } from 'sonner'
import { Loader2, UploadCloud, PlusCircle, XCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

// Define types for resume data (can be moved to lib/types.ts)
interface Experience {
  id: string;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
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
  fullName: string;
  email: string;
  phone?: string;
  summary: string;
  skills: string[]; // Or string for comma-separated
  experiences: Experience[];
  educations: Education[];
  projects: Project[];
}


export default function GetStartedPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [manualData, setManualData] = useState<ManualResumeData>({
    fullName: '', email: '', summary: '', skills: [], experiences: [], educations: [], projects: []
  }); // Basic structure

  // --- Helper for unique IDs ---
  const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 9);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("File too large", {description: "Please upload a resume under 5MB.",
        });
        return;
      }
      if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        toast.error("Invalid file type", {description: "Please upload a PDF or DOCX file.", });
        return;
      }
      setResumeFile(file);
    }
  };

  const handleManualInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setManualData(prev => ({ ...prev, [name]: value }));
  };
  
  // Simplified add/remove for experiences/educations for brevity
  // In a real app, this would be more robust with unique IDs for list items
  const addExperience = () => {
    setManualData(prev => ({
      ...prev,
      experiences: [...prev.experiences, { id: generateId(), jobTitle: '', company: '', startDate: '', endDate: '', responsibilities: '' }]
    }));
  };

  const removeExperience = (id: string) => {
    setManualData(prev => ({
      ...prev,
      experiences: prev.experiences.filter(exp => exp.id !== id),
    }));
  };

  // const handleExperienceChange = (index: string, field: keyof Experience, value: string) => {
  //   setManualData(prev => {
  //     const newExperiences = [...prev.experiences];
  //     newExperiences[index] = { ...newExperiences[index], [field]: value };
  //     return { ...prev, experiences: newExperiences };
  //   });
  // };

  const handleExperienceChange = (id: string, field: keyof Omit<Experience, 'id'>, value: string) => {
    setManualData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const handleSkillsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const skillsArray = event.target.value.split(',').map(s => s.trim()).filter(s => s !== "");
    setManualData(prev => ({ ...prev, skills: skillsArray }));
  };


  const handleSubmitResume = async () => {
    if (!resumeFile) {
        toast.error("No file selected", {description: "Please select a resume file to upload.",});
        return;
    }
    setIsLoading(true);
    const formData = new FormData();
    formData.append('resume', resumeFile);

    try {
      const response = await fetch('/api/resume/process', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process resume');
      }
      
      // Store result.resumeData (parsed skills, etc.) in state/context or pass via router
      // For now, let's assume it returns a sessionId for the interview
      localStorage.setItem('resumeAnalysis', JSON.stringify(result.analysis)); // Store analysis
      router.push(`/interview/new`); // Or /interview/${result.sessionId}
      toast.success("Resume Processed!", {description: "Your interview is being prepared." });

    } catch (error: any) {
      toast.error("Error", {description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Project Handlers ---
  const addProject = () => {
    setManualData(prev => ({
      ...prev,
      projects: [...prev.projects, { id: generateId(), name: '', description: ''}],
    }));
  };

  const removeProject = (id: string) => {
    setManualData(prev => ({
      ...prev,
      projects: prev.projects.filter(proj => proj.id !== id),
    }));
  };

  const handleProjectChange = (id: string, field: keyof Omit<Project, 'id'>, value: string) => {
    setManualData(prev => ({
      ...prev,
      projects: prev.projects.map(proj =>
        proj.id === id ? { ...proj, [field]: value } : proj
      ),
    }));
  };


  // --- Education Handlers ---
  const addEducation = () => {
    setManualData(prev => ({
      ...prev,
      educations: [...prev.educations, { id: generateId(), degree: '', institution: '', year: '' }],
    }));
  };

  const removeEducation = (id: string) => {
    setManualData(prev => ({
      ...prev,
      educations: prev.educations.filter(edu => edu.id !== id),
    }));
  };

  const handleEducationChange = (id: string, field: keyof Omit<Education, 'id'>, value: string) => {
    setManualData(prev => ({
      ...prev,
      educations: prev.educations.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    }));
  };


  

  const handleSubmitManualData = async () => {
    setIsLoading(true);
    // Basic validation
    if (!manualData.fullName || !manualData.email || !manualData.summary || manualData.skills.length === 0) {
        toast.error("Missing Information", {description: "Please fill in all required fields." });
        setIsLoading(false);
        return;
    }

    try {
      const response = await fetch('/api/resume/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manualData }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process data');
      }
      localStorage.setItem('resumeAnalysis', JSON.stringify(result.analysis)); // Store analysis
      router.push(`/interview/new`);
      toast.success("Data Processed!", { description: "Your interview is being prepared." });

    } catch (error: any) {
      toast.error("Error", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      <Head>
        <title>Get Started - Interviewer AI</title>
        <meta name="description" content="Provide your details to start your AI-powered interview practice." />
      </Head>
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-background text-foreground min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "circOut" }}
          className="w-full"
        >
          <Card className="w-full max-w-2xl mx-auto shadow-2xl bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader className="text-center p-6 sm:p-8">
              <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold text-card-foreground">
                Let's Get to Know You
              </CardTitle>
              <CardDescription className="mt-2 text-sm sm:text-base text-muted-foreground">
                Provide your resume or fill in your details so we can tailor the interview.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-16 gap-2 p-1 bg-muted rounded-lg">
                  <TabsTrigger value="upload" className="py-2.5 text-sm sm:text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md">Upload Resume</TabsTrigger>
                  <TabsTrigger value="manual" className="py-2.5 text-sm sm:text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md">Enter Manually</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="mt-6 sm:mt-8">
                  {/* ... Upload Resume content remains the same ... */}
                  <div className="space-y-6">
                    <Label htmlFor="resume-file-input" className="text-base sm:text-lg font-medium text-card-foreground block text-center sm:text-left">
                      Upload your Resume (PDF or DocX)
                    </Label>
                    <div className="flex items-center justify-center w-full">
                        <label 
                            htmlFor="resume-file-input" 
                            className="flex flex-col items-center justify-center w-full min-h-[10rem] sm:min-h-[12rem] border-2 border-dashed border-muted-foreground/50 rounded-lg cursor-pointer bg-background/30 hover:bg-muted/50 transition-colors duration-200"
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-2">
                                <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10 mb-3 text-muted-foreground" />
                                <p className="mb-2 text-xs sm:text-sm text-muted-foreground">
                                  <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground/80">PDF, DOC, DOCX (MAX. 5MB)</p>
                            </div>
                            <Input id="resume-file-input" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
                        </label>
                    </div>
                    {resumeFile && (
                        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md text-center sm:text-left">
                            Selected file: <span className="font-semibold text-primary">{resumeFile.name}</span>
                        </div>
                    )}
                    <Button onClick={handleSubmitResume} disabled={isLoading || !resumeFile} className="w-full text-base sm:text-lg py-3 sm:py-3.5">
                      {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Process Resume & Start'}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="manual" className="mt-6 sm:mt-8">
                  <form onSubmit={handleSubmitManualData} className="space-y-6">
                    {/* --- Basic Info --- */}
                    <div>
                      <Label htmlFor="fullName" className="block text-sm font-medium mb-1.5 text-card-foreground">Full Name</Label>
                      <Input id="fullName" name="fullName" value={manualData.fullName} onChange={handleManualInputChange} required placeholder="e.g., Jane Doe" />
                    </div>
                    <div>
                      <Label htmlFor="email" className="block text-sm font-medium mb-1.5 text-card-foreground">Email</Label>
                      <Input id="email" name="email" type="email" value={manualData.email} onChange={handleManualInputChange} required placeholder="e.g., jane.doe@example.com" />
                    </div>
                    <div>
                      <Label htmlFor="summary" className="block text-sm font-medium mb-1.5 text-card-foreground">Summary / Objective</Label>
                      <Textarea id="summary" name="summary" value={manualData.summary} onChange={handleManualInputChange} required placeholder="A brief overview of your career goals and key skills..." rows={4} />
                    </div>
                    <div>
                      <Label htmlFor="skills" className="block text-sm font-medium mb-1.5 text-card-foreground">Skills (comma-separated)</Label>
                      <Input id="skills" name="skills" value={manualData.skills.join(', ')} onChange={handleSkillsChange} required placeholder="e.g., React, Node.js, Project Management" />
                    </div>
                    
                    {/* --- Experience Section --- */}
                    <div className="space-y-4 pt-2">
                        <div className="flex justify-between items-center border-b border-border/50 pb-2 mb-3">
                            <h4 className="text-lg font-semibold text-card-foreground">Experience</h4>
                            <Button type="button" variant="ghost" size="sm" onClick={addExperience} className="text-primary hover:text-primary/80">
                                <PlusCircle className="mr-2 h-4 w-4" /> Add
                            </Button>
                        </div>
                        {manualData.experiences.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-2">No experience added yet. Click "Add" to start.</p>
                        )}
                        {manualData.experiences.map((exp, id) => (
                            <div key={id} className="relative p-4 border border-border/50 rounded-lg space-y-3 bg-background/20 group">
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => removeExperience(exp.id)} 
                                    className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive opacity-50 group-hover:opacity-100 transition-opacity"
                                    aria-label="Remove experience"
                                >
                                    <XCircle className="h-5 w-5" />
                                </Button>
                                <Input placeholder="Job Title" aria-label="Job Title" value={exp.jobTitle} onChange={e => handleExperienceChange(exp.id, 'jobTitle', e.target.value)} className="text-base" />
                                <Input placeholder="Company" aria-label="Company" value={exp.company} onChange={e => handleExperienceChange(exp.id, 'company', e.target.value)} className="text-base" />
                                <Input placeholder="Start Date (MM YYYY)" aria-label="Start Date" value={exp.startDate} onChange={e => handleExperienceChange(exp.id, 'startDate', e.target.value)} className="text-base" />
                                <Input placeholder="End Date (MM YYYY)" aria-label="End Date" value={exp.endDate} onChange={e => handleExperienceChange(exp.id, 'endDate', e.target.value)} className="text-base" />
                                <div className="flex gap-3 items-center">
                                  <Switch id="currentJob" checked={exp.endDate === ''} onCheckedChange={(checked) => handleExperienceChange(exp.id, 'endDate', checked ? '' : exp.endDate)} />
                                  <Label htmlFor="currentJob" className="text-sm font-medium text-card-foreground">I currently work here</Label>
                                </div>
                                {/* Consider adding Textarea for responsibilities and date pickers */}
                            </div>
                        ))}
                    </div>
                    
                    {/* --- Education/Certification Section --- */}
                    <div className="space-y-4 pt-2">
                        <div className="flex justify-between items-center border-b border-border/50 pb-2 mb-3">
                            <h4 className="text-lg font-semibold text-card-foreground">Education & Certifications</h4>
                             <Button type="button" variant="ghost" size="sm" onClick={addEducation} className="text-primary hover:text-primary/80">
                                <PlusCircle className="mr-2 h-4 w-4" /> Add
                            </Button>
                        </div>
                        {manualData.educations.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-2">No education or certifications added yet. Click "Add" to start.</p>
                        )}
                        {manualData.educations.map((edu, id) => (
                            <div key={id} className="relative p-4 border border-border/50 rounded-lg space-y-3 bg-background/20 group">
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => removeEducation(edu.id)} 
                                    className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive opacity-50 group-hover:opacity-100 transition-opacity"
                                    aria-label="Remove education/certification"
                                >
                                    <XCircle className="h-5 w-5" />
                                </Button>
                                <Input placeholder="Degree or Certificate Name" aria-label="Degree or Certificate Name" value={edu.degree} onChange={e => handleEducationChange(edu.id, 'degree', e.target.value)} className="text-base" />
                                <Input placeholder="Institution or Issuing Body" aria-label="Institution or Issuing Body" value={edu.institution} onChange={e => handleEducationChange(edu.id, 'institution', e.target.value)} className="text-base" />
                                <Input placeholder="Year of Completion / Expiry" aria-label="Year of Completion or Expiry" value={edu.year} onChange={e => handleEducationChange(edu.id, 'year', e.target.value)} className="text-base" />
                                <div className="flex gap-3 items-center">
                                  <Switch id="currentJob" checked={edu.year === ''} onCheckedChange={(checked) => handleEducationChange(edu.id, 'year', checked ? '' : edu.year)} />
                                  <Label htmlFor="currentJob" className="text-sm font-medium text-card-foreground">I currently study here</Label>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* --- Project Section --- */}
                    <div className="space-y-4 pt-2">
                        <div className="flex justify-between items-center border-b border-border/50 pb-2 mb-3">
                            <h4 className="text-lg font-semibold text-card-foreground">Projects</h4>
                             <Button type="button" variant="ghost" size="sm" onClick={addProject} className="text-primary hover:text-primary/80">
                                <PlusCircle className="mr-2 h-4 w-4" /> Add
                            </Button>
                        </div>
                        {manualData.projects.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-2">No project added yet. Click "Add" to start.</p>
                        )}
                        {manualData.projects.map((proj, id) => (
                            <div key={id} className="relative p-4 border border-border/50 rounded-lg space-y-3 bg-background/20 group">
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => removeProject(proj.id as string)} 
                                    className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive opacity-50 group-hover:opacity-100 transition-opacity"
                                    aria-label="Remove project"
                                >
                                    <XCircle className="h-5 w-5" />
                                </Button>
                                <Input placeholder="Project Name" aria-label="Project Name" value={proj.name} onChange={e => handleProjectChange(proj.id, 'name', e.target.value)} className="text-base w-[92%]" />
                                <Textarea placeholder="Project Description" aria-label="Project Description" value={proj.description} onChange={e => handleProjectChange(proj.id, 'description', e.target.value)} className="text-base" />
                            </div>
                        ))}
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full text-base sm:text-lg py-3 sm:py-3.5 mt-4">
                      {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Submit Data & Start'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}

