'use client';

import { useState } from 'react';
import { getRecipeRecommendation, getRecipeModification } from '@/lib/openai';

export default function AIRecipePage() {
  const [prompt, setPrompt] = useState('');
  const [recipe, setRecipe] = useState('');
  const [modification, setModification] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGetRecommendation = async () => {
    setIsLoading(true);
    try {
      const recommendation = await getRecipeRecommendation(prompt);
      setResult(recommendation || 'No recommendation found');
    } catch (error) {
      console.error('Error getting recipe recommendation:', error);
      setResult('Failed to get recipe recommendation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetModification = async () => {
    setIsLoading(true);
    try {
      const modifiedRecipe = await getRecipeModification(recipe, modification);
      setResult(modifiedRecipe || 'No modification found');
    } catch (error) {
      console.error('Error getting recipe modification:', error);
      setResult('Failed to get recipe modification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">AI Recipe Assistant</h1>

      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Get Recipe Recommendation</h2>
          <div className="space-y-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your recipe request (e.g., 'I want a healthy vegetarian dinner recipe')"
              className="w-full h-32 p-2 border rounded"
            />
            <button
              onClick={handleGetRecommendation}
              disabled={isLoading || !prompt}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
            >
              {isLoading ? 'Getting Recommendation...' : 'Get Recommendation'}
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Modify Existing Recipe</h2>
          <div className="space-y-4">
            <textarea
              value={recipe}
              onChange={(e) => setRecipe(e.target.value)}
              placeholder="Paste your recipe here"
              className="w-full h-32 p-2 border rounded"
            />
            <input
              type="text"
              value={modification}
              onChange={(e) => setModification(e.target.value)}
              placeholder="Enter modification request (e.g., 'make it gluten-free')"
              className="w-full p-2 border rounded"
            />
            <button
              onClick={handleGetModification}
              disabled={isLoading || !recipe || !modification}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
            >
              {isLoading ? 'Getting Modification...' : 'Get Modification'}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Result</h2>
            <pre className="whitespace-pre-wrap font-mono text-sm">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
} 