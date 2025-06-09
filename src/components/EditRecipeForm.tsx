'use client';

import RecipeForm from './RecipeForm';
import { Recipe } from '@/types/recipe';

interface EditRecipeFormProps {
  recipe: Recipe;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export default function EditRecipeForm({ recipe, onCancel, onSuccess }: EditRecipeFormProps) {
  return <RecipeForm recipe={recipe} onCancel={onCancel} onSuccess={onSuccess} />;
} 