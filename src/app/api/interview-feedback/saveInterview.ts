import { FullReport } from '@/lib/types';
import { api } from '@/trpc/server';

export async function saveInterview(fullReport: FullReport) {

    const interview = await api.manageDB.createInterview({
        id: fullReport.sessionId,
        overallScorePercentage: fullReport.overallFeedback.overallScorePercentage,
        strengths: fullReport.overallFeedback.strengths,
        weaknesses: fullReport.overallFeedback.weaknesses,
        studyPlanSummary: fullReport.overallFeedback.studyPlanSummary,
    });

    console.log('Interview created:', interview);

    return true;
}
