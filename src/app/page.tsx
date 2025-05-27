"use client"
import Head from 'next/head';
import Link from 'next/link';
import { ParallaxProvider, ParallaxBanner, ParallaxBannerLayer } from 'react-scroll-parallax';
import { Button } from '@/components/ui/button'; // Assuming Shadcn/UI
import { ArrowRight, Briefcase, Zap, BarChart3, MessageCircleHeart } from 'lucide-react';
import { motion } from 'motion/react';

const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
  <motion.div
    className="bg-card p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.5 }}
  >
    <Icon className="w-12 h-12 text-primary mb-4" />
    <h3 className="text-2xl font-semibold mb-2 text-card-foreground">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </motion.div>
);

export default function HomePage() {
  return (
    <ParallaxProvider>
      <Head>
        <title>Interviewer AI - Land Your Dream Job</title>
        <meta name="description" content="AI-powered interview coaching to boost your confidence and skills." />
      </Head>

      <main className="bg-background text-foreground">
        {/* Parallax Hero Section - Updated */}
        <ParallaxBanner style={{ height: '100vh' }} className="bg-slate-900"> {/* Added dark background */}
          
          {/* Background Text Layer 1: AI Question Generation */}
          <ParallaxBannerLayer speed={-25}>
            <div className="absolute top-[28%] left-[10%] md:left-[15%]">
              <h2 className="text-3xl animate-bounce sm:text-4xl md:text-5xl text-white/20 font-extrabold transform -rotate-12">
                AI Question Generation
              </h2>
            </div>
          </ParallaxBannerLayer>

          {/* Background Text Layer 2: Resume-Specific Scenarios */}
          <ParallaxBannerLayer speed={-18}>
            <div className="absolute bottom-[20%] md:bottom-[25%] right-[5%] md:right-[10%]">
              <h2 className="text-3xl animate-bounce sm:text-4xl md:text-5xl text-white/20 font-extrabold transform rotate-6">
                Resume-Specific Scenarios
              </h2>
            </div>
          </ParallaxBannerLayer>

          {/* Main Hero Content Layer (Kept from original) */}
          <ParallaxBannerLayer speed={-10} className="z-10">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <motion.h1
                initial={{ opacity: 0, y: -30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.8, delay: 0.2, type: 'spring' }}
                className="text-5xl md:text-7xl font-extrabold text-white mb-6"
                style={{ textShadow: '0 0 15px rgba(0,0,0,0.7)' }}
              >
                Ace Your Interviews with AI
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.8, delay: 0.4, type: 'spring' }}
                className="text-xl md:text-2xl text-gray-200 mb-10 max-w-3xl"
                style={{ textShadow: '0 0 10px rgba(0,0,0,0.7)' }}
              >
                Practice with a smart AI interviewer, get personalized feedback, and build the confidence to succeed.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Link href="/my-resume" passHref>
                  <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg transform hover:scale-105 transition-transform cursor-pointer">
                    Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </ParallaxBannerLayer>

          {/* Foreground Text Layer 1: Instant Feedback */}
          <ParallaxBannerLayer speed={5}>
            <div className="absolute bottom-[25%] md:bottom-[30%] left-[5%] md:left-[10%]">
              <h3 className="text-3xl animate-pulse sm:text-4xl text-sky-300/50 font-bold transform rotate-8">
                Instant Feedback
              </h3>
            </div>
          </ParallaxBannerLayer>

          {/* Foreground Text Layer 2: Build Confidence */}
          <ParallaxBannerLayer speed={12}>
            <div className="absolute top-[25%] right-[10%] md:right-[15%]">
              <h3 className="text-3xl animate-pulse sm:text-4xl text-sky-300/50 font-bold transform -rotate-6">
                Build Confidence
              </h3>
            </div>
          </ParallaxBannerLayer>

        </ParallaxBanner>

        {/* How We Help Section (Unchanged) */}
        <section className="py-20 md:py-28 bg-muted/30">
          <div className="container mx-auto px-6">
            <motion.h2
              initial={{ opacity: 0, y:20 }}
              whileInView={{ opacity: 1, y:0 }}
              viewport={{ once: false }}
              transition={{ duration: 1.0 }}
              className="text-4xl font-bold text-center mb-16 text-foreground"
            >
              Unlock Your Interview Potential
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y:0 }}
              viewport={{ once: false }}
              transition={{ duration: 1.5, delay: 0.2, type: 'spring' }}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              <FeatureCard
                icon={Briefcase}
                title="Resume-Tailored Questions"
                description="Our AI analyzes your resume to generate relevant technical, behavioral, and situational questions."
              />
              <FeatureCard
                icon={Zap}
                title="Boost Confidence"
                description="Practice in a safe, simulated environment to reduce anxiety and improve your delivery."
              />
              <FeatureCard
                icon={BarChart3}
                title="Actionable Feedback"
                description="Receive detailed scores, identify strengths & weaknesses, and get a personalized improvement plan."
              />
              <FeatureCard
                icon={MessageCircleHeart}
                title="Get Job Ready Faster"
                description="Sharpen your skills, learn what recruiters look for, and significantly increase your chances of getting hired."
              />
            </motion.div>
          </div>
        </section>

        {/* Call to Action or other sections (Unchanged) */}
        <section className="py-20 text-center">
            <motion.div 
              className="container mx-auto px-6"
              initial={{ opacity: 0, y:20 }}
              whileInView={{ opacity: 1, y:0 }}
              viewport={{ once: false }}
              transition={{ duration: 1.2 }}
            >
                <motion.h2 
                  initial={{ opacity: 0, y:20 }}
                  whileInView={{ opacity: 1, y:0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 1.2 }}
                  className="text-3xl font-bold mb-6"
                >
                  Ready to Nail Your Next Interview?
                </motion.h2>
                <motion.p
                  className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto"
                  initial={{ opacity: 0, y:30 }}
                  whileInView={{ opacity: 1, y:0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 1.2 }}
                >
                    Stop guessing what interviewers will ask. Start practicing with purpose.
                </motion.p>
                <Link href="/my-resume" passHref>
                    <Button size="lg" variant="default" className="text-lg px-10 py-7 rounded-full shadow-lg transform hover:scale-105 transition-transform">
                        Begin Your Transformation <ArrowRight className="ml-3 h-6 w-6" />
                    </Button>
                </Link>
            </motion.div>
        </section>
      </main>
    </ParallaxProvider>
  );
}