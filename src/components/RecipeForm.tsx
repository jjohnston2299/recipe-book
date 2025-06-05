'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';

interface FormData {
  title: string;
  ingredients: string[];
  instructions: string[];
  imageUrl: string;
  prepTime: number;
  cookTime: number;
  cuisineType: string;
  tags: string[];
}

interface RecipeFormProps {
  recipe?: {
    _id: string;
    title: string;
    ingredients: string[];
    instructions: string[];
    imageUrl: string;
    prepTime: number;
    cookTime: number;
    cuisineType: string;
    tags: string[];
  };
  onCancel?: () => void;
  onSuccess?: () => void;
}

export default function RecipeForm({ recipe, onCancel, onSuccess }: RecipeFormProps) {
  const [formData, setFormData] = useState<FormData>(
    recipe || {
      title: '',
      ingredients: [''],
      instructions: [''],
      imageUrl: '',
      prepTime: 0,
      cookTime: 0,
      cuisineType: '',
      tags: [],
    }
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    recipe?.imageUrl || null
  );
  const [uploadProgress, setUploadProgress] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setUploadProgress('uploading');

    try {
      // Create FormData for the file upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload to our API endpoint
      const response = await fetch('/api/images', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to upload image');
      }

      // Store the image URL
      setFormData(prev => ({ ...prev, imageUrl: result.url }));
      setUploadProgress('done');
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadProgress('error');
      alert('Failed to upload image. Please try again.');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Filter out empty ingredients and instructions
      const cleanedData = {
        ...formData,
        ingredients: formData.ingredients.filter(i => i.trim()),
        instructions: formData.instructions.filter(i => i.trim()),
      };

      const url = recipe ? `/api/recipes/${recipe._id}` : '/api/recipes';
      const method = recipe ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      });

      if (!response.ok) {
        throw new Error(recipe ? 'Failed to update recipe' : 'Failed to create recipe');
      }

      if (recipe && onSuccess) {
        onSuccess();
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Failed to save recipe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, ''],
    });
  };

  const addInstruction = () => {
    setFormData({
      ...formData,
      instructions: [...formData.instructions, ''],
    });
  };

  const removeIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    });
  };

  const removeInstruction = (index: number) => {
    setFormData({
      ...formData,
      instructions: formData.instructions.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative aspect-video">
          {imagePreview ? (
            <Image
              src={imagePreview}
              alt="Recipe preview"
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-20 w-20 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
          <div className="absolute top-4 right-4 flex gap-2">
            <label className="bg-[#819A91] text-white px-4 py-2 rounded-md hover:bg-[#A7C1A8] cursor-pointer transition-colors">
              Upload Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            {imagePreview && (
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  setFormData(prev => ({ ...prev, imageUrl: '' }));
                }}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full text-3xl font-bold mb-4 border-0 focus:ring-0 p-0 text-[#819A91] placeholder-[#A7C1A8]"
            placeholder="Recipe Title"
          />

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center text-[#819A91]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <input
                type="number"
                min="0"
                required
                value={formData.prepTime}
                onChange={(e) => setFormData({ ...formData, prepTime: parseInt(e.target.value) })}
                className="w-16 border-0 p-0 bg-transparent"
              />
              <span className="ml-1">min prep</span>
            </div>
            <div className="flex items-center text-[#819A91]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <input
                type="number"
                min="0"
                required
                value={formData.cookTime}
                onChange={(e) => setFormData({ ...formData, cookTime: parseInt(e.target.value) })}
                className="w-16 border-0 p-0 bg-transparent"
              />
              <span className="ml-1">min cook</span>
            </div>
            <div className="flex items-center text-[#819A91]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              <input
                type="text"
                required
                value={formData.cuisineType}
                onChange={(e) => setFormData({ ...formData, cuisineType: e.target.value })}
                className="border-0 p-0 bg-transparent"
                placeholder="Cuisine Type"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-[#819A91]">Ingredients</h2>
              <div className="space-y-2">
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={ingredient}
                      onChange={(e) => {
                        const newIngredients = [...formData.ingredients];
                        newIngredients[index] = e.target.value;
                        setFormData({ ...formData, ingredients: newIngredients });
                      }}
                      className="w-full border-[#D1D8BE] rounded-md focus:border-[#A7C1A8] focus:ring-[#A7C1A8] text-[#819A91] placeholder-[#A7C1A8]"
                      placeholder="Add ingredient"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addIngredient}
                  className="text-[#819A91] hover:text-[#A7C1A8]"
                >
                  + Add Ingredient
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-[#819A91]">Instructions</h2>
              <div className="space-y-2">
                {formData.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-2">
                    <textarea
                      value={instruction}
                      onChange={(e) => {
                        const newInstructions = [...formData.instructions];
                        newInstructions[index] = e.target.value;
                        setFormData({ ...formData, instructions: newInstructions });
                      }}
                      className="w-full border-[#D1D8BE] rounded-md focus:border-[#A7C1A8] focus:ring-[#A7C1A8] text-[#819A91] placeholder-[#A7C1A8]"
                      placeholder={`Step ${index + 1}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeInstruction(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addInstruction}
                  className="text-[#819A91] hover:text-[#A7C1A8]"
                >
                  + Add Instruction
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2 text-[#819A91]">Tags</h2>
            <input
              type="text"
              value={formData.tags.join(', ')}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(tag => tag.trim()) })}
              className="w-full border-[#D1D8BE] rounded-md focus:border-[#A7C1A8] focus:ring-[#A7C1A8] text-[#819A91] placeholder-[#A7C1A8]"
              placeholder="Enter tags separated by commas"
            />
          </div>

          {uploadProgress === 'uploading' && (
            <div className="mt-4 text-[#819A91]">Uploading image...</div>
          )}
          {uploadProgress === 'done' && (
            <div className="mt-4 text-green-500">Image uploaded successfully!</div>
          )}
          {uploadProgress === 'error' && (
            <div className="mt-4 text-red-500">Failed to upload image. Please try again.</div>
          )}

          <div className="mt-8">
            <button
              type="submit"
              disabled={isSubmitting || uploadProgress === 'uploading'}
              className="w-full bg-[#819A91] text-white py-3 px-4 rounded-md hover:bg-[#A7C1A8] disabled:bg-[#D1D8BE] font-medium transition-colors"
            >
              {isSubmitting ? 'Saving Recipe...' : 'Save Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 