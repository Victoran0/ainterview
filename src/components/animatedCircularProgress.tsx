// components/ui/animated-circular-progress.tsx
"use client"
import React, { useEffect, useState } from "react";

const AnimatedCircularProgress = ({ percentage }: { percentage: number }) => {
    const [displayedValue, setDisplayedValue] = useState(0);

    useEffect(() => {
        let start: number | null = null;
        const duration = 1000; // 1 second animation
        const target = Math.max(0, Math.min(100, percentage)); // Clamp percentage between 0 and 100
        
        const animate = (timestamp: number) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            setDisplayedValue(Math.floor(progress * target));
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setDisplayedValue(target); // Ensure it ends exactly on target
            }
        };
        
        // Reset if percentage changes drastically or to 0 to ensure re-animation
        setDisplayedValue(0); 
        requestAnimationFrame(animate);

        return () => { // Cleanup function
            start = null; // Reset start for next animation if component re-renders with new percentage
        };
    }, [percentage]);

    const strokeDashoffset = 100 - displayedValue; // For a full circle progress

    return (
        <div className="relative w-32 h-32 md:w-36 md:h-36 mx-auto">
            <svg className="w-full h-full" viewBox="0 0 36 36" transform="rotate(-90 18 18)"> {/* Rotate to start from top */}
                <path 
                    className="text-slate-700" // Background track color
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                />
                <path
                    className="text-primary transition-all duration-300 ease-out" // Progress bar color
                    strokeDasharray="100" // Circumference (approx)
                    strokeDashoffset={strokeDashoffset}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl md:text-3xl font-bold text-primary">
                    {Math.round(displayedValue)}% {/* Display rounded value during animation */}
                </span>
            </div>
        </div>
    );
};

export default AnimatedCircularProgress;