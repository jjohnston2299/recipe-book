'use client';

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { AIFeaturesContext } from '@/context/AIFeaturesContext'
import { LAYOUT } from '@/constants'

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
            {LAYOUT.APP_NAME}
          </Link>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm mr-2">
                <span className="sm:hidden">{LAYOUT.AI_TOGGLE.SHORT}</span>
                <span className="hidden sm:inline">{LAYOUT.AI_TOGGLE.FULL}</span>
              </span>
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
            <Link 
              href="/recipes/new"
              className="bg-[#D1D8BE] text-[#819A91] px-4 py-2 rounded hover:bg-white transition-colors font-medium flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 sm:hidden"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="hidden sm:inline">{LAYOUT.NAVIGATION.NEW_RECIPE}</span>
            </Link>
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