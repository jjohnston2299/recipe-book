import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDb();
    const recipes = await db.collection('recipes')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    const formattedRecipes = recipes.map(recipe => ({
      _id: recipe._id.toString(),
      title: recipe.title,
      imageUrl: recipe.imageUrl,
      cuisineType: recipe.cuisineType,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      tags: recipe.tags || [],
    }));

    return NextResponse.json(formattedRecipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const recipe = await request.json();
    const db = await getDb();

    const result = await db.collection('recipes').insertOne({
      ...recipe,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Error creating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to create recipe', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 