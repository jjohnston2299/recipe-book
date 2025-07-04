import { NextResponse } from 'next/server';
import { generateRecipeDescription, suggestRecipeTags, generateCompleteRecipe } from '@/lib/openai';

export async function POST(request: Request) {
  try {
    const { action, title, ingredients, instructions } = await request.json();

    switch (action) {
      case 'generate-description':
        if (!title || !ingredients?.length || !instructions?.length) {
          return NextResponse.json(
            { error: 'Failed to process AI request', details: 'Missing required fields' },
            { status: 500 }
          );
        }
        const description = await generateRecipeDescription(title, ingredients, instructions);
        return NextResponse.json({ description });

      case 'suggest-tags':
        if (!title || !ingredients?.length || !instructions?.length) {
          return NextResponse.json(
            { error: 'Failed to process AI request', details: 'Missing required fields' },
            { status: 500 }
          );
        }
        const tags = await suggestRecipeTags(title, ingredients, instructions);
        return NextResponse.json({ tags });

      case 'generate-complete':
        if (!title) {
          return NextResponse.json(
            { error: 'Failed to process AI request', details: 'Missing required fields' },
            { status: 500 }
          );
        }
        const recipe = await generateCompleteRecipe(title);
        return NextResponse.json({ recipe });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in AI route:', error);
    return NextResponse.json(
      { error: 'Failed to process AI request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 