import { getDb } from '@/lib/mongodb';
import { ObjectId, WithId, Document } from 'mongodb';
import { Recipe } from '@/types/recipe';

interface RecipeDocument extends WithId<Document> {
  title: string;
  ingredients: string[];
  instructions: string[];
  imageUrl?: string;
  prepTime: number;
  cookTime: number;
  cuisineType: string;
  tags?: string[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to format recipe dates
function formatRecipeDates(recipe: RecipeDocument): Recipe {
  return {
    ...recipe,
    _id: recipe._id.toString(),
    description: recipe.description || '',
    imageUrl: recipe.imageUrl || '',
    tags: recipe.tags || [],
    createdAt: recipe.createdAt.toISOString(),
    updatedAt: recipe.updatedAt.toISOString()
  } as Recipe;
}

// Helper function to delete image from Cloudflare
async function deleteCloudflareImage(imageUrl: string) {
  try {
    const matches = imageUrl.match(/imagedelivery\.net\/[^/]+\/([^/]+)\//);
    if (!matches || !matches[1]) return;

    const imageId = matches[1];
    
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1/${imageId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        },
      }
    );

    const result = await response.json();
    if (!result.success) {
      console.error('Failed to delete image from Cloudflare:', result.errors);
    }
  } catch (error) {
    console.error('Error deleting image from Cloudflare:', error);
  }
}

// Get a single recipe by ID
export async function getRecipe(id: string): Promise<Recipe | null> {
  try {
    const db = await getDb();
    const recipe = await db.collection('recipes').findOne({
      _id: new ObjectId(id)
    });

    if (!recipe) {
      return null;
    }

    return formatRecipeDates(recipe as RecipeDocument);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return null;
  }
}

// Get all recipes with optional filtering
export async function getRecipes(filters?: {
  searchQuery?: string;
  cuisineType?: string;
  maxTotalTime?: number;
  tags?: string[];
}) {
  try {
    const db = await getDb();
    const query: {
      title?: { $regex: string; $options: string };
      cuisineType?: string;
      $expr?: { $lte: [{ $add: [string, string] }, number] };
      tags?: { $all: string[] };
    } = {};

    if (filters) {
      if (filters.searchQuery) {
        query.title = { $regex: filters.searchQuery, $options: 'i' };
      }
      if (filters.cuisineType) {
        query.cuisineType = filters.cuisineType;
      }
      if (filters.maxTotalTime) {
        query.$expr = {
          $lte: [{ $add: ['$prepTime', '$cookTime'] }, filters.maxTotalTime]
        };
      }
      if (filters.tags && filters.tags.length > 0) {
        query.tags = { $all: filters.tags };
      }
    }

    const recipes = await db.collection('recipes')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return recipes.map(recipe => formatRecipeDates(recipe as RecipeDocument));
  } catch (error) {
    console.error('Error fetching recipes:', error);
    throw error;
  }
}

// Create a new recipe
export async function createRecipe(recipeData: Omit<Recipe, '_id' | 'createdAt' | 'updatedAt'>) {
  try {
    const db = await getDb();
    const cleanedData = {
      ...recipeData,
      ingredients: recipeData.ingredients.filter(i => i.trim()),
      instructions: recipeData.instructions.filter(i => i.trim()),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('recipes').insertOne(cleanedData);
    return { id: result.insertedId.toString() };
  } catch (error) {
    console.error('Error creating recipe:', error);
    throw error;
  }
}

// Update an existing recipe
export async function updateRecipe(id: string, updates: Partial<Recipe>) {
  try {
    const db = await getDb();
    const currentRecipe = await db.collection('recipes').findOne({
      _id: new ObjectId(id)
    });

    if (!currentRecipe) {
      throw new Error('Recipe not found');
    }

    // Handle image update
    if (currentRecipe.imageUrl && currentRecipe.imageUrl !== updates.imageUrl) {
      await deleteCloudflareImage(currentRecipe.imageUrl);
    }

    // Clean the updates
    const updateData = { ...updates };
    delete updateData._id;
    
    const cleanedUpdates = {
      ...updateData,
      ingredients: updates.ingredients?.filter(i => i.trim()),
      instructions: updates.instructions?.filter(i => i.trim()),
      updatedAt: new Date(),
      createdAt: currentRecipe.createdAt instanceof Date ? currentRecipe.createdAt : new Date(currentRecipe.createdAt)
    };

    const result = await db.collection('recipes').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: cleanedUpdates },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new Error('Recipe not found');
    }

    return formatRecipeDates(result as RecipeDocument);
  } catch (error) {
    console.error('Error updating recipe:', error);
    throw error;
  }
}

// Delete a recipe
export async function deleteRecipe(id: string) {
  try {
    const db = await getDb();
    const recipe = await db.collection('recipes').findOne({
      _id: new ObjectId(id)
    });

    if (!recipe) {
      throw new Error('Recipe not found');
    }

    // Delete associated image if it exists
    if (recipe.imageUrl) {
      await deleteCloudflareImage(recipe.imageUrl);
    }

    const result = await db.collection('recipes').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      throw new Error('Recipe not found');
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting recipe:', error);
    throw error;
  }
}

// Get unique cuisine types
export async function getCuisineTypes(): Promise<string[]> {
  try {
    const db = await getDb();
    const cuisineTypes = await db.collection('recipes').distinct('cuisineType');
    return cuisineTypes.sort();
  } catch (error) {
    console.error('Error fetching cuisine types:', error);
    throw error;
  }
}

// Get all available tags
export async function getAvailableTags(): Promise<string[]> {
  try {
    const db = await getDb();
    const tags = await db.collection('recipes').distinct('tags');
    return tags.sort();
  } catch (error) {
    console.error('Error fetching available tags:', error);
    throw error;
  }
} 