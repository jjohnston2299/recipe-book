import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!process.env.CLOUDFLARE_ACCOUNT_ID || !process.env.CLOUDFLARE_API_TOKEN || !process.env.CLOUDFLARE_ACCOUNT_HASH) {
      return NextResponse.json(
        { error: 'Cloudflare credentials not configured' },
        { status: 500 }
      );
    }

    // Convert File to ArrayBuffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create form data for Cloudflare
    const cfFormData = new FormData();
    const blob = new Blob([buffer], { type: file.type });
    cfFormData.append('file', blob, file.name);

    // Upload to Cloudflare Images
    const uploadResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        },
        body: cfFormData,
      }
    );

    const result = await uploadResponse.json();

    if (!result.success) {
      console.error('Cloudflare upload failed:', result.errors);
      return NextResponse.json(
        { error: 'Failed to upload image', details: result.errors },
        { status: 500 }
      );
    }

    // Get the image ID from the response
    const imageId = result.result.id;
    
    // Construct the proper Cloudflare Images URL with a variant
    // The format should be: https://imagedelivery.net/accountHash/imageId/variant
    const imageUrl = `https://imagedelivery.net/${process.env.CLOUDFLARE_ACCOUNT_HASH}/${imageId}/recipe`;

    return NextResponse.json({
      success: true,
      id: imageId,
      filename: result.result.filename,
      url: imageUrl
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper endpoint to test Cloudflare credentials
export async function GET() {
  try {
    if (!process.env.CLOUDFLARE_ACCOUNT_ID || !process.env.CLOUDFLARE_API_TOKEN) {
      return NextResponse.json(
        { error: 'Cloudflare credentials not configured' },
        { status: 500 }
      );
    }

    // Test connection by listing images
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        },
      }
    );

    const result = await response.json();

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to connect to Cloudflare', details: result.errors },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully connected to Cloudflare Images',
      imagesCount: result.result.count
    });
  } catch (error) {
    console.error('Error testing Cloudflare connection:', error);
    return NextResponse.json(
      { error: 'Failed to test Cloudflare connection', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 