'use client';

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { AIFeaturesContext } from '@/context/AIFeaturesContext'

interface LayoutWrapperProps {
  children: React.ReactNode;
  caveatClassName: string;
}

export function LayoutWrapper({ children, caveatClassName }: LayoutWrapperProps) {
  const [showAIFeatures, setShowAIFeatures] = useState(true);

  useEffect(() => {
    // Load preference from localStorage
    const savedPreference = localStorage.getItem('showAIFeatures');
    if (savedPreference !== null) {
      setShowAIFeatures(savedPreference === 'true');
    }
  }, []);

  const toggleAIFeatures = () => {
    const newValue = !showAIFeatures;
    setShowAIFeatures(newValue);
    localStorage.setItem('showAIFeatures', String(newValue));
  };

  return (
    <>
      <nav className="bg-[#819A91] text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link 
            href="/" 
            className={`${caveatClassName} text-2xl font-bold hover:text-[#D1D8BE] transition-colors`}
          >
            Recipe Book
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm mr-2">AI Assistant</span>
            <button
              onClick={toggleAIFeatures}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                showAIFeatures ? 'bg-[#D1D8BE]' : 'bg-[#4A5A53]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  showAIFeatures ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </nav>
      <AIFeaturesContext.Provider value={showAIFeatures}>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </AIFeaturesContext.Provider>
    </>
  );
} 