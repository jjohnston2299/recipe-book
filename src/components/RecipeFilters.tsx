'use client';

import React, { useState } from 'react';
import { RecipeFiltersProps } from '@/types/recipe';
import { RECIPE_FILTERS } from '@/constants';

export function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}${RECIPE_FILTERS.TIME_UNITS.MINUTES}`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}${RECIPE_FILTERS.TIME_UNITS.HOURS} ${mins}${RECIPE_FILTERS.TIME_UNITS.MINUTES}` : `${hours}${RECIPE_FILTERS.TIME_UNITS.HOURS}`;
}

export default function RecipeFilters({
  searchQuery,
  setSearchQuery,
  selectedCuisine,
  setSelectedCuisine,
  maxTotalTime,
  setMaxTotalTime,
  selectedTags,
  setSelectedTags,
  cuisineTypes,
  availableTags,
  clearAllFilters
}: RecipeFiltersProps) {
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev: string[]) => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Search Field */}
      <div className="relative">
        <input
          type="text"
          placeholder={RECIPE_FILTERS.SEARCH_PLACEHOLDER}
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
          {RECIPE_FILTERS.BUTTONS.CLEAR_ALL_FILTERS}
        </button>
      </div>

      {/* Filters Container */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Side Filters */}
        <div className="flex flex-col sm:flex-row gap-4 min-w-0 flex-1">
          {/* Cuisine Filter */}
          <div className="flex items-center gap-2 min-w-[200px]">
            <label htmlFor="cuisine-filter" className="text-[#819A91] font-medium whitespace-nowrap">
              {RECIPE_FILTERS.LABELS.CUISINE}
            </label>
            <select
              id="cuisine-filter"
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
              className="flex-1 min-w-0 border border-[#D1D8BE] rounded-md px-3 py-2 text-[#819A91] focus:outline-none focus:ring-2 focus:ring-[#819A91] bg-white"
            >
              <option value="">{RECIPE_FILTERS.LABELS.ALL_CUISINES}</option>
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
                {RECIPE_FILTERS.LABELS.MAX_TIME} <span className="inline-block min-w-[60px]">{formatTime(maxTotalTime)}</span>
              </label>
            </div>
            <div className="flex-1 flex items-center gap-2 min-w-[200px] max-w-[275px]">
              <span className="text-[#819A91] text-sm whitespace-nowrap w-[30px]">30{RECIPE_FILTERS.TIME_UNITS.MINUTES}</span>
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
              <span className="text-[#819A91] text-sm whitespace-nowrap w-[30px]">6{RECIPE_FILTERS.TIME_UNITS.HOURS}</span>
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
            {RECIPE_FILTERS.BUTTONS.CLEAR_FILTERS}
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
            {RECIPE_FILTERS.BUTTONS.FILTER_BY_TAGS} {selectedTags.length > 0 && `(${selectedTags.length} selected)`}
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
  );
} 