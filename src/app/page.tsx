'use client';

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

interface Recipe {
  _id: string;
  title: string;
  imageUrl: string;
  cuisineType: string;
  prepTime: number;
  cookTime: number;
  tags: string[];
}

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [maxTotalTime, setMaxTotalTime] = useState<number>(360);
  const [cuisineTypes, setCuisineTypes] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);
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

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-[#819A91] text-lg">Loading recipes...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#819A91]">My Recipes</h1>
        <Link 
          href="/recipes/new"
          className="bg-[#819A91] text-white px-4 py-2 rounded hover:bg-[#A7C1A8] transition-colors"
        >
          Add New Recipe
        </Link>
      </div>

      <div className="mb-6 space-y-4">
        {/* Search Field */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-[#D1D8BE] rounded-md px-4 py-2 pl-10 text-[#819A91] focus:outline-none focus:ring-2 focus:ring-[#819A91] bg-white"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#819A91]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Clear Filters Button - Mobile/Tablet */}
        <div className="lg:hidden">
          <button
            onClick={clearAllFilters}
            disabled={!selectedCuisine && !searchQuery && maxTotalTime === 360 && selectedTags.length === 0}
            className={`w-full py-2 px-4 rounded border transition-colors ${
              !selectedCuisine && !searchQuery && maxTotalTime === 360 && selectedTags.length === 0
                ? 'border-[#D1D8BE] text-[#D1D8BE] cursor-not-allowed'
                : 'border-[#819A91] text-[#819A91] hover:bg-[#F5F6F0] cursor-pointer'
            }`}
          >
            Clear All Filters
          </button>
        </div>

        {/* Filters Container */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left Side Filters */}
          <div className="flex flex-col sm:flex-row gap-4 min-w-0 flex-1">
            {/* Cuisine Filter */}
            <div className="flex items-center gap-2 min-w-[200px]">
              <label htmlFor="cuisine-filter" className="text-[#819A91] font-medium whitespace-nowrap">
                Cuisine:
              </label>
              <select
                id="cuisine-filter"
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value)}
                className="flex-1 min-w-0 border border-[#D1D8BE] rounded-md px-3 py-2 text-[#819A91] focus:outline-none focus:ring-2 focus:ring-[#819A91] bg-white"
              >
                <option value="">All Cuisines</option>
                {cuisineTypes.map((cuisine) => (
                  <option key={cuisine} value={cuisine}>
                    {cuisine}
                  </option>
                ))}
              </select>
            </div>

            {/* Vertical Separator */}
            <div className="hidden sm:block self-center h-6 w-px bg-[#D1D8BE] mx-2" />

            {/* Time Filter */}
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <div className="min-w-[140px] flex justify-end">
                <label htmlFor="time-filter" className="text-[#819A91] font-medium whitespace-nowrap">
                  Max Time: <span className="inline-block min-w-[60px]">{formatTime(maxTotalTime)}</span>
                </label>
              </div>
              <div className="flex-1 flex items-center gap-2 min-w-[200px] max-w-[275px]">
                <span className="text-[#819A91] text-sm whitespace-nowrap w-[30px]">30m</span>
                <input
                  type="range"
                  id="time-filter"
                  min="30"
                  max="360"
                  step="15"
                  value={maxTotalTime}
                  onChange={(e) => setMaxTotalTime(Number(e.target.value))}
                  className="flex-1 h-2 bg-[#D1D8BE] rounded-lg appearance-none cursor-pointer accent-[#819A91]"
                />
                <span className="text-[#819A91] text-sm whitespace-nowrap w-[30px]">6h</span>
              </div>
            </div>
          </div>

          {/* Clear Filters Button - Desktop */}
          <div className="hidden lg:flex justify-end lg:min-w-[100px]">
            <button
              onClick={clearAllFilters}
              disabled={!selectedCuisine && !searchQuery && maxTotalTime === 360 && selectedTags.length === 0}
              className={`whitespace-nowrap px-4 py-2 transition-colors ${
                !selectedCuisine && !searchQuery && maxTotalTime === 360 && selectedTags.length === 0
                  ? 'text-[#D1D8BE] cursor-not-allowed'
                  : 'text-[#819A91] hover:text-[#A7C1A8] cursor-pointer'
              }`}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Tags Section */}
        <div className="border border-[#D1D8BE] rounded-md overflow-hidden">
          <button
            onClick={() => setIsTagsExpanded(!isTagsExpanded)}
            className="w-full px-4 py-2 flex items-center justify-between bg-[#F5F6F0] text-[#819A91] hover:bg-[#EEEFE0] transition-colors"
          >
            <span className="font-medium">
              Filter by Tags {selectedTags.length > 0 && `(${selectedTags.length} selected)`}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transition-transform ${isTagsExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isTagsExpanded && (
            <div className="p-4 bg-white">
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-[#819A91] text-white'
                        : 'bg-[#EEEFE0] text-[#819A91] hover:bg-[#D1D8BE]'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe, index) => {
          return (
            <Link 
              key={recipe._id} 
              href={`/recipes/${recipe._id}`}
              className="border border-[#D1D8BE] rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white"
            >
              <div className="relative aspect-video bg-[#EEEFE0]">
                {recipe.imageUrl && recipe.imageUrl.startsWith('http') ? (
                  <Image
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[#819A91]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2 text-[#819A91]">{recipe.title}</h2>
                <div className="text-[#819A91]">
                  <p>{recipe.cuisineType}</p>
                  <p>Total Time: {formatTime(recipe.prepTime + recipe.cookTime)}</p>
                </div>
                {recipe.tags && recipe.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {recipe.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-[#EEEFE0] text-[#819A91] px-2 py-0.5 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#819A91] text-lg">
            {searchQuery || selectedCuisine || maxTotalTime !== 360
              ? `No recipes found matching your filters`
              : 'No recipes yet. Add your first recipe!'}
          </p>
        </div>
      )}
    </div>
  )
} 