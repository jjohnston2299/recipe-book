import { POST } from '../route';
import { generateRecipeDescription, suggestRecipeTags, generateCompleteRecipe } from '@/lib/openai';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: Record<string, unknown>, init?: ResponseInit) => {
      const response = new Response(JSON.stringify(data), init);
      Object.defineProperty(response, 'status', {
        get() {
          return init?.status || 200;
        }
      });
      return response;
    }
  }
}));

// Mock the OpenAI functions
jest.mock('@/lib/openai', () => ({
  generateRecipeDescription: jest.fn(),
  suggestRecipeTags: jest.fn(),
  generateCompleteRecipe: jest.fn(),
}));

describe('AI API Route', () => {
  const mockRequest = (body: any) =>
    new Request('http://localhost:3000/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generate-description action', () => {
    const mockPayload = {
      action: 'generate-description',
      title: 'Test Recipe',
      ingredients: ['ingredient1', 'ingredient2'],
      instructions: ['step1', 'step2'],
    };

    it('successfully generates a description', async () => {
      const mockDescription = 'A delicious test recipe';
      (generateRecipeDescription as jest.Mock).mockResolvedValueOnce(mockDescription);

      const response = await POST(mockRequest(mockPayload));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ description: mockDescription });
      expect(generateRecipeDescription).toHaveBeenCalledWith(
        mockPayload.title,
        mockPayload.ingredients,
        mockPayload.instructions
      );
    });

    it('handles OpenAI API errors', async () => {
      const error = new Error('OpenAI API error');
      (generateRecipeDescription as jest.Mock).mockRejectedValueOnce(error);

      const response = await POST(mockRequest(mockPayload));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to process AI request',
        details: 'OpenAI API error',
      });
    });
  });

  describe('suggest-tags action', () => {
    const mockPayload = {
      action: 'suggest-tags',
      title: 'Test Recipe',
      ingredients: ['ingredient1', 'ingredient2'],
      instructions: ['step1', 'step2'],
    };

    it('successfully generates tags', async () => {
      const mockTags = ['quick', 'easy', 'vegetarian'];
      (suggestRecipeTags as jest.Mock).mockResolvedValueOnce(mockTags);

      const response = await POST(mockRequest(mockPayload));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ tags: mockTags });
      expect(suggestRecipeTags).toHaveBeenCalledWith(
        mockPayload.title,
        mockPayload.ingredients,
        mockPayload.instructions
      );
    });

    it('handles OpenAI API errors', async () => {
      const error = new Error('OpenAI API error');
      (suggestRecipeTags as jest.Mock).mockRejectedValueOnce(error);

      const response = await POST(mockRequest(mockPayload));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to process AI request',
        details: 'OpenAI API error',
      });
    });
  });

  describe('generate-complete action', () => {
    const mockPayload = {
      action: 'generate-complete',
      title: 'Test Recipe',
    };

    const mockRecipe = {
      description: 'A complete test recipe',
      ingredients: ['ingredient1', 'ingredient2'],
      instructions: ['step1', 'step2'],
      prepTime: 30,
      cookTime: 45,
      cuisineType: 'Italian',
      tags: ['quick', 'easy', 'vegetarian'],
    };

    it('successfully generates a complete recipe', async () => {
      (generateCompleteRecipe as jest.Mock).mockResolvedValueOnce(mockRecipe);

      const response = await POST(mockRequest(mockPayload));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ recipe: mockRecipe });
      expect(generateCompleteRecipe).toHaveBeenCalledWith(mockPayload.title);
    });

    it('handles OpenAI API errors', async () => {
      const error = new Error('OpenAI API error');
      (generateCompleteRecipe as jest.Mock).mockRejectedValueOnce(error);

      const response = await POST(mockRequest(mockPayload));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to process AI request',
        details: 'OpenAI API error',
      });
    });
  });

  describe('error handling', () => {
    it('handles invalid action', async () => {
      const response = await POST(
        mockRequest({
          action: 'invalid-action',
          title: 'Test Recipe',
        })
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid action' });
    });

    it('handles invalid JSON', async () => {
      const invalidRequest = new Request('http://localhost:3000/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json',
      });

      const response = await POST(invalidRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to process AI request');
    });

    it('handles missing required fields', async () => {
      const response = await POST(
        mockRequest({
          action: 'generate-description',
          // Missing title, ingredients, instructions
        })
      );
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to process AI request');
    });
  });
}); 