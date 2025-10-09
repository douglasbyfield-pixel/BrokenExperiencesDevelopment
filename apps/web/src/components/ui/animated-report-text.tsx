"use client";

import { useState, useEffect } from 'react'

const CYCLING_WORDS = [
  'Slackness',
  'Issue',
  'Problem',
  'Disruption',
  'Inconvenience',
  'Frustration',
  'Breakdown',
  'Malfunction'
]

export function AnimatedReportText() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false)
      
      setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % CYCLING_WORDS.length)
        setIsVisible(true)
      }, 200)
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  return (
    <span className="inline-flex items-center">
      Report the&nbsp;
      <span 
        className={`transition-all duration-200 ease-in-out transform ${
          isVisible 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 -translate-y-1 scale-95'
        }`}
      >
        {CYCLING_WORDS[currentWordIndex]}!
      </span>
    </span>
  )
}