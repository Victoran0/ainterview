// components/UpdateResumePage.tsx (renamed from update-resume.tsx for clarity if you prefer)
"use client";
import Head from 'next/head';
import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion'; // Corrected import
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, UploadCloud, PlusCircle, XCircle, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { api } from '@/trpc/react';
import { ResumeAnalysis, ResumeAnalysisSchema, FormExperience, FormEducation, FormProject, ManualResumeFormData } from '@/lib/types'; // Adjust path

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

interface UpdateResumePageProps {
  initialData?: ResumeAnalysis & { id?: string }; // ResumeAnalysis might include the DB ID
  onSaveSuccess: () => void; // Callback after successful save/update
  onCancel?: () => void; // Optional: if you want a cancel button to go back
  mode: 'create' | 'edit';
}

export default function UpdateResumePage({ initialData, onSaveSuccess, onCancel, mode }: UpdateResumePageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState<ManualResumeFormData>({
    summary: '',
    skillsInput: '', // For comma-separated input
    experiences: [],
    education: [],
    projects: [],
  });

  const createResumeMutation = api.manageDB.createResumeAnalysis.useMutation();
  const updateResumeMutation = api.manageDB.updateResumeAnalysis.useMutation();

  useEffect(() => {
    if (initialData) {
      setFormData({
        summary: initialData.summary || '',
        skillsInput: initialData.skills?.join(', ') || '',
        experiences: initialData.experiences?.map(exp => ({ ...exp, localId: generateId(), responsibilities: exp.responsibilities || [] })) || [],
        education: initialData.education?.map(edu => ({ ...edu, localId: generateId() })) || [],
        projects: initialData.projects?.map(proj => ({ ...proj, localId: generateId() })) || [],
      });
    }
  }, [initialData]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // ... (keep existing file change logic)
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 5 * 1024 * 1024) { 
        toast.error("File too large", {description: "Please upload a resume under 5MB."});
        return;
      }
      if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        toast.error("Invalid file type", {description: "Please upload a PDF or DOCX file."});
        return;
      }
      setResumeFile(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // --- Experience Handlers ---
  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experiences: [...prev.experiences, { localId: generateId(), jobTitle: '', company: '', duration: '', responsibilities: [''] }]
    }));
  };
  const removeExperience = (localId: string) => {
    setFormData(prev => ({ ...prev, experiences: prev.experiences.filter(exp => exp.localId !== localId) }));
  };
  const handleExperienceChange = (localId: string, field: keyof Omit<FormExperience, 'localId' | 'responsibilities'>, value: string) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp => exp.localId === localId ? { ...exp, [field]: value } : exp),
    }));
  };
  const addExperienceResponsibility = (expLocalId: string) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp =>
        exp.localId === expLocalId ? { ...exp, responsibilities: [...exp.responsibilities, ''] } : exp
      ),
    }));
  };
  const handleExperienceResponsibilityChange = (expLocalId: string, respIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp =>
        exp.localId === expLocalId
          ? { ...exp, responsibilities: exp.responsibilities.map((r, i) => (i === respIndex ? value : r)) }
          : exp
      ),
    }));
  };
  const removeExperienceResponsibility = (expLocalId: string, respIndex: number) => {
     setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp =>
        exp.localId === expLocalId
          ? { ...exp, responsibilities: exp.responsibilities.filter((_, i) => i !== respIndex) }
          : exp
      ),
    }));
  };


  // --- Education Handlers ---
  const addEducation = () => {
    setFormData(prev => ({ ...prev, education: [...prev.education, { localId: generateId(), degree: '', institution: '', graduationYear: '' }] }));
  };
  const removeEducation = (localId: string) => {
    setFormData(prev => ({ ...prev, education: prev.education.filter(edu => edu.localId !== localId) }));
  };
  const handleEducationChange = (localId: string, field: keyof Omit<FormEducation, 'localId'>, value: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map(edu => edu.localId === localId ? { ...edu, [field]: value } : edu),
    }));
  };
  
  // --- Project Handlers ---
  const addProject = () => {
    setFormData(prev => ({ ...prev, projects: [...prev.projects, { localId: generateId(), name: '', description: '' }] }));
  };
  const removeProject = (localId: string) => {
    setFormData(prev => ({ ...prev, projects: prev.projects.filter(proj => proj.localId !== localId) }));
  };
  const handleProjectChange = (localId: string, field: keyof Omit<FormProject, 'localId'>, value: string) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.map(proj => proj.localId === localId ? { ...proj, [field]: value } : proj),
    }));
  };


  const handleSubmitResumeFile = async () => {
    // This part can still use your existing /api/process-resume if it creates the ResumeAnalysis entry
    // Or, you can adapt it to use a tRPC mutation that takes FormData
    if (!resumeFile) {
      toast.error("No file selected", { description: "Please select a resume file to upload." });
      return;
    }
    setIsLoading(true);
    const apiFormData = new FormData();
    apiFormData.append('resume', resumeFile);
    toast.info("Processing Resume...", { description: "Please wait while we process your resume." });
    try {
      const response = await fetch('/api/process-resume', { // Assuming this API route creates the resume in DB
        method: 'POST',
        body: apiFormData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to process resume');
      toast.success(result.message || "Resume processed successfully!");
      onSaveSuccess(); // Notify parent
    } catch (error: any) {
      toast.error("Upload Error", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitManualData = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const skillsArray = formData.skillsInput.split(',').map(s => s.trim()).filter(Boolean);
    const dataToSubmit: ResumeAnalysis & {id?: string} = {
      ...(initialData?.id && { id: initialData.id }), // Include resume ID if editing
      summary: formData.summary,
      skills: skillsArray,
      experiences: formData.experiences.map(({ localId, ...exp }) => ({...exp, responsibilities: exp.responsibilities.filter(r => r.trim() !== '')})), // remove localId for submission
      education: formData.education.map(({ localId, ...edu }) => edu),
      projects: formData.projects.map(({ localId, ...proj }) => proj),
    };
    
    // Validate with Zod before submitting
    const validationResult = ResumeAnalysisSchema.safeParse(dataToSubmit);
    if (!validationResult.success) {
        console.error("Validation Errors:", validationResult.error.flatten().fieldErrors);
        Object.values(validationResult.error.flatten().fieldErrors).forEach((errors: any) => {
            if (Array.isArray(errors)) {
                errors.forEach(error => toast.error("Validation Error", { description: error }));
            }
        });
        // More specific error handling can be added here, e.g. focusing on the first invalid field.
        toast.error("Validation Failed", { description: "Please check your input fields."});
        setIsLoading(false);
        return;
    }

    try {
      if (mode === 'edit' && initialData?.id) {
        await updateResumeMutation.mutateAsync(
          { ...validationResult.data, id: initialData.id }, // Ensure ID is passed for update
          {
            onSuccess: (res) => {
              toast.success(res.message || "Resume updated successfully!");
              onSaveSuccess();
            },
            onError: (err) => {
              toast.error("Update Failed", { description: err.message });
            }
          }
        );
      } else { // Create mode
        await createResumeMutation.mutateAsync(
          validationResult.data,
          {
            onSuccess: (res) => {
              toast.success(res.message || "Resume saved successfully!");
              onSaveSuccess();
            },
            onError: (err) => {
              toast.error("Save Failed", { description: err.message });
            }
          }
        );
      }
    } catch (error: any) { // This catch might not be strictly necessary with react-query's onError
      toast.error("Submission Error", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Simplified UI for brevity, focusing on structure
  return (
    <>
      <Head>
        <title>{mode === 'edit' ? "Edit Resume" : "Add Your Resume"} - Interviewer AI</title>
        <meta name="description" content="Provide your details so we can tailor the interview." />
      </Head>
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-background text-foreground min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "circOut" }}
          className="w-full"
        >
          <Card className="w-full max-w-3xl mx-auto shadow-2xl bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader className="text-center p-6 sm:p-8">
              <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold text-card-foreground">
                {mode === 'edit' ? "Update Your Resume" : "Let's Get to Know You"}
              </CardTitle>
              <CardDescription className="mt-2 text-sm sm:text-base text-muted-foreground">
                {mode === 'edit' ? "Edit your details below." : "Provide your resume or fill in your details."}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              <Tabs defaultValue={mode === 'edit' ? "manual" : "upload"} className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-16 gap-2 p-1 bg-muted rounded-lg">
                  <TabsTrigger value="upload" disabled={mode === 'edit'} className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Upload Resume</TabsTrigger>
                  <TabsTrigger value="manual" className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Enter Manually</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="mt-6 sm:mt-8">
                  <div className="space-y-6">
                    <Label htmlFor="resume-file-input" className="text-base font-medium">
                      Upload your Resume (PDF or DocX)
                    </Label>
                     {/* ... (keep existing file upload UI) ... */}
                    <div className="flex items-center justify-center w-full">
                        <label 
                            htmlFor="resume-file-input" 
                            className="flex flex-col items-center justify-center w-full min-h-[10rem] border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50"
                        >
                            <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                                <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                            </p>
                            <Input id="resume-file-input" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                        </label>
                    </div>
                    {resumeFile && (
                        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                            Selected: <span className="font-semibold text-primary">{resumeFile.name}</span>
                        </div>
                    )}
                    <Button onClick={handleSubmitResumeFile} disabled={isLoading || !resumeFile} className="w-full text-lg py-3">
                      {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Process Resume'}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="manual" className="mt-6 sm:mt-8">
                  <form onSubmit={handleSubmitManualData} className="space-y-8">
                    {/* Summary */}
                    <div>
                      <Label htmlFor="summary" className="block text-sm font-medium mb-1.5">Summary / Objective</Label>
                      <Textarea id="summary" name="summary" value={formData.summary} onChange={handleInputChange} placeholder="A brief overview..." rows={4} required />
                    </div>
                    {/* Skills */}
                    <div>
                      <Label htmlFor="skillsInput" className="block text-sm font-medium mb-1.5">Skills (comma-separated)</Label>
                      <Input id="skillsInput" name="skillsInput" value={formData.skillsInput} onChange={handleInputChange} placeholder="e.g., React, Node.js" required />
                    </div>
                    
                    {/* --- Experience Section --- */}
                    <div className="space-y-4 pt-2">
                        <div className="flex justify-between items-center border-b pb-2 mb-3">
                            <h4 className="text-lg font-semibold">Experience</h4>
                            <Button type="button" variant="outline" size="sm" onClick={addExperience}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Experience
                            </Button>
                        </div>
                        {formData.experiences.map((exp, index) => (
                            <Card key={exp.localId} className="p-4 bg-background/20 relative group">
                                <Button 
                                    type="button" variant="ghost" size="icon" 
                                    onClick={() => removeExperience(exp.localId)}
                                    className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive opacity-50 group-hover:opacity-100"
                                > <XCircle className="h-5 w-5" /> </Button>
                                <div className="space-y-3">
                                    <Input placeholder="Job Title" value={exp.jobTitle} onChange={e => handleExperienceChange(exp.localId, 'jobTitle', e.target.value)} required />
                                    <Input placeholder="Company" value={exp.company} onChange={e => handleExperienceChange(exp.localId, 'company', e.target.value)} required />
                                    <Input placeholder="Duration (e.g., Jan 2020 - Present)" value={exp.duration || ''} onChange={e => handleExperienceChange(exp.localId, 'duration', e.target.value)} />
                                    
                                    <Label className="text-sm font-medium">Responsibilities:</Label>
                                    {exp.responsibilities.map((resp, rIndex) => (
                                        <div key={rIndex} className="flex items-center gap-2">
                                            <Textarea 
                                                placeholder={`Responsibility ${rIndex + 1}`} 
                                                value={resp} 
                                                onChange={e => handleExperienceResponsibilityChange(exp.localId, rIndex, e.target.value)}
                                                rows={1}
                                                className="flex-grow"
                                                required={exp.responsibilities.length ===1 && rIndex === 0} // At least one for the first item
                                            />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeExperienceResponsibility(exp.localId, rIndex)} className="text-muted-foreground hover:text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={() => addExperienceResponsibility(exp.localId)}>
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add Responsibility
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                    
                    {/* --- Education Section --- */}
                     <div className="space-y-4 pt-2">
                        <div className="flex justify-between items-center border-b pb-2 mb-3">
                            <h4 className="text-lg font-semibold">Education</h4>
                            <Button type="button" variant="outline" size="sm" onClick={addEducation}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Education
                            </Button>
                        </div>
                        {formData.education.map((edu, index) => (
                             <Card key={edu.localId} className="p-4 bg-background/20 relative group">
                                <Button 
                                    type="button" variant="ghost" size="icon" 
                                    onClick={() => removeEducation(edu.localId)}
                                    className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive opacity-50 group-hover:opacity-100"
                                > <XCircle className="h-5 w-5" /> </Button>
                                <div className="space-y-3">
                                  <Input placeholder="Degree" value={edu.degree} onChange={e => handleEducationChange(edu.localId, 'degree', e.target.value)} required />
                                  <Input placeholder="Institution" value={edu.institution} onChange={e => handleEducationChange(edu.localId, 'institution', e.target.value)} required />
                                  <Input placeholder="Graduation Year" value={edu.graduationYear || ''} onChange={e => handleEducationChange(edu.localId, 'graduationYear', e.target.value)} />
                                </div>
                            </Card>
                        ))}
                    </div>
                    
                    {/* --- Projects Section --- */}
                    <div className="space-y-4 pt-2">
                        <div className="flex justify-between items-center border-b pb-2 mb-3">
                            <h4 className="text-lg font-semibold">Projects</h4>
                            <Button type="button" variant="outline" size="sm" onClick={addProject}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Project
                            </Button>
                        </div>
                        {formData.projects.map((proj, index) => (
                            <Card key={proj.localId} className="p-4 bg-background/20 relative group">
                                <Button 
                                    type="button" variant="ghost" size="icon" 
                                    onClick={() => removeProject(proj.localId)}
                                    className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive opacity-50 group-hover:opacity-100"
                                > <XCircle className="h-5 w-5" /> </Button>
                                <div className="space-y-3">
                                    <Input placeholder="Project Name" value={proj.name} onChange={e => handleProjectChange(proj.localId, 'name', e.target.value)} required/>
                                    <Textarea placeholder="Description" value={proj.description} onChange={e => handleProjectChange(proj.localId, 'description', e.target.value)} rows={3} required/>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <div className="flex gap-4 mt-8">
                        {onCancel && (
                            <Button type="button" variant="outline" onClick={onCancel} className="w-full">
                                Cancel
                            </Button>
                        )}
                        <Button type="submit" disabled={isLoading} className="w-full text-lg py-3">
                          {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (mode === 'edit' ? 'Save Changes' : 'Save Resume')}
                        </Button>
                    </div>
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