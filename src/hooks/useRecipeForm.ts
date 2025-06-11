'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Recipe } from '@/types/recipe';
import { RECIPE_FORM } from '@/constants';
import { recipeApi } from '@/services/api/recipeApi';
import { isAPIError, NetworkError } from '@/services/api/errors';

type FormData = Omit<Recipe, '_id'>;

type UseRecipeFormReturn = {
  imagePreview: string | null;
  setImagePreview: (url: string | null) => void;
  uploadProgress: 'idle' | 'uploading' | 'done' | 'error';
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  isSubmitting: boolean;
  handleSubmit: (e: FormEvent) => Promise<void>;
  error: string | null;
};

const initialFormData: FormData = {
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
};

export function useRecipeForm(recipe?: Recipe, onSuccess?: () => void): UseRecipeFormReturn {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(recipe || initialFormData);
  const [imagePreview, setImagePreview] = useState<string | null>(recipe?.imageUrl || null);
  const [uploadProgress, setUploadProgress] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setUploadProgress('uploading');
    setError(null);

    try {
      const result = await recipeApi.uploadImage(file);
      setFormData(prev => ({ ...prev, imageUrl: result.url }));
      setUploadProgress('done');
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadProgress('error');
      
      if (error instanceof NetworkError) {
        setError(RECIPE_FORM.ERRORS.NETWORK_ERROR);
      } else if (isAPIError(error)) {
        setError(error.message);
      } else {
        setError(RECIPE_FORM.ERRORS.UPLOAD_FAILED);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const cleanedData = {
        ...formData,
        ingredients: formData.ingredients.filter(i => i.trim()),
        instructions: formData.instructions.filter(i => i.trim()),
      };

      if (recipe) {
        await recipeApi.update(recipe._id, cleanedData);
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/recipes/${recipe._id}`);
          router.refresh();
        }
      } else {
        await recipeApi.create(cleanedData);
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/');
          router.refresh();
        }
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      if (error instanceof NetworkError) {
        setError(RECIPE_FORM.ERRORS.NETWORK_ERROR);
      } else if (isAPIError(error)) {
        setError(error.message);
      } else {
        setError(RECIPE_FORM.ERRORS.SAVE_FAILED);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    imagePreview,
    setImagePreview,
    uploadProgress,
    handleImageUpload,
    formData,
    setFormData,
    isSubmitting,
    handleSubmit,
    error,
  };
} 