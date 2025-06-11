'use client';

import { useState } from 'react';
import { recipeApi } from '@/services/api/recipeApi';
import { RECIPE_FORM } from '@/constants';

export default function TestErrorsPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testNetworkError = async () => {
    setLoading(true);
    setError(null);
    try {
      // Using a non-existent endpoint to trigger network error
      await fetch('http://localhost:1234/non-existent');
    } catch {
      setError(RECIPE_FORM.ERRORS.NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const testValidationError = async () => {
    setLoading(true);
    setError(null);
    try {
      // Sending invalid data to trigger validation error
      await recipeApi.create({
        title: '',
        description: '',
        ingredients: [],
        instructions: [],
        imageUrl: 'invalid-url',
        prepTime: -1,
        cookTime: -1,
        cuisineType: '',
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch {
      setError(RECIPE_FORM.ERRORS.VALIDATION_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const testNotFoundError = async () => {
    setLoading(true);
    setError(null);
    try {
      // Using non-existent recipe ID
      await fetch('/api/recipes/non-existent-id');
    } catch {
      setError('Recipe not found');
    } finally {
      setLoading(false);
    }
  };

  const testAIServiceError = async () => {
    setLoading(true);
    setError(null);
    try {
      // Attempting to generate with invalid data
      await recipeApi.ai.generateDescription({
        title: '',
        ingredients: [],
        instructions: []
      });
    } catch {
      setError(RECIPE_FORM.ERRORS.AI_SERVICE_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const testImageUploadError = async () => {
    setLoading(true);
    setError(null);
    try {
      // Create an invalid file object
      const invalidFile = new File([""], "test.txt", { type: "text/plain" });
      await recipeApi.uploadImage(invalidFile);
    } catch {
      setError(RECIPE_FORM.ERRORS.UPLOAD_FAILED);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Error Handler Testing</h1>
      
      <div className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {loading && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative">
            Loading...
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={testNetworkError}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            disabled={loading}
          >
            Test Network Error
          </button>

          <button
            onClick={testValidationError}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            disabled={loading}
          >
            Test Validation Error
          </button>

          <button
            onClick={testNotFoundError}
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
            disabled={loading}
          >
            Test Not Found Error
          </button>

          <button
            onClick={testAIServiceError}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
            disabled={loading}
          >
            Test AI Service Error
          </button>

          <button
            onClick={testImageUploadError}
            className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
            disabled={loading}
          >
            Test Image Upload Error
          </button>
        </div>

        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold mb-2">Instructions:</h2>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Network Error:</strong> Attempts to fetch from a non-existent endpoint</li>
            <li><strong>Validation Error:</strong> Tries to create a recipe with invalid data</li>
            <li><strong>Not Found Error:</strong> Attempts to fetch a non-existent recipe</li>
            <li><strong>AI Service Error:</strong> Tries to generate AI content with invalid data</li>
            <li><strong>Image Upload Error:</strong> Attempts to upload an invalid file</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 