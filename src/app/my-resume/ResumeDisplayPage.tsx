// components/ResumeDisplayPage.tsx (was resume.tsx)
"use client"; 

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Briefcase, GraduationCap, Lightbulb, User, Edit3, Sparkles, CalendarDays, Building } from 'lucide-react';
import { ResumeAnalysis, ResumeData } from '@/lib/types'; // Adjust path

// Animation Variants (keep as they are)
const containerVariants = { /* ... */ };
const itemVariants = { /* ... */ };
const skillBadgeVariants = { /* ... */ };


interface ResumeDisplayPageProps {
  resumeData: ResumeData;
  onEdit: () => void; // Callback to switch to edit mode
}

export default function ResumeDisplayPage({ resumeData, onEdit }: ResumeDisplayPageProps) {
  if (!resumeData) { // Should ideally be handled by parent, but good fallback
    return <div className="container mx-auto min-h-screen flex items-center justify-center">No resume data to display.</div>;
  }
  console.log("Resume Data:", resumeData); 
  console.log("Resume Data exp length:", resumeData.experiences?.length); 

  return (
    <motion.div
      className="container mx-auto min-h-screen py-12 px-4 md:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-slate-50"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 }}}} // Simplified top-level stagger
    >
      {/* Header */}
      <motion.header
        className="flex flex-col md:flex-row justify-between items-center mb-12"
        variants={itemVariants} // Use itemVariants for header itself
      >
        <div className="mb-4 md:mb-0 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            Your Digital Resume
          </h1>
          <p className="text-lg text-slate-400 mt-1">
            A snapshot of your professional journey.
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={onEdit} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg group">
            <Edit3 className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
            Edit Resume
          </Button>
        </motion.div>
      </motion.header>

      {/* Main Content Sections */}
      <motion.div className="space-y-10" variants={containerVariants}> {/* Stagger children of this div */}
        {/* Summary Section */}
        {resumeData.summary && (
          <motion.div variants={itemVariants}>
            <Card className="bg-slate-800/50 border-slate-700 shadow-xl hover:shadow-2xl transition-shadow">
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
            <Card className="bg-slate-800/50 border-slate-700 shadow-xl hover:shadow-2xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-semibold text-emerald-400">
                  <Sparkles className="mr-3 h-7 w-7" /> Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div
                  className="flex flex-wrap gap-2"
                  variants={{ visible: { transition: { staggerChildren: 0.07 }}}} // Stagger badges
                  initial="hidden"
                  animate="visible"
                >
                  {resumeData.skills.map((skill, index) => (
                    <motion.div key={index} variants={skillBadgeVariants}>
                      <Badge variant="secondary" className="text-sm px-3 py-1 bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20">
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
            <Card className="bg-slate-800/50 border-slate-700 shadow-xl hover:shadow-2xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-semibold text-amber-400">
                  <Briefcase className="mr-3 h-7 w-7" /> Professional Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {resumeData.experiences.map((exp, index) => (
                  <motion.div
                    key={index} // Use a more stable key if available, e.g., exp.id from DB
                    className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-full before:w-0.5 before:bg-amber-500/30"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
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
                          transition={{ duration: 0.3, delay: (index * 0.05) + (rIndex * 0.03) }}
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
                <Card className="bg-slate-800/50 border-slate-700 shadow-xl hover:shadow-2xl transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center text-2xl font-semibold text-rose-400">
                            <GraduationCap className="mr-3 h-7 w-7"/> Education
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {resumeData.education.map((edu, index) => (
                            <motion.div
                                key={index} // Use edu.id if available
                                initial={{opacity: 0, x: -20}}
                                whileInView={{opacity: 1, x: 0}}
                                viewport={{once: true, amount: 0.3}}
                                transition={{duration: 0.5, delay: index * 0.05}}
                            >
                                <h3 className="text-xl font-medium text-slate-100">{edu.degree}</h3>
                                <p className="text-md text-rose-300">{edu.institution}</p>
                                {edu.graduationYear && (
                                    <p className="text-sm text-slate-400">{edu.graduationYear}</p>
                                )}
                                {index < resumeData.education!.length - 1 && (
                                    <Separator className="my-4 bg-slate-700"/>
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
                <Card className="bg-slate-800/50 border-slate-700 shadow-xl hover:shadow-2xl transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center text-2xl font-semibold text-teal-400">
                            <Lightbulb className="mr-3 h-7 w-7"/> Projects
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {resumeData.projects.map((project, index) => (
                            <motion.div
                                key={index} // Use project.id if available
                                initial={{opacity: 0, x: -20}}
                                whileInView={{opacity: 1, x: 0}}
                                viewport={{once: true, amount: 0.3}}
                                transition={{duration: 0.5, delay: index * 0.05}}
                            >
                                <h3 className="text-xl font-medium text-slate-100">{project.name}</h3>
                                <p className="text-slate-300 leading-relaxed">{project.description}</p>
                                {index < resumeData.projects!.length - 1 && (
                                    <Separator className="my-4 bg-slate-700"/>
                                )}
                            </motion.div>
                        ))}
                    </CardContent>
                </Card>
            </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}