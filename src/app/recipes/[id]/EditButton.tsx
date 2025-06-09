'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RecipeForm from '@/components/RecipeForm/RecipeForm';
import { Recipe } from '@/types/recipe';
import { EDIT_RECIPE } from '@/constants';

interface EditButtonProps {
  recipe: Recipe;
}

export default function EditButton({ recipe }: EditButtonProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    setOpen(false);
    router.refresh();
  };

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="bg-[#819A91] text-white px-4 py-2 rounded-md hover:bg-[#A7C1A8] flex items-center transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
        {EDIT_RECIPE.TITLE}
      </button>

      {open && (
        <div className="fixed inset-0 bg-[#819A91]/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#819A91]">{EDIT_RECIPE.TITLE}</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-[#819A91] hover:text-[#A7C1A8]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <RecipeForm recipe={recipe} onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
} 