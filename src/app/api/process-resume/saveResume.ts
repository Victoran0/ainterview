import { ResumeAnalysis } from '@/lib/types';
import { api } from '@/trpc/server';

export async function saveResume(resumeAnalysis: ResumeAnalysis) {
    const resumeData = await api.manageDB.createResumeAnalysis({
        summary: resumeAnalysis.summary,
        skills: resumeAnalysis.skills,
        experiences: resumeAnalysis.experiences,
        education: resumeAnalysis.education,
        projects: resumeAnalysis.projects,
    })

    console.log('Resume Analysis created:', resumeData);

    return true;
}