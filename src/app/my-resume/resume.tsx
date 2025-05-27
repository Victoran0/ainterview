"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Briefcase,
  GraduationCap,
  Lightbulb,
  User, // Or FileText for summary
  Edit3,
  Sparkles, // For skills
  CalendarDays,
  Building,
  ListChecks
} from 'lucide-react';

import { ResumeAnalysis } from '@/lib/types';

// Mock Data (replace with actual data fetching in a real app)
const mockResumeData: ResumeAnalysis = {
  summary: "Highly motivated and results-oriented software engineer with 5+ years of experience in developing and deploying scalable web applications. Passionate about clean code, innovative solutions, and collaborative teamwork. Eager to leverage expertise in full-stack development to contribute to a dynamic organization.",
  skills: ["JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python", "Django", "PostgreSQL", "Docker", "AWS", "Agile Methodologies", "Problem Solving"],
  experiences: [
    {
      jobTitle: "Senior Software Engineer",
      company: "Innovatech Solutions",
      duration: "Jan 2021 - Present",
      responsibilities: [
        "Led the development of a new customer portal using React and Next.js, improving user engagement by 30%.",
        "Designed and implemented RESTful APIs with Node.js and Express, serving over 1 million requests per day.",
        "Mentored junior developers and conducted code reviews to ensure high-quality standards.",
        "Collaborated with product managers and designers to define project requirements and timelines."
      ]
    },
    {
      jobTitle: "Software Developer",
      company: "Tech Builders Inc.",
      duration: "Jun 2018 - Dec 2020",
      responsibilities: [
        "Developed and maintained features for a SaaS platform using Python and Django.",
        "Contributed to database design and optimization with PostgreSQL.",
        "Participated in agile sprint planning and daily stand-ups."
      ]
    }
  ],
  education: [
    {
      degree: "M.S. in Computer Science",
      institution: "State University",
      graduationYear: "2018"
    },
    {
      degree: "B.S. in Software Engineering",
      institution: "Tech Institute",
      graduationYear: "2016"
    }
  ],
  projects: [
    {
      name: "Personal Portfolio Website",
      description: "A responsive personal portfolio built with Next.js, Tailwind CSS, and deployed on Vercel. Showcases projects, skills, and experience."
    },
    {
      name: "Task Management App",
      description: "A full-stack task management application using React, Node.js, and MongoDB. Features user authentication, CRUD operations for tasks, and real-time updates."
    }
  ]
};

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
};

const skillBadgeVariants = {
  hidden: { scale: 0.5, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  },
};


export default function ResumeDisplayPage() {
  const resumeData = mockResumeData; // In a real app, fetch this data

  // You might want to add a loading state if data fetching is asynchronous
  if (!resumeData) {
    return <div className="container mx-auto min-h-screen flex items-center justify-center">Loading resume...</div>;
  }

  return (
    <motion.div
      className="container mx-auto min-h-screen py-12 px-4 md:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-slate-50"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 }}}}
    >
      {/* Header */}
      <motion.header
        className="flex flex-col md:flex-row justify-between items-center mb-12"
        variants={itemVariants}
      >
        <div className="mb-4 md:mb-0 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            Your Digital Resume
          </h1>
          <p className="text-lg text-slate-400 mt-1">
            A snapshot of your professional journey.
          </p>
        </div>
        <Link href="/resume/edit" passHref>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-300 ease-in-out group">
              <Edit3 className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
              Edit Resume
            </Button>
          </motion.div>
        </Link>
      </motion.header>

      {/* Main Content Sections */}
      <motion.div className="space-y-10" variants={containerVariants}>
        {/* Summary Section */}
        {resumeData.summary && (
          <motion.div variants={itemVariants}>
            <Card className="bg-slate-800/50 border-slate-700 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-semibold text-sky-400">
                  <User className="mr-3 h-7 w-7" /> Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed">{resumeData.summary}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Skills Section */}
        {resumeData.skills && resumeData.skills.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card className="bg-slate-800/50 border-slate-700 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-semibold text-emerald-400">
                  <Sparkles className="mr-3 h-7 w-7" /> Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div
                  className="flex flex-wrap gap-2"
                  variants={{ visible: { transition: { staggerChildren: 0.07 }}}}
                  initial="hidden"
                  animate="visible" // Animate when this section becomes visible
                >
                  {resumeData.skills.map((skill, index) => (
                    <motion.div key={index} variants={skillBadgeVariants}>
                      <Badge
                        variant="secondary"
                        className="text-sm px-3 py-1 bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
                      >
                        {skill}
                      </Badge>
                    </motion.div>
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Experience Section */}
        {resumeData.experiences && resumeData.experiences.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card className="bg-slate-800/50 border-slate-700 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-semibold text-amber-400">
                  <Briefcase className="mr-3 h-7 w-7" /> Professional Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {resumeData.experiences.map((exp, index) => (
                  <motion.div
                    key={index}
                    className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-full before:w-0.5 before:bg-amber-500/30"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                     <div className="absolute -left-2.5 top-1.5 h-5 w-5 rounded-full bg-amber-500 border-2 border-slate-800"></div>
                    <h3 className="text-xl font-medium text-slate-100">{exp.jobTitle}</h3>
                    <p className="text-md text-amber-300 flex items-center">
                      <Building size={16} className="mr-2 opacity-70"/> {exp.company}
                    </p>
                    {exp.duration && (
                      <p className="text-sm text-slate-400 mb-2 flex items-center">
                        <CalendarDays size={14} className="mr-2 opacity-70"/> {exp.duration}
                      </p>
                    )}
                    <ul className="list-disc list-outside ml-5 space-y-1 text-slate-300">
                      {exp.responsibilities.map((resp, rIndex) => (
                        <motion.li
                          key={rIndex}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: (index * 0.1) + (rIndex * 0.05) }}
                        >
                          {resp}
                        </motion.li>
                      ))}
                    </ul>
                    {index < resumeData.experiences!.length - 1 && (
                      <Separator className="my-6 bg-slate-700" />
                    )}
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Education Section */}
        {resumeData.education && resumeData.education.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card className="bg-slate-800/50 border-slate-700 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-semibold text-rose-400">
                  <GraduationCap className="mr-3 h-7 w-7" /> Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {resumeData.education.map((edu, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <h3 className="text-xl font-medium text-slate-100">{edu.degree}</h3>
                    <p className="text-md text-rose-300">{edu.institution}</p>
                    {edu.graduationYear && (
                      <p className="text-sm text-slate-400">{edu.graduationYear}</p>
                    )}
                    {index < resumeData.education!.length - 1 && (
                      <Separator className="my-4 bg-slate-700" />
                    )}
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Projects Section */}
        {resumeData.projects && resumeData.projects.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card className="bg-slate-800/50 border-slate-700 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-semibold text-teal-400">
                  <Lightbulb className="mr-3 h-7 w-7" /> Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {resumeData.projects.map((project, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <h3 className="text-xl font-medium text-slate-100">{project.name}</h3>
                    <p className="text-slate-300 leading-relaxed">{project.description}</p>
                     {index < resumeData.projects!.length - 1 && (
                      <Separator className="my-4 bg-slate-700" />
                    )}
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* Footer - Optional */}
      <motion.footer
        className="mt-16 pt-8 border-t border-slate-700 text-center"
        variants={itemVariants}
      >
        <p className="text-slate-400">
          © {new Date().getFullYear()} Your Name/Company. All rights reserved.
        </p>
      </motion.footer>
    </motion.div>
  );
}