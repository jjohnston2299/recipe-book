import { renderHook, act } from '@testing-library/react';
import { useRecipeAI } from './useRecipeAI';
import { RECIPE_FORM } from '@/constants';
import { NetworkError, AIServiceError } from '@/services/api/errors';

// Mock recipeApi
jest.mock('@/services/api/recipeApi', () => ({
  recipeApi: {
    ai: {
      generateDescription: jest.fn(),
      generateTags: jest.fn(),
      generateComplete: jest.fn()
    }
  }
}));

describe('useRecipeAI', () => {
  const mockFormData = {
    title: 'Test Recipe',
    description: '',
    ingredients: ['Ingredient 1', 'Ingredient 2'],
    instructions: ['Step 1', 'Step 2'],
    imageUrl: '',
    prepTime: 30,
    cookTime: 45,
    cuisineType: 'Italian',
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockSetFormData = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default states', () => {
    const { result } = renderHook(() => useRecipeAI(mockFormData, mockSetFormData));

    expect(result.current.isGeneratingDesc).toBe(false);
    expect(result.current.isGeneratingTags).toBe(false);
    expect(result.current.isGeneratingComplete).toBe(false);
    expect(result.current.error).toBeNull();
  });

  describe('generateDescription', () => {
    it('handles successful description generation', async () => {
      const generatedDescription = 'AI generated description';
      const { recipeApi } = require('@/services/api/recipeApi');
      recipeApi.ai.generateDescription.mockResolvedValueOnce({ description: generatedDescription });

      const { result } = renderHook(() => useRecipeAI(mockFormData, mockSetFormData));

      await act(async () => {
        await result.current.generateDescription();
      });

      expect(mockSetFormData).toHaveBeenCalledWith(expect.any(Function));
      expect(recipeApi.ai.generateDescription).toHaveBeenCalledWith({
        title: mockFormData.title,
        ingredients: mockFormData.ingredients,
        instructions: mockFormData.instructions
      });
      expect(result.current.error).toBeNull();
    });

    it('handles missing fields error', async () => {
      const emptyFormData = { ...mockFormData, title: '' };
      const { result } = renderHook(() => useRecipeAI(emptyFormData, mockSetFormData));

      await act(async () => {
        await result.current.generateDescription();
      });

      expect(result.current.error).toBe(RECIPE_FORM.ERRORS.MISSING_FIELDS);
      expect(mockSetFormData).not.toHaveBeenCalled();
    });

    it('handles API error', async () => {
      const { recipeApi } = require('@/services/api/recipeApi');
      recipeApi.ai.generateDescription.mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(() => useRecipeAI(mockFormData, mockSetFormData));

      await act(async () => {
        await result.current.generateDescription();
      });

      expect(result.current.error).toBe(RECIPE_FORM.ERRORS.GENERATE_DESCRIPTION_FAILED);
      expect(result.current.isGeneratingDesc).toBe(false);
    });

    it('handles network error', async () => {
      const { recipeApi } = require('@/services/api/recipeApi');
      recipeApi.ai.generateDescription.mockRejectedValueOnce(new NetworkError());

      const { result } = renderHook(() => useRecipeAI(mockFormData, mockSetFormData));

      await act(async () => {
        await result.current.generateDescription();
      });

      expect(result.current.error).toBe(RECIPE_FORM.ERRORS.NETWORK_ERROR);
      expect(result.current.isGeneratingDesc).toBe(false);
    });

    it('handles AI service error', async () => {
      const { recipeApi } = require('@/services/api/recipeApi');
      recipeApi.ai.generateDescription.mockRejectedValueOnce(new AIServiceError('AI service failed'));

      const { result } = renderHook(() => useRecipeAI(mockFormData, mockSetFormData));

      await act(async () => {
        await result.current.generateDescription();
      });

      expect(result.current.error).toBe(RECIPE_FORM.ERRORS.AI_SERVICE_ERROR);
      expect(result.current.isGeneratingDesc).toBe(false);
    });
  });

  describe('generateTags', () => {
    it('handles successful tag generation', async () => {
      const generatedTags = ['healthy', 'quick'];
      const { recipeApi } = require('@/services/api/recipeApi');
      recipeApi.ai.generateTags.mockResolvedValueOnce({ tags: generatedTags });

      const { result } = renderHook(() => useRecipeAI(mockFormData, mockSetFormData));

      await act(async () => {
        await result.current.generateTags();
      });

      expect(mockSetFormData).toHaveBeenCalledWith(expect.any(Function));
      expect(recipeApi.ai.generateTags).toHaveBeenCalledWith({
        title: mockFormData.title,
        ingredients: mockFormData.ingredients,
        instructions: mockFormData.instructions
      });
      expect(result.current.error).toBeNull();
    });

    it('handles missing fields error', async () => {
      const emptyFormData = { ...mockFormData, title: '' };
      const { result } = renderHook(() => useRecipeAI(emptyFormData, mockSetFormData));

      await act(async () => {
        await result.current.generateTags();
      });

      expect(result.current.error).toBe(RECIPE_FORM.ERRORS.MISSING_FIELDS);
      expect(mockSetFormData).not.toHaveBeenCalled();
    });

    it('handles API error', async () => {
      const { recipeApi } = require('@/services/api/recipeApi');
      recipeApi.ai.generateTags.mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(() => useRecipeAI(mockFormData, mockSetFormData));

      await act(async () => {
        await result.current.generateTags();
      });

      expect(result.current.error).toBe(RECIPE_FORM.ERRORS.GENERATE_TAGS_FAILED);
      expect(result.current.isGeneratingTags).toBe(false);
    });
  });

  describe('generateCompleteRecipe', () => {
    const generatedRecipe = {
      description: 'Generated description',
      ingredients: ['Generated ingredient'],
      instructions: ['Generated instruction'],
      prepTime: 20,
      cookTime: 30,
      cuisineType: 'Generated cuisine',
      tags: ['generated']
    };

    it('handles successful complete recipe generation', async () => {
      const { recipeApi } = require('@/services/api/recipeApi');
      recipeApi.ai.generateComplete.mockResolvedValueOnce({ recipe: generatedRecipe });

      const { result } = renderHook(() => useRecipeAI(mockFormData, mockSetFormData));

      await act(async () => {
        await result.current.generateCompleteRecipe();
      });

      expect(mockSetFormData).toHaveBeenCalledWith(expect.any(Function));
      expect(recipeApi.ai.generateComplete).toHaveBeenCalledWith(mockFormData.title);
      expect(result.current.error).toBeNull();
    });

    it('handles missing title error', async () => {
      const emptyFormData = { ...mockFormData, title: '' };
      const { result } = renderHook(() => useRecipeAI(emptyFormData, mockSetFormData));

      await act(async () => {
        await result.current.generateCompleteRecipe();
      });

      expect(result.current.error).toBe(RECIPE_FORM.ERRORS.MISSING_TITLE);
      expect(mockSetFormData).not.toHaveBeenCalled();
    });

    it('handles API error', async () => {
      const { recipeApi } = require('@/services/api/recipeApi');
      recipeApi.ai.generateComplete.mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(() => useRecipeAI(mockFormData, mockSetFormData));

      await act(async () => {
        await result.current.generateCompleteRecipe();
      });

      expect(result.current.error).toBe(RECIPE_FORM.ERRORS.GENERATE_RECIPE_FAILED);
      expect(result.current.isGeneratingComplete).toBe(false);
    });
  });
}); 