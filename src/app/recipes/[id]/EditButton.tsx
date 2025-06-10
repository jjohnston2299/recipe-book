'use client';

import { useRouter } from 'next/navigation';
import { Recipe } from '@/types/recipe';
import { EDIT_RECIPE } from '@/constants';

export default function EditButton({ recipe }: { recipe: Recipe }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/recipes/${recipe._id}/edit`)}
      className="bg-[#819A91] text-white px-4 py-2 rounded-md hover:bg-[#A7C1A8] flex items-center transition-colors cursor-pointer"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 sm:h-5 sm:w-5 sm:mr-1"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
      </svg>
      <span className="hidden sm:inline">{EDIT_RECIPE.TITLE}</span>
    </button>
  );
} 