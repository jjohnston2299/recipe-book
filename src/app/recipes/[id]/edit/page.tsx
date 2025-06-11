import { notFound } from 'next/navigation';
import { getRecipe } from '@/services/recipes/recipeService';
import RecipeForm from '@/components/RecipeForm/RecipeForm';

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