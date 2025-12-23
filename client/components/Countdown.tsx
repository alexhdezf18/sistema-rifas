"use client";

import { useState, useEffect } from "react";

interface CountdownProps {
  targetDate: string;
}

export default function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setIsExpired(true);
      }
    };

    // Calcular inmediatamente y luego cada segundo
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (isExpired) {
    return (
      <div className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg inline-block animate-pulse">
        🚫 Esta rifa ha finalizado
      </div>
    );
  }

  // Componente visual de una "cajita" de tiempo
  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center mx-2">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-3 w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mb-1 shadow-lg">
        <span className="text-2xl md:text-4xl font-black text-white">
          {value < 10 ? `0${value}` : value}
        </span>
      </div>
      <span className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-blue-200">
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex justify-center items-start my-6">
      <TimeBox value={timeLeft.days} label="Días" />
      <span className="text-3xl text-white/30 mt-2">:</span>
      <TimeBox value={timeLeft.hours} label="Hrs" />
      <span className="text-3xl text-white/30 mt-2">:</span>
      <TimeBox value={timeLeft.minutes} label="Min" />
      <span className="text-3xl text-white/30 mt-2">:</span>
      <TimeBox value={timeLeft.seconds} label="Seg" />
    </div>
  );
}
