'use client';

import Image from 'next/image';
import { useAIFeatures } from '@/context/AIFeaturesContext';
import { RecipeFormProps } from '@/types/recipe';
import { RECIPE_FORM } from '@/constants';
import Link from 'next/link';
import Form from './Form';
import { useRecipeForm } from '@/hooks/useRecipeForm';
import { useRecipeAI } from '@/hooks/useRecipeAI';
import { LAYOUT } from '@/constants';

export default function RecipeForm({ recipe, onSuccess }: RecipeFormProps) {
  const showAIFeatures = useAIFeatures();
  const {
    formData,
    setFormData,
    imagePreview,
    setImagePreview,
    uploadProgress,
    handleImageUpload,
    handleSubmit,
    isSubmitting,
  } = useRecipeForm(recipe, onSuccess);

  const {
    isGeneratingDesc,
    isGeneratingTags,
    isGeneratingComplete,
    generateDescription,
    generateTags,
    generateCompleteRecipe,
  } = useRecipeAI(formData, setFormData);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Link
          href={recipe ? `/recipes/${recipe._id}` : '/'}
          className="inline-flex items-center text-[#819A91] hover:text-[#A7C1A8] font-accent"
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
          <span className="hidden sm:inline">{LAYOUT.NAVIGATION.BACK_TO_RECIPE}</span>
        </Link>
        <div className="flex gap-4">
            <label className="bg-[#819A91] text-white px-4 py-2 rounded-md hover:bg-[#A7C1A8] cursor-pointer transition-colors flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 sm:h-5 sm:w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="hidden sm:inline">{RECIPE_FORM.BUTTONS.UPLOAD_IMAGE}</span>
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
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 sm:h-5 sm:w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="hidden sm:inline">{RECIPE_FORM.BUTTONS.REMOVE_IMAGE}</span>
              </button>
            )}
          </div>
        </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-[#D1D8BE]">
        <div className="relative aspect-video">
          {imagePreview ? (
            <>
              <Image
                src={imagePreview}
                alt="Recipe preview"
                fill={true}
                className="object-cover"
                priority={true}
              />
              {uploadProgress === 'uploading' && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white">
                  {RECIPE_FORM.UPLOAD_STATUS.UPLOADING}
                </div>
              )}
              {uploadProgress === 'done' && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg">
                  {RECIPE_FORM.UPLOAD_STATUS.SUCCESS}
                </div>
              )}
              {uploadProgress === 'error' && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg">
                  {RECIPE_FORM.UPLOAD_STATUS.ERROR}
                </div>
              )}
            </>
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