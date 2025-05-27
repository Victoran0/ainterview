"use client"
import Head from 'next/head';
import Link from 'next/link';
import { ParallaxProvider, ParallaxBanner, ParallaxBannerLayer } from 'react-scroll-parallax';
import { Button } from '@/components/ui/button';
import { ArrowRight, Briefcase, Zap, BarChart3, MessageCircleHeart } from 'lucide-react';

import { motion } from 'framer-motion';

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

// Define image paths for clarity - ensure these files are in your /public directory
const parallaxImagePaths = {
  meeting: '/images/input_file_0.png',      // Represents collaboration, initial interview stages
  aiInterface: '/images/input_file_1.jpeg', // Represents AI feedback, technology interaction
  aiAvatar: '/images/input_file_2.png',     // Represents personalized AI guidance, user interaction
};

// Define the layers for the ParallaxBanner
// If using TypeScript, you might want to type this array as: const bannerLayers: BannerLayer[] = [...]
const bannerLayers = [
  // Image Layer 1: Meeting - Fades out first
  {
    image: parallaxImagePaths.aiAvatar,
    speed: -15, // Background images move slower
    opacity: [1, 0, 0, 0], // Visible at 0%, fades to 0 by 33%, stays 0
    className: 'bg-cover bg-center',
    shouldAlwaysCompleteAnimation: true,
  },
  // Image Layer 2: AI Interface - Fades in, then out
  {
    image: parallaxImagePaths.aiInterface,
    speed: 20,
    opacity: [0, 1, 0, 0], // Fades in by 33%, fades out by 66%
    className: 'bg-cover bg-center',
    shouldAlwaysCompleteAnimation: true,
  },
  // // Image Layer 3: AI Avatar - Fades in last and stays
  // {
  //   image: parallaxImagePaths.meeting,
  //   speed: 40,
  //   opacity: [0, 0, 1, 1], // Fades in by 66%, stays visible till 100%
  //   className: 'bg-cover bg-center',
  //   shouldAlwaysCompleteAnimation: true,
  // },
  // Main Hero Content Layer (On top of images)
  {
    speed: -5, // Content moves slightly faster than deep background for parallax
    shouldAlwaysCompleteAnimation: true,
    children: (
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 z-10"> {/* z-10 for stacking */}
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }} // Changed to animate for direct control
          transition={{ duration: 0.8, delay: 0.2, type: 'spring', stiffness: 100 }}
          className="text-5xl md:text-7xl font-extrabold text-white mb-6"
          style={{ textShadow: '0 0 25px rgba(0,0,0,0.9)' }}
        >
          Ace Your Interviews with AI
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, type: 'spring', stiffness: 100 }}
          className="text-xl md:text-2xl text-gray-200 mb-10 max-w-3xl"
          style={{ textShadow: '0 0 15px rgba(0,0,0,0.8)' }}
        >
          Practice with a smart AI interviewer, get personalized feedback, and build the confidence to succeed.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
          whileHover={{ scale: 1.05 }}
        >
          <Link href="/interview/new" passHref>
            <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-xl transform transition-transform duration-200 cursor-pointer">
              Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    ),
  },
];

export default function HomePage() {
  return (
    <ParallaxProvider>
      <Head>
        <title>Interviewer AI - Land Your Dream Job</title>
        <meta name="description" content="AI-powered interview coaching to boost your confidence and skills." />
      </Head>

      <main className="bg-background text-foreground">
        {/* Updated Parallax Hero Section using the layers prop */}
        <ParallaxBanner
          layers={bannerLayers}
          style={{ height: '100vh' }}
          className="bg-slate-950 relative overflow-hidden" // Darker fallback, overflow hidden
        />
  
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
                <Link href="/interview/new" passHref>
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