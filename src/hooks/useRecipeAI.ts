'use client';

import { useState } from 'react';
import { Recipe } from '@/types/recipe';
import { RECIPE_FORM } from '@/constants';
import { recipeApi } from '@/services/api/recipeApi';
import { isAPIError, NetworkError, AIServiceError } from '@/services/api/errors';

type FormData = Omit<Recipe, '_id'>;

type UseRecipeAIReturn = {
  isGeneratingDesc: boolean;
  isGeneratingTags: boolean;
  isGeneratingComplete: boolean;
  generateDescription: () => Promise<void>;
  generateTags: () => Promise<void>;
  generateCompleteRecipe: () => Promise<void>;
  error: string | null;
};

export function useRecipeAI(
  formData: FormData,
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
): UseRecipeAIReturn {
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [isGeneratingComplete, setIsGeneratingComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateRequiredFields = () => {
    if (!formData.title || formData.ingredients.length === 0 || formData.instructions.length === 0) {
      setError(RECIPE_FORM.ERRORS.MISSING_FIELDS);
      return false;
    }
    return true;
  };

  const handleAIError = (error: unknown, defaultMessage: string) => {
    console.error('AI service error:', error);
    if (error instanceof NetworkError) {
      setError(RECIPE_FORM.ERRORS.NETWORK_ERROR);
    } else if (error instanceof AIServiceError) {
      setError(RECIPE_FORM.ERRORS.AI_SERVICE_ERROR);
    } else if (isAPIError(error)) {
      setError(error.message);
    } else {
      setError(defaultMessage);
    }
  };

  const generateDescription = async () => {
    if (!validateRequiredFields()) return;
    setIsGeneratingDesc(true);
    setError(null);

    try {
      const data = await recipeApi.ai.generateDescription({
        title: formData.title,
        ingredients: formData.ingredients.filter(i => i.trim()),
        instructions: formData.instructions.filter(i => i.trim())
      });

      setFormData(prev => ({
        ...prev,
        description: data.description
      }));
    } catch (error) {
      handleAIError(error, RECIPE_FORM.ERRORS.GENERATE_DESCRIPTION_FAILED);
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const generateTags = async () => {
    if (!validateRequiredFields()) return;
    setIsGeneratingTags(true);
    setError(null);

    try {
      const data = await recipeApi.ai.generateTags({
        title: formData.title,
        ingredients: formData.ingredients.filter(i => i.trim()),
        instructions: formData.instructions.filter(i => i.trim())
      });

      setFormData(prev => ({
        ...prev,
        tags: [...new Set([...prev.tags, ...data.tags])].slice(0, 3)
      }));
    } catch (error) {
      handleAIError(error, RECIPE_FORM.ERRORS.GENERATE_TAGS_FAILED);
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const generateCompleteRecipe = async () => {
    if (!formData.title) {
      setError(RECIPE_FORM.ERRORS.MISSING_TITLE);
      return;
    }

    setIsGeneratingComplete(true);
    setError(null);

    try {
      const data = await recipeApi.ai.generateComplete(formData.title);

      setFormData(prev => ({
        ...prev,
        description: data.recipe.description || prev.description,
        ingredients: data.recipe.ingredients || prev.ingredients,
        instructions: data.recipe.instructions || prev.instructions,
        prepTime: data.recipe.prepTime || prev.prepTime,
        cookTime: data.recipe.cookTime || prev.cookTime,
        cuisineType: data.recipe.cuisineType || prev.cuisineType,
        tags: data.recipe.tags || prev.tags
      }));
    } catch (error) {
      handleAIError(error, RECIPE_FORM.ERRORS.GENERATE_RECIPE_FAILED);
    } finally {
      setIsGeneratingComplete(false);
    }
  };

  return {
    isGeneratingDesc,
    isGeneratingTags,
    isGeneratingComplete,
    generateDescription,
    generateTags,
    generateCompleteRecipe,
    error,
  };
} 