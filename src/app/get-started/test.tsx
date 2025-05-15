"use client"
import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // For manual entry
import { toast } from "sonner"; // Assuming Shadcn Toaster
import { Loader2, UploadCloud } from 'lucide-react';
import { motion } from "motion/react"

// Define types for resume data (can be moved to lib/types.ts)
interface Experience {
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
}
interface Education {
  degree: string;
  institution: string;
  graduationDate: string;
}
interface ManualResumeData {
  fullName: string;
  email: string;
  phone?: string;
  summary: string;
  skills: string[]; // Or string for comma-separated
  experiences: Experience[];
  educations: Education[];
}


export default function GetStartedPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [manualData, setManualData] = useState<ManualResumeData>({
    fullName: '', email: '', summary: '', skills: [], experiences: [], educations: []
  }); // Basic structure

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("File too large", { description: "Please upload a resume under 5MB.", });
        return;
      }
      if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        toast.error("Invalid file type", { description: "Please upload a PDF or DOCX file.", });
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
      experiences: [...prev.experiences, { jobTitle: '', company: '', startDate: '', endDate: '', responsibilities: '' }]
    }));
  };

  const handleExperienceChange = (index: number, field: keyof Experience, value: string) => {
    setManualData(prev => {
      const newExperiences = [...prev.experiences];
      newExperiences[index] = { ...newExperiences[index], [field]: value };
      return { ...prev, experiences: newExperiences };
    });
  };


  const handleSubmitResume = async () => {
    if (!resumeFile) {
      toast.error("No file selected", {description: "Please select a resume file to upload." });
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
      toast.success("Resume Processed!", { description: "Your interview is being prepared." });

    } catch (error: any) {
      toast.error("Error", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitManualData = async () => {
    setIsLoading(true);
    // Basic validation
    if (!manualData.fullName || !manualData.email || !manualData.summary || manualData.skills.length === 0) {
        toast.error("Missing Information", { description: "Please fill in all required fields." });
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
      </Head>
      <div className="container mx-auto px-4 py-12 min-h-screen flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-2xl shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">Let's Get to Know You</CardTitle>
              <CardDescription>
                Provide your resume or fill in your details so we can tailor the interview.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">Upload Resume</TabsTrigger>
                  <TabsTrigger value="manual">Enter Manually</TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="mt-6">
                  <div className="space-y-4">
                    <Label htmlFor="resume-file" className="text-lg font-medium">Upload your Resume (PDF or DOCX)</Label>
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="resume-file-input" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-muted-foreground">PDF or DOCX (MAX. 5MB)</p>
                            </div>
                            <Input id="resume-file-input" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx" />
                        </label>
                    </div>
                    {resumeFile && <p className="text-sm text-muted-foreground">Selected file: {resumeFile.name}</p>}
                    <Button onClick={handleSubmitResume} disabled={isLoading || !resumeFile} className="w-full text-lg py-6">
                      {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Process Resume & Start'}
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="manual" className="mt-6">
                  <form onSubmit={(e) => { e.preventDefault(); handleSubmitManualData(); }} className="space-y-4">
                    {/* Simplified Manual Form */}
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" name="fullName" value={manualData.fullName} onChange={handleManualInputChange} required />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" value={manualData.email} onChange={handleManualInputChange} required />
                    </div>
                    <div>
                      <Label htmlFor="summary">Summary / Objective</Label>
                      <Textarea id="summary" name="summary" value={manualData.summary} onChange={handleManualInputChange} required />
                    </div>
                    <div>
                      <Label htmlFor="skills">Skills (comma-separated)</Label>
                      <Input id="skills" name="skills" value={(manualData.skills as unknown as string[]).join(', ')} onChange={(e) => setManualData(prev => ({...prev, skills: e.target.value.split(',').map(s => s.trim())}))} required />
                    </div>
                    {/* Add Experience Section (Simplified) */}
                    <div className="space-y-2">
                        <h4 className="font-semibold">Experience</h4>
                        {manualData.experiences.map((exp, index) => (
                            <div key={index} className="p-3 border rounded-md space-y-1">
                                <Input placeholder="Job Title" value={exp.jobTitle} onChange={e => handleExperienceChange(index, 'jobTitle', e.target.value)} />
                                <Input placeholder="Company" value={exp.company} onChange={e => handleExperienceChange(index, 'company', e.target.value)} />
                                {/* Add Start/End Date, Responsibilities */}
                            </div>
                        ))}
                        <Button type="button" variant="outline" onClick={addExperience}>Add Experience</Button>
                    </div>
                    {/* Add Education Section (Similar to Experience) */}

                    <Button type="submit" disabled={isLoading} className="w-full text-lg py-6">
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