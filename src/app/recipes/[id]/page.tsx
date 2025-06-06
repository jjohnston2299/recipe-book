import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import EditButton from './EditButton';
import DeleteButton from './DeleteButton';
import { Metadata } from 'next';
import { Caveat } from 'next/font/google';

const caveat = Caveat({
  subsets: ['latin'],
  display: 'swap',
});

interface Recipe {
  _id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  imageUrl: string;
  prepTime: number;
  cookTime: number;
  cuisineType: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

async function getRecipe(id: string): Promise<Recipe | null> {
  try {
    const db = await getDb();
    const recipe = await db.collection('recipes').findOne({
      _id: new ObjectId(id)
    });

    if (!recipe) {
      return null;
    }

    return {
      ...recipe,
      _id: recipe._id.toString(),
      createdAt: recipe.createdAt instanceof Date ? recipe.createdAt.toISOString() : new Date(recipe.createdAt).toISOString(),
      updatedAt: recipe.updatedAt instanceof Date ? recipe.updatedAt.toISOString() : new Date(recipe.updatedAt).toISOString()
    } as Recipe;
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const recipe = await getRecipe(params.id);
  
  if (!recipe) {
    return {
      title: 'Recipe Not Found',
    };
  }

  return {
    title: recipe.title,
    description: recipe.description || `${recipe.title} - A ${recipe.cuisineType} recipe that takes ${recipe.prepTime + recipe.cookTime} minutes to prepare.`,
  };
}

export default async function RecipePage({ params }: { params: { id: string } }) {
  const recipe = await getRecipe(params.id);

  if (!recipe) {
    notFound();
  }

  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-[#819A91] hover:text-[#A7C1A8]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Recipes
        </Link>
        <div className="flex gap-4">
          <EditButton recipe={recipe} />
          <DeleteButton recipeId={recipe._id} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-[#D1D8BE]">
        <div className="relative aspect-video">
          {recipe.imageUrl ? (
            <Image
              src={recipe.imageUrl}
              alt={recipe.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 bg-[#EEEFE0] flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-20 w-20 text-[#819A91]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4 text-[#819A91]">{recipe.title}</h1>

          {recipe.description && (
            <p className="text-[#819A91] mb-6 italic text-lg">
              {recipe.description}
            </p>
          )}

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center text-[#819A91]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Prep: {recipe.prepTime}min</span>
            </div>
            <div className="flex items-center text-[#819A91]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Cook: {recipe.cookTime}min</span>
            </div>
            <div className="flex items-center text-[#819A91]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Total: {totalTime}min</span>
            </div>
            <div className="flex items-center text-[#819A91]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              <span>{recipe.cuisineType}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-[#819A91]">Ingredients</h2>
              <ul className={`list-disc list-inside space-y-2 ${caveat.className}`}>
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="text-[#819A91] text-xl">{ingredient}</li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-[#819A91]">Instructions</h2>
              <ol className={`list-decimal list-inside space-y-2 ${caveat.className}`}>
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="text-[#819A91] text-xl">{instruction}</li>
                ))}
              </ol>
            </div>
          </div>

          {recipe.tags && recipe.tags.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2 text-[#819A91]">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-[#EEEFE0] text-[#819A91] px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 