"use client";
import { useEffect, useState } from 'react';
import { TimerIcon } from 'lucide-react';

// Simple Timer Component
const SectionTimer = ({ durationMinutes, onTimeUp }: { durationMinutes: number, onTimeUp: () => void }) => {
    const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp();
            return;
        }
        const intervalId = setInterval(() => {
            setTimeLeft(prevTime => prevTime - 1);
        }, 1000);
        return () => clearInterval(intervalId);
    }, [timeLeft, onTimeUp]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className={`text-lg font-semibold p-2 rounded-md flex items-center ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-foreground'}`}>
            <TimerIcon className="mr-2 h-5 w-5" />
            Time Left: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </div>
    );
};

export default SectionTimer;