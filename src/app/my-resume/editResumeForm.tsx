"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, Save, X, PlusCircle, Trash2, User, Sparkles, Briefcase, GraduationCap, Lightbulb } from 'lucide-react';
import { api } from '@/trpc/react';
import { ManualResumeFormData, ResumeAnalysisSchema, FormExperience, FormEducation, FormProject, ResumeAnalysis, ResumeData } from '@/lib/types'; // Adjust path
import { generateLocalId } from '@/lib/utils'; // Adjust path

interface EditResumeFormProps {
  initialData: ResumeData; // Must have existing data and its ID
  onSaveSuccess: (updatedData: ResumeData) => void;
  onCancel: () => void;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const listItemVariants = {
    initial: { opacity: 0, height: 0, y: -10 },
    animate: { opacity: 1, height: 'auto', y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { opacity: 0, height: 0, y: -10, transition: { duration: 0.2 } },
};


export default function EditResumeForm({ initialData, onSaveSuccess, onCancel }: EditResumeFormProps) {
  const [formData, setFormData] = useState<ManualResumeFormData>({
    summary: '',
    skillsInput: '',
    experiences: [],
    education: [],
    projects: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const updateResumeMutation = api.manageDB.updateResumeAnalysis.useMutation();

  useEffect(() => {
    if (initialData) {
      setFormData({
        summary: initialData.summary || '',
        skillsInput: initialData.skills?.join(', ') || '',
        experiences: initialData.experiences?.map(exp => ({ ...exp, responsibilities: exp.responsibilities || [''], id: generateLocalId() })) || [],
        education: initialData.education?.map(edu => ({ ...edu, id: generateLocalId() })) || [],
        projects: initialData.projects?.map(proj => ({ ...proj, id: generateLocalId() })) || [],
      });
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- Experience Handlers ---
  const addExperience = () => setFormData(prev => ({ ...prev, experiences: [...prev.experiences, { jobTitle: '', company: '', duration: '', responsibilities: [''], id: generateLocalId() }] }));
  const removeExperience = (id: string) => setFormData(prev => ({ ...prev, experiences: prev.experiences.filter(exp => exp.id !== id) }));
  const handleExperienceChange = (id: string, field: keyof Omit<FormExperience, 'id' | 'responsibilities'>, value: string) => {
    setFormData(prev => ({ ...prev, experiences: prev.experiences.map(exp => exp.id === id ? { ...exp, [field]: value } : exp) }));
  };
  const addExperienceResponsibility = (expLocalId: string) => {
    setFormData(prev => ({ ...prev, experiences: prev.experiences.map(exp => exp.id === expLocalId ? { ...exp, responsibilities: [...exp.responsibilities, ''] } : exp) }));
  };
  const handleExperienceResponsibilityChange = (expLocalId: string, respIndex: number, value: string) => {
    setFormData(prev => ({ ...prev, experiences: prev.experiences.map(exp => exp.id === expLocalId ? { ...exp, responsibilities: exp.responsibilities.map((r, i) => (i === respIndex ? value : r)) } : exp) }));
  };
  const removeExperienceResponsibility = (expLocalId: string, respIndex: number) => {
    setFormData(prev => ({ ...prev, experiences: prev.experiences.map(exp => exp.id === expLocalId ? { ...exp, responsibilities: exp.responsibilities.filter((_, i) => i !== respIndex) } : exp) }));
  };

  // --- Education Handlers ---
  const addEducation = () => setFormData(prev => ({ ...prev, education: [...prev.education, { degree: '', institution: '', graduationYear: '', id: generateLocalId() }] }));
  const removeEducation = (id: string) => setFormData(prev => ({ ...prev, education: prev.education.filter(edu => edu.id !== id) }));
  const handleEducationChange = (id: string, field: keyof Omit<FormEducation, 'id'>, value: string) => {
    setFormData(prev => ({ ...prev, education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu) }));
  };

  // --- Project Handlers ---
  const addProject = () => setFormData(prev => ({ ...prev, projects: [...prev.projects, { name: '', description: '', id: generateLocalId() }] }));
  const removeProject = (id: string) => setFormData(prev => ({ ...prev, projects: prev.projects.filter(proj => proj.id !== id) }));
  const handleProjectChange = (id: string, field: keyof Omit<FormProject, 'id'>, value: string) => {
    setFormData(prev => ({ ...prev, projects: prev.projects.map(proj => proj.id === id ? { ...proj, [field]: value } : proj) }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const skillsArray = formData.skillsInput.split(',').map(s => s.trim()).filter(Boolean);
    const dataToSubmit: ResumeData = {
      id: initialData.id,
      summary: formData.summary,
      skills: skillsArray,
      experiences: formData.experiences.map(({ id, ...exp }) => ({ ...exp, responsibilities: exp.responsibilities.filter(r => r.trim() !== '') })),
      education: formData.education.map(({ id, ...edu }) => edu),
      projects: formData.projects.map(({ id, ...proj }) => proj),
    };

    const validationResult = ResumeAnalysisSchema.safeParse(dataToSubmit);
    if (!validationResult.success) {
      console.error("Validation Errors:", validationResult.error.flatten().fieldErrors);
      Object.values(validationResult.error.flatten().fieldErrors).flat().forEach((error: any) => {
        if (typeof error === 'string') {
            toast.error("Validation Error", { description: error });
        }
      });
      setIsLoading(false);
      return;
    }

    try {
      await updateResumeMutation.mutateAsync(
        { ...validationResult.data, id: initialData.id },
        {
          onSuccess: (res) => {
            toast.success(res.message || "Resume updated successfully!");
            onSaveSuccess({
                id: initialData.id, 
                summary: formData.summary, 
                skills: skillsArray, 
                experiences: formData.experiences, 
                education: formData.education, 
                projects: formData.projects
            }); // Pass updated data back
          },
          onError: (err) => {
            toast.error("Update Failed", { description: err.message });
          }
        }
      );
    } catch (error: any) {
      toast.error("Submission Error", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-slate-50 py-12 px-4 md:px-6 lg:px-8"
    >
      <div className="container mx-auto max-w-4xl">
        <motion.header 
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
          className="mb-10 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            Edit Your Resume
          </h1>
          <p className="text-lg text-slate-400 mt-2">
            Refine your professional story. Your changes will be saved instantly.
          </p>
        </motion.header>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Summary Section */}
          <motion.div variants={sectionVariants} initial="hidden" animate="visible">
            <Card className="bg-slate-800/60 border-slate-700 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-semibold text-sky-400">
                  <User className="mr-3 h-7 w-7" /> Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="summary" className="sr-only">Summary</Label>
                <Textarea
                  id="summary"
                  name="summary"
                  value={formData.summary}
                  onChange={handleInputChange}
                  placeholder="Craft a compelling summary of your career..."
                  rows={5}
                  className="bg-slate-700/50 border-slate-600 text-slate-100 focus:border-sky-500"
                  required
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Skills Section */}
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{delay: 0.1}}>
            <Card className="bg-slate-800/60 border-slate-700 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-semibold text-emerald-400">
                  <Sparkles className="mr-3 h-7 w-7" /> Skills
                </CardTitle>
                <CardDescription className="text-slate-400">Enter skills separated by commas.</CardDescription>
              </CardHeader>
              <CardContent>
                <Label htmlFor="skillsInput" className="sr-only">Skills (comma-separated)</Label>
                <Input
                  id="skillsInput"
                  name="skillsInput"
                  value={formData.skillsInput}
                  onChange={handleInputChange}
                  placeholder="e.g., JavaScript, React, Node.js, Project Management"
                  className="bg-slate-700/50 border-slate-600 text-slate-100 focus:border-emerald-500"
                  required
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Experiences Section */}
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{delay: 0.2}}>
            <Card className="bg-slate-800/60 border-slate-700 shadow-xl">
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="flex items-center text-2xl font-semibold text-amber-400">
                  <Briefcase className="mr-3 h-7 w-7" /> Professional Experience
                </CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addExperience} className="text-amber-300 border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-200">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Experience
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <AnimatePresence>
                {formData.experiences.map((exp, index) => (
                  <motion.div 
                    key={exp.id} 
                    variants={listItemVariants}
                    initial="initial" animate="animate" exit="exit"
                    className="p-4 border border-slate-700 rounded-lg bg-slate-700/30 space-y-3 relative"
                  >
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeExperience(exp.id)} className="absolute top-2 right-2 h-7 w-7 text-slate-400 hover:text-red-400">
                      <Trash2 className="h-5 w-5" />
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`exp-jobTitle-${exp.id}`} className="text-slate-300 mb-1 block text-sm">Job Title</Label>
                        <Input id={`exp-jobTitle-${exp.id}`} value={exp.jobTitle} onChange={e => handleExperienceChange(exp.id, 'jobTitle', e.target.value)} placeholder="Senior Software Engineer" className="bg-slate-600/50 text-[#c4c4c4] border-slate-500" required />
                      </div>
                      <div>
                        <Label htmlFor={`exp-company-${exp.id}`} className="text-slate-300 mb-1 block text-sm">Company</Label>
                        <Input id={`exp-company-${exp.id}`} value={exp.company} onChange={e => handleExperienceChange(exp.id, 'company', e.target.value)} placeholder="Innovatech Ltd." className="bg-slate-600/50 text-[#c4c4c4] border-slate-500" required />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`exp-duration-${exp.id}`} className="text-slate-300 mb-1 block text-sm">Duration</Label>
                      <Input id={`exp-duration-${exp.id}`} value={exp.duration || ''} onChange={e => handleExperienceChange(exp.id, 'duration', e.target.value)} placeholder="Jan 2020 - Present" className="bg-slate-600/50 text-[#c4c4c4] border-slate-500" />
                    </div>
                    <div>
                      <Label className="text-slate-300 mb-1 block text-sm">Responsibilities</Label>
                      <div className="space-y-2">
                        <AnimatePresence>
                        {exp.responsibilities.map((resp, rIndex) => (
                          <motion.div key={rIndex} variants={listItemVariants} initial="initial" animate="animate" exit="exit" className="flex items-center gap-2">
                            <Textarea value={resp} onChange={e => handleExperienceResponsibilityChange(exp.id, rIndex, e.target.value)} placeholder={`Responsibility ${rIndex + 1}`} rows={1} className="bg-slate-600/50  text-[#c4c4c4] border-slate-500 flex-grow" required={exp.responsibilities.length === 1 && rIndex === 0} />
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeExperienceResponsibility(exp.id, rIndex)} className="text-slate-400 hover:text-red-400 shrink-0">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        ))}
                        </AnimatePresence>
                        <Button type="button" variant="link" size="sm" onClick={() => addExperienceResponsibility(exp.id)} className="text-amber-400 hover:text-amber-300 px-0">
                          <PlusCircle className="mr-1 h-4 w-4" /> Add Responsibility
                        </Button>
                      </div>
                    </div>
                    {index < formData.experiences.length - 1 && <Separator className="bg-slate-600 my-4" />}
                  </motion.div>
                ))}
                </AnimatePresence>
                {formData.experiences.length === 0 && <p className="text-slate-400 text-sm text-center py-2">No experiences added yet.</p>}
              </CardContent>
            </Card>
          </motion.div>

          {/* Education Section */}
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{delay: 0.3}}>
            <Card className="bg-slate-800/60 border-slate-700 shadow-xl">
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="flex items-center text-2xl font-semibold text-rose-400">
                  <GraduationCap className="mr-3 h-7 w-7" /> Education
                </CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addEducation} className="text-rose-300 border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-200">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Education
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <AnimatePresence>
                {formData.education.map((edu, index) => (
                  <motion.div 
                    key={edu.id} 
                    variants={listItemVariants}
                    initial="initial" animate="animate" exit="exit"
                    className="p-4 border border-slate-700 rounded-lg bg-slate-700/30 space-y-3 relative"
                  >
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeEducation(edu.id)} className="absolute top-2 right-2 h-7 w-7 text-slate-400 hover:text-red-400">
                      <Trash2 className="h-5 w-5" />
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor={`edu-degree-${edu.id}`} className="text-slate-300 mb-1 block text-sm">Degree</Label>
                            <Input id={`edu-degree-${edu.id}`} value={edu.degree} onChange={e => handleEducationChange(edu.id, 'degree', e.target.value)} placeholder="B.S. Computer Science" className="bg-slate-600/50 text-[#c4c4c4] border-slate-500" required />
                        </div>
                        <div>
                            <Label htmlFor={`edu-institution-${edu.id}`} className="text-slate-300 mb-1 block text-sm">Institution</Label>
                            <Input id={`edu-institution-${edu.id}`} value={edu.institution} onChange={e => handleEducationChange(edu.id, 'institution', e.target.value)} placeholder="State University" className="bg-slate-600/50 text-[#c4c4c4] border-slate-500" required />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor={`edu-gradYear-${edu.id}`} className="text-slate-300 mb-1 block text-sm">Graduation Year</Label>
                        <Input id={`edu-gradYear-${edu.id}`} value={edu.graduationYear || ''} onChange={e => handleEducationChange(edu.id, 'graduationYear', e.target.value)} placeholder="2020" className="bg-slate-600/50 text-[#c4c4c4] border-slate-500" />
                    </div>
                    {index < formData.education.length - 1 && <Separator className="bg-slate-600 my-4" />}
                  </motion.div>
                ))}
                </AnimatePresence>
                {formData.education.length === 0 && <p className="text-slate-400 text-sm text-center py-2">No education entries added yet.</p>}
              </CardContent>
            </Card>
          </motion.div>

          {/* Projects Section */}
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{delay: 0.4}}>
            <Card className="bg-slate-800/60 border-slate-700 shadow-xl">
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="flex items-center text-2xl font-semibold text-teal-400">
                  <Lightbulb className="mr-3 h-7 w-7" /> Projects
                </CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addProject} className="text-teal-300 border-teal-500/50 hover:bg-teal-500/10 hover:text-teal-200">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Project
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <AnimatePresence>
                {formData.projects.map((proj, index) => (
                  <motion.div 
                    key={proj.id} 
                    variants={listItemVariants}
                    initial="initial" animate="animate" exit="exit"
                    className="p-4 border border-slate-700 rounded-lg bg-slate-700/30 space-y-3 relative"
                  >
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeProject(proj.id)} className="absolute top-2 right-2 h-7 w-7 text-slate-400 hover:text-red-400">
                      <Trash2 className="h-5 w-5" />
                    </Button>
                    <div>
                        <Label htmlFor={`proj-name-${proj.id}`} className="text-slate-300 mb-1 block text-sm">Project Name</Label>
                        <Input id={`proj-name-${proj.id}`} value={proj.name} onChange={e => handleProjectChange(proj.id, 'name', e.target.value)} placeholder="Personal Portfolio" className="bg-slate-600/50  text-[#c4c4c4] border-slate-500" required />
                    </div>
                    <div>
                        <Label htmlFor={`proj-desc-${proj.id}`} className="text-slate-300 mb-1 block text-sm">Description</Label>
                        <Textarea id={`proj-desc-${proj.id}`} value={proj.description} onChange={e => handleProjectChange(proj.id, 'description', e.target.value)} placeholder="A brief description of your project..." rows={3} className="bg-slate-600/50  text-[#c4c4c4] border-slate-500" required />
                    </div>
                     {index < formData.projects.length - 1 && <Separator className="bg-slate-600 my-4" />}
                  </motion.div>
                ))}
                </AnimatePresence>
                {formData.projects.length === 0 && <p className="text-slate-400 text-sm text-center py-2">No projects added yet.</p>}
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            variants={sectionVariants} initial="hidden" animate="visible" transition={{delay: 0.5}}
            className="flex flex-col sm:flex-row justify-end gap-4 pt-6"
          >
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-slate-100 w-full sm:w-auto">
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
}