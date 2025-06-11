'use client';

import Image from 'next/image';
import { useAIFeatures } from '@/context/AIFeaturesContext';
import { RecipeFormProps } from '@/types/recipe';
import { RECIPE_FORM } from '@/constants';
import Link from 'next/link';
import Form from './Form';
import { useRecipeForm } from '@/hooks/useRecipeForm';
import { useRecipeAI } from '@/hooks/useRecipeAI';

export default function RecipeForm({ recipe, onSuccess }: RecipeFormProps) {
  const showAIFeatures = useAIFeatures();
  const {
    formData,
    setFormData,
    imagePreview,
    setImagePreview,
    handleImageUpload,
    isSubmitting,
    handleSubmit,
  } = useRecipeForm(recipe, onSuccess);

  const {
    isGeneratingDesc,
    isGeneratingTags,
    isGeneratingComplete,
    generateDescription,
    generateTags,
    generateCompleteRecipe,
  } = useRecipeAI(formData, setFormData);

  if (!showAIFeatures) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-[#D1D8BE]">
          <Form
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isGeneratingDesc={false}
            isGeneratingTags={false}
            isGeneratingComplete={false}
            generateDescription={async () => Promise.resolve()}
            generateTags={async () => Promise.resolve()}
            generateCompleteRecipe={async () => Promise.resolve()}
          />
        </div>
      </div>
    );
    }

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

        <Form
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isGeneratingDesc={isGeneratingDesc}
          isGeneratingTags={isGeneratingTags}
          isGeneratingComplete={isGeneratingComplete}
          generateDescription={generateDescription}
          generateTags={generateTags}
          generateCompleteRecipe={generateCompleteRecipe}
        />
      </div>
    </div>
  );
} 