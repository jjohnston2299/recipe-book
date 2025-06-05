interface CloudflareResponse {
  result: {
    id: string;
    filename: string;
    uploaded: string;
    requireSignedURLs: boolean;
    variants: string[];
  };
  success: boolean;
  errors: any[];
  messages: any[];
}

export async function uploadImage(file: File): Promise<string> {
  if (!process.env.CLOUDFLARE_ACCOUNT_ID || !process.env.CLOUDFLARE_API_TOKEN) {
    throw new Error('Missing Cloudflare credentials');
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        },
        body: formData,
      }
    );

    const data: CloudflareResponse = await response.json();

    if (!data.success) {
      throw new Error('Failed to upload image to Cloudflare');
    }

    return data.result.id;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export function getImageUrl(imageId: string): string {
  if (!process.env.CLOUDFLARE_ACCOUNT_ID) {
    throw new Error('Missing Cloudflare Account ID');
  }
  
  return `https://imagedelivery.net/${process.env.CLOUDFLARE_ACCOUNT_ID}/${imageId}/public`;
} 