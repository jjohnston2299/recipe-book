'use client';

import RecipeForm from './RecipeForm';

interface Recipe {
  _id: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  imageUrl: string;
  prepTime: number;
  cookTime: number;
  cuisineType: string;
  tags: string[];
}

interface EditRecipeFormProps {
  recipe: {
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

export default function EditRecipeForm({ recipe, onCancel, onSuccess }: EditRecipeFormProps) {
  return <RecipeForm recipe={recipe} onCancel={onCancel} onSuccess={onSuccess} />;
} 