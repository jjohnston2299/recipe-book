'use client';

import { useState, useEffect } from 'react';
import { Recipe } from '@/types/recipe';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [maxTotalTime, setMaxTotalTime] = useState<number>(360);
  const [cuisineTypes, setCuisineTypes] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const response = await fetch('/api/recipes');
        if (!response.ok) {
          throw new Error('Failed to fetch recipes');
        }
        const fetchedRecipes: Recipe[] = await response.json();
        setRecipes(fetchedRecipes);
        
        // Extract unique cuisine types
        const uniqueCuisines = Array.from(
          new Set(fetchedRecipes.map(recipe => recipe.cuisineType))
        ).sort();
        setCuisineTypes(uniqueCuisines);

        // Extract unique tags
        const uniqueTags = Array.from(
          new Set(fetchedRecipes.flatMap(recipe => recipe.tags || []))
        ).sort();
        setAvailableTags(uniqueTags);
      } catch (error) {
        console.error('Error loading recipes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecipes();
  }, []);

  const filteredRecipes = recipes
    .filter(recipe => !selectedCuisine || recipe.cuisineType === selectedCuisine)
    .filter(recipe => 
      !searchQuery || 
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(recipe => {
      const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
      return totalTime <= maxTotalTime;
    })
    .filter(recipe => 
      selectedTags.length === 0 || 
      selectedTags.every(tag => recipe.tags?.includes(tag))
    );

  const clearAllFilters = () => {
    setSelectedCuisine('');
    setSearchQuery('');
    setMaxTotalTime(360);
    setSelectedTags([]);
  };

  return {
    recipes: filteredRecipes,
    selectedCuisine,
    setSelectedCuisine,
    searchQuery,
    setSearchQuery,
    maxTotalTime,
    setMaxTotalTime,
    cuisineTypes,
    availableTags,
    selectedTags,
    setSelectedTags,
    isLoading,
    clearAllFilters,
  };
} 