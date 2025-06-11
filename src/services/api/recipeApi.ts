import { Recipe } from '@/types/recipe';
import { handleAPIResponse, NetworkError } from './errors';

type FormData = Omit<Recipe, '_id'>;

interface ImageUploadResponse {
  success: boolean;
  url: string;
  error?: string;
}

interface CreateRecipeResponse {
  id: string;
  recipe: Recipe;
}

interface UpdateRecipeResponse {
  recipe: Recipe;
}

interface AIDescriptionResponse {
  description: string;
}

interface AITagsResponse {
  tags: string[];
}

interface AICompleteResponse {
  recipe: Partial<FormData>;
}

async function makeRequest<T>(url: string, options: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    return handleAPIResponse<T>(response);
  } catch (error) {
    if (error instanceof Error && 'name' in error && error.name === 'TypeError') {
      throw new NetworkError();
    }
    throw error;
  }
}

export const recipeApi = {
  create: async (data: FormData): Promise<CreateRecipeResponse> => {
    return makeRequest('/api/recipes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<FormData>): Promise<UpdateRecipeResponse> => {
    return makeRequest(`/api/recipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  uploadImage: async (file: File): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/images', {
        method: 'POST',
        body: formData,
      });

      const result = await handleAPIResponse<ImageUploadResponse>(response);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to upload image');
      }
      
      return result;
    } catch (error) {
      if (error instanceof Error && 'name' in error && error.name === 'TypeError') {
        throw new NetworkError();
      }
      throw error;
    }
  },

  ai: {
    generateDescription: async (data: { 
      title: string; 
      ingredients: string[]; 
      instructions: string[]; 
    }): Promise<AIDescriptionResponse> => {
      return makeRequest('/api/ai', {
        method: 'POST',
        body: JSON.stringify({
          action: 'generate-description',
          ...data
        }),
      });
    },

    generateTags: async (data: { 
      title: string; 
      ingredients: string[]; 
      instructions: string[]; 
    }): Promise<AITagsResponse> => {
      return makeRequest('/api/ai', {
        method: 'POST',
        body: JSON.stringify({
          action: 'suggest-tags',
          ...data
        }),
      });
    },

    generateComplete: async (title: string): Promise<AICompleteResponse> => {
      return makeRequest('/api/ai', {
        method: 'POST',
        body: JSON.stringify({
          action: 'generate-complete',
          title
        }),
      });
    },
  },
}; 