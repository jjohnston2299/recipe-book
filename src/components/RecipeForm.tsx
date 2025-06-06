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
  description: string;
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
    description: string;
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
      description: '',
    }
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [isGeneratingComplete, setIsGeneratingComplete] = useState(false);
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

  const generateDescription = async () => {
    if (!formData.title || formData.ingredients.length === 0 || formData.instructions.length === 0) {
      alert('Please fill in the title, ingredients, and instructions first.');
      return;
    }

    setIsGeneratingDesc(true);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-description',
          title: formData.title,
          ingredients: formData.ingredients.filter(i => i.trim()),
          instructions: formData.instructions.filter(i => i.trim())
        })
      });

      if (!response.ok) throw new Error('Failed to generate description');
      const { description } = await response.json();

      setFormData(prev => ({
        ...prev,
        description
      }));
    } catch (error) {
      console.error('Error generating description:', error);
      alert('Failed to generate description. Please try again.');
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const generateTags = async () => {
    if (!formData.title || formData.ingredients.length === 0 || formData.instructions.length === 0) {
      alert('Please fill in the title, ingredients, and instructions first.');
      return;
    }

    setIsGeneratingTags(true);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'suggest-tags',
          title: formData.title,
          ingredients: formData.ingredients.filter(i => i.trim()),
          instructions: formData.instructions.filter(i => i.trim())
        })
      });

      if (!response.ok) throw new Error('Failed to generate tags');
      const { tags } = await response.json();

      setFormData(prev => ({
        ...prev,
        tags: [...new Set([...prev.tags, ...tags])].slice(0, 3)
      }));
    } catch (error) {
      console.error('Error generating tags:', error);
      alert('Failed to generate tags. Please try again.');
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const generateCompleteRecipe = async () => {
    if (!formData.title) {
      alert('Please enter a recipe title first.');
      return;
    }

    setIsGeneratingComplete(true);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-complete',
          title: formData.title
        })
      });

      if (!response.ok) throw new Error('Failed to generate recipe');
      const { recipe: generatedRecipe } = await response.json();

      setFormData(prev => ({
        ...prev,
        description: generatedRecipe.description,
        ingredients: generatedRecipe.ingredients,
        instructions: generatedRecipe.instructions,
        prepTime: generatedRecipe.prepTime,
        cookTime: generatedRecipe.cookTime,
        cuisineType: generatedRecipe.cuisineType,
        tags: generatedRecipe.tags
      }));
    } catch (error) {
      console.error('Error generating complete recipe:', error);
      alert('Failed to generate recipe. Please try again.');
    } finally {
      setIsGeneratingComplete(false);
    }
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
          <div className="flex items-center justify-between mb-4">
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="flex-1 text-3xl font-bold border-0 focus:ring-0 p-0 text-[#819A91] placeholder-[#A7C1A8]"
              placeholder="Recipe Title"
            />
            <button
              type="button"
              onClick={generateCompleteRecipe}
              disabled={isGeneratingComplete || !formData.title}
              className={`ml-4 text-sm px-4 py-2 rounded ${
                isGeneratingComplete || !formData.title
                  ? 'bg-[#D1D8BE] cursor-not-allowed'
                  : 'bg-[#819A91] text-white hover:bg-[#A7C1A8]'
              } transition-colors whitespace-nowrap`}
            >
              {isGeneratingComplete ? 'Generating Recipe...' : 'Generate Complete Recipe'}
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[#819A91] font-medium">Description</label>
              <button
                type="button"
                onClick={generateDescription}
                disabled={isGeneratingDesc}
                className={`text-sm px-3 py-1 rounded ${
                  isGeneratingDesc
                    ? 'bg-[#D1D8BE] cursor-not-allowed'
                    : 'bg-[#819A91] text-white hover:bg-[#A7C1A8]'
                } transition-colors`}
              >
                {isGeneratingDesc ? 'Generating...' : 'Generate Description'}
              </button>
            </div>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-md border-[#D1D8BE] focus:ring-[#819A91] focus:border-[#819A91] text-[#819A91]"
              rows={3}
              placeholder="Describe your recipe..."
            />
          </div>

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

          <div className="mt-12 mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[#819A91] font-medium">Tags <span className="text-sm text-[#A7C1A8]">({formData.tags.length}/3)</span></label>
              <button
                type="button"
                onClick={generateTags}
                disabled={isGeneratingTags}
                className={`text-sm px-3 py-1 rounded ${
                  isGeneratingTags
                    ? 'bg-[#D1D8BE] cursor-not-allowed'
                    : 'bg-[#819A91] text-white hover:bg-[#A7C1A8]'
                } transition-colors`}
              >
                {isGeneratingTags ? 'Generating...' : 'Generate Tags'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-[#F5F6F0] text-[#819A91] px-3 py-1 rounded-full flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      tags: prev.tags.filter((_, i) => i !== index)
                    }))}
                    className="text-[#819A91] hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {formData.tags.length < 3 && (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a tag"
                  className="flex-1 rounded-md border-[#D1D8BE] focus:ring-[#819A91] focus:border-[#819A91] text-[#819A91]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.currentTarget;
                      const value = input.value.trim();
                      if (value && !formData.tags.includes(value) && formData.tags.length < 3) {
                        setFormData(prev => ({
                          ...prev,
                          tags: [...prev.tags, value]
                        }));
                        input.value = '';
                      }
                    }
                  }}
                />
              </div>
            )}
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