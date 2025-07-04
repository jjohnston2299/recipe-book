'use client';

import RecipeFilters from '@/components/RecipeFilters/RecipeFilters';
import RecipeGrid from '@/components/RecipeGrid/RecipeGrid';
import { useRecipes } from '@/hooks/useRecipes';

export default function Home() {
  const {
    recipes,
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
  } = useRecipes();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-[#819A91] text-lg">Loading recipes...</div>
      </div>
    );
  }

  return (
    <div>
      <RecipeFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCuisine={selectedCuisine}
        setSelectedCuisine={setSelectedCuisine}
        maxTotalTime={maxTotalTime}
        setMaxTotalTime={setMaxTotalTime}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        cuisineTypes={cuisineTypes}
        availableTags={availableTags}
        clearAllFilters={clearAllFilters}
      />

      <RecipeGrid recipes={recipes} />
    </div>
  );
} 