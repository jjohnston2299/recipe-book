import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

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

export async function POST() {
  try {
    const db = await getDb();
    
    // Get all recipes first to get their image URLs
    const recipes = await db.collection('recipes').find({}).toArray();
    
    // Delete all images from Cloudflare
    const imagePromises = recipes
      .filter(recipe => recipe.imageUrl)
      .map(recipe => deleteCloudflareImage(recipe.imageUrl));
    
    await Promise.all(imagePromises);
    
    // Delete all recipes from MongoDB
    const result = await db.collection('recipes').deleteMany({});
    
    return NextResponse.json({
      success: true,
      deletedRecipes: result.deletedCount,
      deletedImages: imagePromises.length
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 