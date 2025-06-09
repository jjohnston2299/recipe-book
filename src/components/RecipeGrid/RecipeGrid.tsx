'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatTime } from '@/components/RecipeFilters/RecipeFilters';
import { Recipe, RecipeGridProps } from '@/types/recipe';
import { RECIPE_GRID } from '@/constants';

export default function RecipeGrid({ recipes }: RecipeGridProps) {
  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#819A91] text-lg">
          {RECIPE_GRID.NO_RECIPES}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe) => (
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
              <p>{RECIPE_GRID.TOTAL_TIME} {formatTime(recipe.prepTime + recipe.cookTime)}</p>
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
      ))}
    </div>
  );
} 