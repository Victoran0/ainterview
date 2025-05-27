import { z } from "zod";

import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { ResumeAnalysisSchema } from "@/lib/types";

export const manageDB = createTRPCRouter({
  createInterview: privateProcedure
  .input(z.object({
    id: z.string(),
    overallScorePercentage: z.number(),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    studyPlanSummary: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.user.id;

    const interview = await ctx.db.interview.create({
      data: {
        userId,
        ...input,
      },
    });

    return interview;
  }),
  checkInterviewExists: privateProcedure
  .input(
    z.object({
      interviewId: z.string(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const interview = await ctx.db.interview.findUnique({
      where: {
        id: input.interviewId,
      },
    });

    if (!interview) {
      // throw new TRPCError({
      //   code: 'NOT_FOUND',
      //   message: 'Interview not found',
      // });
      return {
        exists: false,
      };
    }

    return {
      exists: true
    };
  }),
  // createResumeAnalysis: privateProcedure
  // .input(ResumeAnalysisSchema)
  // .mutation(async ({ ctx, input }) => {
  //   const userId = ctx.user.id;

  //   // Check if user already has a resume
  //   const user = await ctx.db.user.findUnique({
  //     where: { id: userId },
  //     select: { resumeAnalysisId: true },
  //   });

  //   if (user?.resumeAnalysisId) {
  //     throw new Error('Resume already exists for this user.');
  //   }

  //   // Create ResumeAnalysis
  //   const resume = await ctx.db.resumeAnalysis.create({
  //     data: {
  //       summary: input.summary,
  //       skills: input.skills,
  //       Education: {
  //         create: input.education,
  //       },
  //       Experience: {
  //         create: input.experiences,
  //       },
  //       Project: {
  //         create: input.projects,
  //       },
  //     },
  //   });

  //   if (!resume) {
  //     throw new Error('Failed to create resume analysis.');
  //   }

  //   // Associate with user
  //   await ctx.db.user.update({
  //     where: { id: userId },
  //     data: {
  //       resumeAnalysisId: resume.id,
  //     },
  //   });

  //   return resume;
  // }),
  checkResumeExists: privateProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const user = await ctx.db.user.findUnique({
      where: { id: userId },
      select: { resumeAnalysisId: true },
    });
    return {
      exists: !!user?.resumeAnalysisId,
      resumeId: user?.resumeAnalysisId // Good to return ID if it exists
    };
  }),

  getResumeAnalysis: privateProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
  
    const userWithResume = await ctx.db.user.findUnique({
      where: { id: userId },
      select: {
        ResumeAnalysis: {
          include: {
            Education: true,
            Experience: true,
            Project: true,
          },
        },
      },
    });
  
    if (!userWithResume || !userWithResume.ResumeAnalysis) {
      throw new Error('ResumeAnalysis not found for this user.');
    }
  
    return userWithResume.ResumeAnalysis;
  }),

  // NEW: Procedure to create resume analysis (if not using /api/process-resume for manual)
  createResumeAnalysis: privateProcedure
    .input(ResumeAnalysisSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const newResumeAnalysis = await ctx.db.resumeAnalysis.create({
        data: {
          summary: input.summary,
          skills: input.skills,
          User: { connect: { id: userId } },
          Experience: input.experiences ? {
            create: input.experiences.map(exp => ({
              jobTitle: exp.jobTitle,
              company: exp.company,
              duration: exp.duration,
              responsibilities: exp.responsibilities,
            })),
          } : undefined,
          Education: input.education ? {
            create: input.education.map(edu => ({
              degree: edu.degree,
              institution: edu.institution,
              graduationYear: edu.graduationYear,
            })),
          } : undefined,
          Project: input.projects ? {
            create: input.projects.map(proj => ({
              name: proj.name,
              description: proj.description,
            })),
          } : undefined,
        },
      });

      await ctx.db.user.update({
        where: { id: userId },
        data: { resumeAnalysisId: newResumeAnalysis.id },
      });

      return { success: true, resumeId: newResumeAnalysis.id, message: "Resume created successfully!" };
    }),
    
  updateResumeAnalysis: privateProcedure
    .input(ResumeAnalysisSchema.extend({ id: z.string().optional() })) // ResumeAnalysis ID
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        select: { resumeAnalysisId: true }
      });

      if (!user?.resumeAnalysisId && !input.id) {
        throw new Error('ResumeAnalysis ID not found for this user and not provided in input.');
      }
      
      const resumeAnalysisId = input.id || user?.resumeAnalysisId;
      if (!resumeAnalysisId) {
          throw new Error('Cannot determine ResumeAnalysis ID to update.');
      }

      // Complex update: Update top-level, then handle relations by deleting old and creating new.
      // Prisma doesn't have a simple "sync" for nested relations in this way without knowing IDs.
      // A more robust approach might involve sending IDs for existing items to update them.
      // For this, we'll clear and re-create related items.

      const updatedResume = await ctx.db.resumeAnalysis.update({
        where: { id: resumeAnalysisId },
        data: {
          summary: input.summary,
          skills: input.skills,
          // For relations: delete existing and create new ones
          // This is simpler than diffing but can be inefficient for large datasets
          // and loses original IDs of sub-items if not handled carefully.
          Experience: {
            deleteMany: {}, // Delete all existing experiences for this resume
            create: input.experiences?.map(exp => ({
              jobTitle: exp.jobTitle,
              company: exp.company,
              duration: exp.duration,
              responsibilities: exp.responsibilities,
            })),
          },
          Education: {
            deleteMany: {},
            create: input.education?.map(edu => ({
              degree: edu.degree,
              institution: edu.institution,
              graduationYear: edu.graduationYear,
            })),
          },
          Project: {
            deleteMany: {},
            create: input.projects?.map(proj => ({
              name: proj.name,
              description: proj.description,
            })),
          },
        },
      });

      return { success: true, resumeId: updatedResume.id, message: "Resume updated successfully!" };
    }),
    getPastInterviews: privateProcedure
    .output(z.array(z.object({ // Define the output shape clearly
      id: z.string(),
      overallScorePercentage: z.number(),
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
      studyPlanSummary: z.string(),
      createdAt: z.date(), // Ensure this is a date
    })))
    .query(async ({ ctx }) => {
      const interviews = await ctx.db.interview.findMany({
        where: { userId: ctx.user.id },
        orderBy: { createdAt: 'desc' }, // Show latest interviews first
        select: { // Only select necessary fields
          id: true,
          overallScorePercentage: true,
          strengths: true,
          weaknesses: true,
          studyPlanSummary: true,
          createdAt: true,
        }
      });
      return interviews.map(interview => ({
        ...interview,
        // Ensure percentage is a number if it's Float in DB
        overallScorePercentage: Number(interview.overallScorePercentage) 
      }));
    }),
})