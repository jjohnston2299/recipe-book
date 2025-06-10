'use client';

import { useState } from 'react';
import { Recipe } from '@/types/recipe';
import { RECIPE_FORM } from '@/constants';

type FormData = Omit<Recipe, '_id'>;

type UseRecipeAIReturn = {
  isGeneratingDesc: boolean;
  isGeneratingTags: boolean;
  isGeneratingComplete: boolean;
  generateDescription: () => Promise<void>;
  generateTags: () => Promise<void>;
  generateCompleteRecipe: () => Promise<void>;
};

export function useRecipeAI(
  formData: FormData,
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
): UseRecipeAIReturn {
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [isGeneratingComplete, setIsGeneratingComplete] = useState(false);

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

  return {
    isGeneratingDesc,
    isGeneratingTags,
    isGeneratingComplete,
    generateDescription,
    generateTags,
    generateCompleteRecipe,
  };
} 