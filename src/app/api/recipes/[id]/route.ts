import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Helper function to delete image from Cloudflare
async function deleteCloudflareImage(imageUrl: string) {
  try {
    // Extract image ID from URL
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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const db = await getDb();
    const recipe = await db.collection('recipes').findOne({
      _id: new ObjectId(params.id)
    });

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    // Ensure dates are properly formatted
    const formattedRecipe = {
      ...recipe,
      _id: recipe._id.toString(),
      createdAt: recipe.createdAt instanceof Date ? recipe.createdAt : new Date(recipe.createdAt),
      updatedAt: recipe.updatedAt instanceof Date ? recipe.updatedAt : new Date(recipe.updatedAt)
    };

    return NextResponse.json(formattedRecipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipe', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const updates = await request.json();
    const db = await getDb();

    // Get the current recipe to check if image needs to be deleted
    const currentRecipe = await db.collection('recipes').findOne({
      _id: new ObjectId(params.id)
    });

    if (!currentRecipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    // If image has changed and old image exists, delete it from Cloudflare
    if (currentRecipe.imageUrl && currentRecipe.imageUrl !== updates.imageUrl) {
      await deleteCloudflareImage(currentRecipe.imageUrl);
    }

    // Remove _id and clean the updates
    const { _id, ...updateData } = updates;
    console.log(_id);
    const cleanedUpdates = {
      ...updateData,
      ingredients: updates.ingredients.filter((i: string) => i.trim()),
      instructions: updates.instructions.filter((i: string) => i.trim()),
      updatedAt: new Date(),
      // Ensure createdAt is preserved as a Date object
      createdAt: currentRecipe.createdAt instanceof Date ? currentRecipe.createdAt : new Date(currentRecipe.createdAt)
    };

    const result = await db.collection('recipes').findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { $set: cleanedUpdates },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to update recipe', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const db = await getDb();

    // Get the recipe first to get the image URL
    const recipe = await db.collection('recipes').findOne({
      _id: new ObjectId(params.id)
    });

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    // Delete the image from Cloudflare if it exists
    if (recipe.imageUrl) {
      await deleteCloudflareImage(recipe.imageUrl);
    }

    // Delete the recipe from MongoDB
    const result = await db.collection('recipes').deleteOne({
      _id: new ObjectId(params.id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json(
      { error: 'Failed to delete recipe', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 