'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Recipe } from '@/types/recipe';
import { RECIPE_FORM } from '@/constants';

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
};

export function useRecipeForm(recipe?: Recipe, onSuccess?: () => void): UseRecipeFormReturn {
  const router = useRouter();
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

  const [imagePreview, setImagePreview] = useState<string | null>(
    recipe?.imageUrl || null
  );
  const [uploadProgress, setUploadProgress] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      if (onSuccess) {
        onSuccess();
      } else {
        if (recipe) {
          router.push(`/recipes/${recipe._id}`);
        } else {
          router.push('/');
        }
        router.refresh();
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert(RECIPE_FORM.ERRORS.SAVE_FAILED);
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
  };
} 