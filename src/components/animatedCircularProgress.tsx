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

    return (
        <div className="relative w-32 h-32 mx-auto">
            <svg className="w-full h-full" viewBox="0 0 36 36">
                <path className="text-muted/40" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" ></path>
                <path
                    className="text-primary"
                    strokeDasharray={`${displayedValue}, 100`}
                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    style={{ transition: "stroke-dasharray 0.1s ease-in-out" }}
                ></path>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-[#fff0f0]">
                    {Math.round(displayedValue)}%
                </span>
            </div>
        </div>
    );
};

export default AnimatedCircularProgress;