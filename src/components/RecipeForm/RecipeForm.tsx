'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';
import { useAIFeatures } from '@/context/AIFeaturesContext';
import { Recipe, RecipeFormProps } from '@/types/recipe';
import { RECIPE_FORM } from '@/constants';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type FormData = Omit<Recipe, '_id'>;

export default function RecipeForm({ recipe }: RecipeFormProps) {
  const router = useRouter();
  const showAIFeatures = useAIFeatures();
  const [formData, setFormData] = useState<FormData>(
    recipe || {
      title: '',
      description: '',
      ingredients: [''],
      instructions: [''],
      imageUrl: '',
      prepTime: 0,
      cookTime: 0,
      cuisineType: '',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setUploadProgress('uploading');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/images', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(RECIPE_FORM.ERRORS.UPLOAD_FAILED);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || RECIPE_FORM.ERRORS.UPLOAD_FAILED);
      }

      setFormData(prev => ({ ...prev, imageUrl: result.url }));
      setUploadProgress('done');
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadProgress('error');
      alert(RECIPE_FORM.ERRORS.UPLOAD_FAILED);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
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
        throw new Error(RECIPE_FORM.ERRORS.SAVE_FAILED);
      }

      if (recipe) {
        router.push(`/recipes/${recipe._id}`);
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert(RECIPE_FORM.ERRORS.SAVE_FAILED);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateDescription = async () => {
    if (!formData.title || formData.ingredients.length === 0 || formData.instructions.length === 0) {
      alert(RECIPE_FORM.ERRORS.MISSING_FIELDS);
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

      if (!response.ok) throw new Error(RECIPE_FORM.ERRORS.GENERATE_DESCRIPTION_FAILED);
      const { description } = await response.json();

      setFormData(prev => ({
        ...prev,
        description
      }));
    } catch (error) {
      console.error('Error generating description:', error);
      alert(RECIPE_FORM.ERRORS.GENERATE_DESCRIPTION_FAILED);
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const generateTags = async () => {
    if (!formData.title || formData.ingredients.length === 0 || formData.instructions.length === 0) {
      alert(RECIPE_FORM.ERRORS.MISSING_FIELDS);
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

      if (!response.ok) throw new Error(RECIPE_FORM.ERRORS.GENERATE_TAGS_FAILED);
      const { tags } = await response.json();

      setFormData(prev => ({
        ...prev,
        tags: [...new Set([...prev.tags, ...tags])].slice(0, 3)
      }));
    } catch (error) {
      console.error('Error generating tags:', error);
      alert(RECIPE_FORM.ERRORS.GENERATE_TAGS_FAILED);
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const generateCompleteRecipe = async () => {
    if (!formData.title) {
      alert(RECIPE_FORM.ERRORS.MISSING_TITLE);
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

      if (!response.ok) throw new Error(RECIPE_FORM.ERRORS.GENERATE_RECIPE_FAILED);
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
      alert(RECIPE_FORM.ERRORS.GENERATE_RECIPE_FAILED);
    } finally {
      setIsGeneratingComplete(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Link
          href={recipe ? `/recipes/${recipe._id}` : '/'}
          className="inline-flex items-center text-[#819A91] hover:text-[#A7C1A8]"
        >
              <svg
                xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 sm:h-5 sm:w-5 sm:mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
              >
                <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
                />
              </svg>
          <span className="hidden sm:inline">Back to Recipe</span>
        </Link>
        <div className="flex gap-4">
            <label className="bg-[#819A91] text-white px-4 py-2 rounded-md hover:bg-[#A7C1A8] cursor-pointer transition-colors">
              {RECIPE_FORM.BUTTONS.UPLOAD_IMAGE}
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
                {RECIPE_FORM.BUTTONS.REMOVE_IMAGE}
              </button>
            )}
          </div>
        </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-[#D1D8BE]">
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
                className="h-20 w-20 text-[#4A5A53]"
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
        </div>

        <form 
          className="p-6"
          role="form"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full text-2xl sm:text-3xl font-bold border-0 focus:ring-2 focus:ring-[#4A5A53] text-[#4A5A53] bg-[#F5F6F0] placeholder-[#A7C1A8] rounded-md px-3 py-2 focus:outline-none selection:bg-[#819A91] selection:text-white"
              placeholder={RECIPE_FORM.TITLE_PLACEHOLDER}
            />
            {showAIFeatures && (
              <button
                type="button"
                onClick={generateCompleteRecipe}
                disabled={isGeneratingComplete || !formData.title}
                className={`whitespace-nowrap text-sm px-4 py-2 rounded ${
                  isGeneratingComplete || !formData.title
                    ? 'bg-[#D1D8BE] cursor-not-allowed'
                    : 'bg-[#819A91] text-white hover:bg-[#A7C1A8] cursor-pointer'
                } transition-colors`}
              >
                {isGeneratingComplete ? RECIPE_FORM.BUTTONS.GENERATING_COMPLETE : RECIPE_FORM.BUTTONS.GENERATE_COMPLETE}
              </button>
            )}
          </div>

          <div className="mb-6">
            <div className="block text-[#819A91] font-medium mb-2">{RECIPE_FORM.LABELS.DESCRIPTION}</div>
            <div className="relative">
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-md border-[#D1D8BE] focus:ring-2 focus:ring-[#4A5A53] focus:border-[#4A5A53] text-[#4A5A53] bg-[#F5F6F0] placeholder-[#A7C1A8] focus:outline-none selection:bg-[#819A91] selection:text-white pr-12"
                rows={3}
                placeholder={RECIPE_FORM.DESCRIPTION_PLACEHOLDER}
              />
              {showAIFeatures && (
                <button
                  type="button"
                  onClick={generateDescription}
                  disabled={isGeneratingDesc}
                  className={`absolute top-2 right-2 p-2 rounded flex items-center justify-center ${
                    isGeneratingDesc
                      ? 'bg-[#D1D8BE] cursor-not-allowed'
                      : 'bg-[#819A91] text-white hover:bg-[#A7C1A8] cursor-pointer'
                  } transition-colors`}
                  title={isGeneratingDesc ? RECIPE_FORM.BUTTONS.GENERATING_DESCRIPTION : RECIPE_FORM.BUTTONS.GENERATE_DESCRIPTION}
                >
                  {isGeneratingDesc ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.6 8.3829l2.02-1.1638a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.3927-.6813zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
                      />
                    </svg>
                  )}
                </button>
              )}
            </div>
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
                type="text"
                pattern="[0-9]*"
                inputMode="numeric"
                required
                value={formData.prepTime === 0 ? '0' : formData.prepTime.toString()}
                onKeyDown={(e) => {
                  // Prevent 'e', '+', '-' characters
                  if (['e', 'E', '+', '-'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onPaste={(e) => {
                  // Get pasted content and ensure it's numeric and within limits
                  const pastedText = e.clipboardData.getData('text');
                  if (!/^\d+$/.test(pastedText) || pastedText.length > 3) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  let value = e.target.value.replace(/[^\d]/g, '').slice(0, 3);
                  
                  // Convert empty string to '0'
                  if (value === '') {
                    value = '0';
                  } else {
                    // Remove leading zeros
                    value = value.replace(/^0+/, '') || '0';
                  }
                  
                  const numValue = parseInt(value);
                  setFormData({ ...formData, prepTime: Math.min(numValue, 999) });
                }}
                className="w-12 border-0 focus:ring-2 focus:ring-[#4A5A53] bg-[#F5F6F0] text-[#4A5A53] rounded-md px-2 py-1 focus:outline-none selection:bg-[#819A91] selection:text-white text-center"
                aria-label="Preparation time in minutes"
              />
              <span className="ml-1">{RECIPE_FORM.LABELS.MIN_PREP}</span>
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
                type="text"
                pattern="[0-9]*"
                inputMode="numeric"
                required
                value={formData.cookTime === 0 ? '0' : formData.cookTime.toString()}
                onKeyDown={(e) => {
                  // Prevent 'e', '+', '-' characters
                  if (['e', 'E', '+', '-'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onPaste={(e) => {
                  // Get pasted content and ensure it's numeric and within limits
                  const pastedText = e.clipboardData.getData('text');
                  if (!/^\d+$/.test(pastedText) || pastedText.length > 3) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  let value = e.target.value.replace(/[^\d]/g, '').slice(0, 3);
                  
                  // Convert empty string to '0'
                  if (value === '') {
                    value = '0';
                  } else {
                    // Remove leading zeros
                    value = value.replace(/^0+/, '') || '0';
                  }
                  
                  const numValue = parseInt(value);
                  setFormData({ ...formData, cookTime: Math.min(numValue, 999) });
                }}
                className="w-12 border-0 focus:ring-2 focus:ring-[#4A5A53] bg-[#F5F6F0] text-[#4A5A53] rounded-md px-2 py-1 focus:outline-none selection:bg-[#819A91] selection:text-white text-center"
                aria-label="Cooking time in minutes"
              />
              <span className="ml-1">{RECIPE_FORM.LABELS.MIN_COOK}</span>
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
                className="border-0 focus:ring-2 focus:ring-[#4A5A53] bg-[#F5F6F0] text-[#4A5A53] rounded-md px-2 py-1 min-w-[120px] focus:outline-none selection:bg-[#819A91] selection:text-white"
                placeholder={RECIPE_FORM.CUISINE_PLACEHOLDER}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-[#819A91]">{RECIPE_FORM.LABELS.INGREDIENTS}</h2>
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
                      className="w-full rounded-md border-[#D1D8BE] focus:ring-2 focus:ring-[#4A5A53] focus:border-[#4A5A53] text-[#4A5A53] bg-[#F5F6F0] placeholder-[#A7C1A8] focus:outline-none selection:bg-[#819A91] selection:text-white"
                      placeholder={RECIPE_FORM.INGREDIENT_PLACEHOLDER}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newIngredients = formData.ingredients.filter((_, i) => i !== index);
                        setFormData({ ...formData, ingredients: newIngredients });
                      }}
                      className="text-[#A7C1A8] hover:text-[#819A91] cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    ingredients: [...formData.ingredients, ''],
                  })}
                  className="text-[#819A91] hover:text-[#A7C1A8] cursor-pointer"
                >
                  {RECIPE_FORM.BUTTONS.ADD_INGREDIENT}
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-[#819A91]">{RECIPE_FORM.LABELS.INSTRUCTIONS}</h2>
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
                      className="w-full rounded-md border-[#D1D8BE] focus:ring-2 focus:ring-[#4A5A53] focus:border-[#4A5A53] text-[#4A5A53] bg-[#F5F6F0] placeholder-[#A7C1A8] focus:outline-none selection:bg-[#819A91] selection:text-white"
                      placeholder={`Step ${index + 1}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newInstructions = formData.instructions.filter((_, i) => i !== index);
                        setFormData({ ...formData, instructions: newInstructions });
                      }}
                      className="text-[#A7C1A8] hover:text-[#819A91] cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    instructions: [...formData.instructions, ''],
                  })}
                  className="text-[#819A91] hover:text-[#A7C1A8] cursor-pointer"
                >
                  {RECIPE_FORM.BUTTONS.ADD_INSTRUCTION}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-12 mb-6 md:max-w-[50%]">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[#819A91] font-medium">{RECIPE_FORM.LABELS.TAGS} <span className="text-sm text-[#A7C1A8]">({formData.tags.length}/3)</span></label>
              {showAIFeatures && (
                <button
                  type="button"
                  onClick={generateTags}
                  disabled={isGeneratingTags}
                  className={`p-2 rounded flex items-center justify-center ${
                    isGeneratingTags
                      ? 'bg-[#D1D8BE] cursor-not-allowed'
                      : 'bg-[#819A91] text-white hover:bg-[#A7C1A8] cursor-pointer'
                  } transition-colors`}
                  title={isGeneratingTags ? RECIPE_FORM.BUTTONS.GENERATING_TAGS : RECIPE_FORM.BUTTONS.GENERATE_TAGS}
                >
                  {isGeneratingTags ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.6 8.3829l2.02-1.1638a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.3927-.6813zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
                      />
                    </svg>
                  )}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-[#F5F6F0] text-[#4A5A53] px-3 py-1 rounded-full flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      tags: prev.tags.filter((_, i) => i !== index)
                    }))}
                    className="text-[#A7C1A8] hover:text-[#819A91] cursor-pointer"
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
                  className="flex-1 rounded-md border-[#D1D8BE] focus:ring-2 focus:ring-[#4A5A53] focus:border-[#4A5A53] text-[#4A5A53] bg-[#F5F6F0] placeholder-[#A7C1A8] focus:outline-none selection:bg-[#819A91] selection:text-white"
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
            <div className="mt-4 text-[#819A91]">{RECIPE_FORM.UPLOAD_STATUS.UPLOADING}</div>
          )}
          {uploadProgress === 'done' && (
            <div className="mt-4 text-green-500">{RECIPE_FORM.UPLOAD_STATUS.SUCCESS}</div>
          )}
          {uploadProgress === 'error' && (
            <div className="mt-4 text-red-500">{RECIPE_FORM.UPLOAD_STATUS.ERROR}</div>
          )}

          <div className="mt-8">
            <button
              type="submit"
              disabled={isSubmitting || uploadProgress === 'uploading'}
              className="w-full bg-[#819A91] text-white py-3 px-4 rounded-md hover:bg-[#A7C1A8] disabled:bg-[#D1D8BE] font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? RECIPE_FORM.BUTTONS.SAVING_RECIPE : RECIPE_FORM.BUTTONS.SAVE_RECIPE}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 