import { notFound } from 'next/navigation';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import RecipeForm from '@/components/RecipeForm/RecipeForm';
import { Recipe } from '@/types/recipe';

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
      _id: recipe._id.toString(),
      title: recipe.title,
      description: recipe.description || '',
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      imageUrl: recipe.imageUrl || '',
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      cuisineType: recipe.cuisineType,
      tags: recipe.tags || [],
      createdAt: recipe.createdAt instanceof Date ? recipe.createdAt.toISOString() : new Date(recipe.createdAt).toISOString(),
      updatedAt: recipe.updatedAt instanceof Date ? recipe.updatedAt.toISOString() : new Date(recipe.updatedAt).toISOString()
    } as Recipe;
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return null;
  }
}

export default async function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recipe = await getRecipe(id);

  if (!recipe) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto sm:px-4 sm:py-4">
      <RecipeForm recipe={recipe} />
    </div>
  );
} 