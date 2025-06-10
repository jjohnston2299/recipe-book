import { renderHook, act } from '@testing-library/react';
import { useRecipeAI } from './useRecipeAI';
import { RECIPE_FORM } from '@/constants';

// Mock fetch for API calls
global.fetch = jest.fn();

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
    (global.fetch as jest.Mock).mockReset();
  });

  it('initializes with default states', () => {
    const { result } = renderHook(() => useRecipeAI(mockFormData, mockSetFormData));

    expect(result.current.isGeneratingDesc).toBe(false);
    expect(result.current.isGeneratingTags).toBe(false);
    expect(result.current.isGeneratingComplete).toBe(false);
  });

  describe('generateDescription', () => {
    it('handles successful description generation', async () => {
      const generatedDescription = 'AI generated description';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ description: generatedDescription })
      });

      const { result } = renderHook(() => useRecipeAI(mockFormData, mockSetFormData));

      await act(async () => {
        await result.current.generateDescription();
      });

      expect(mockSetFormData).toHaveBeenCalledWith(expect.any(Function));
      expect(global.fetch).toHaveBeenCalledWith('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-description',
          title: mockFormData.title,
          ingredients: mockFormData.ingredients,
          instructions: mockFormData.instructions
        })
      });
    });

    it('handles missing fields error', async () => {
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
      const emptyFormData = { ...mockFormData, title: '' };

      const { result } = renderHook(() => useRecipeAI(emptyFormData, mockSetFormData));

      await act(async () => {
        await result.current.generateDescription();
      });

      expect(alertMock).toHaveBeenCalledWith(RECIPE_FORM.ERRORS.MISSING_FIELDS);
      expect(global.fetch).not.toHaveBeenCalled();

      alertMock.mockRestore();
    });

    it('handles API error', async () => {
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(() => useRecipeAI(mockFormData, mockSetFormData));

      await act(async () => {
        await result.current.generateDescription();
      });

      expect(alertMock).toHaveBeenCalledWith(RECIPE_FORM.ERRORS.GENERATE_DESCRIPTION_FAILED);
      expect(consoleSpy).toHaveBeenCalled();

      alertMock.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe('generateTags', () => {
    it('handles successful tag generation', async () => {
      const generatedTags = ['healthy', 'quick'];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tags: generatedTags })
      });

      const { result } = renderHook(() => useRecipeAI(mockFormData, mockSetFormData));

      await act(async () => {
        await result.current.generateTags();
      });

      expect(mockSetFormData).toHaveBeenCalledWith(expect.any(Function));
      expect(global.fetch).toHaveBeenCalledWith('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'suggest-tags',
          title: mockFormData.title,
          ingredients: mockFormData.ingredients,
          instructions: mockFormData.instructions
        })
      });
    });

    it('handles missing fields error', async () => {
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
      const emptyFormData = { ...mockFormData, title: '' };

      const { result } = renderHook(() => useRecipeAI(emptyFormData, mockSetFormData));

      await act(async () => {
        await result.current.generateTags();
      });

      expect(alertMock).toHaveBeenCalledWith(RECIPE_FORM.ERRORS.MISSING_FIELDS);
      expect(global.fetch).not.toHaveBeenCalled();

      alertMock.mockRestore();
    });

    it('handles API error', async () => {
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(() => useRecipeAI(mockFormData, mockSetFormData));

      await act(async () => {
        await result.current.generateTags();
      });

      expect(alertMock).toHaveBeenCalledWith(RECIPE_FORM.ERRORS.GENERATE_TAGS_FAILED);
      expect(consoleSpy).toHaveBeenCalled();

      alertMock.mockRestore();
      consoleSpy.mockRestore();
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
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ recipe: generatedRecipe })
      });

      const { result } = renderHook(() => useRecipeAI(mockFormData, mockSetFormData));

      await act(async () => {
        await result.current.generateCompleteRecipe();
      });

      expect(mockSetFormData).toHaveBeenCalledWith(expect.any(Function));
      expect(global.fetch).toHaveBeenCalledWith('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-complete',
          title: mockFormData.title
        })
      });
    });

    it('handles missing title error', async () => {
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
      const emptyFormData = { ...mockFormData, title: '' };

      const { result } = renderHook(() => useRecipeAI(emptyFormData, mockSetFormData));

      await act(async () => {
        await result.current.generateCompleteRecipe();
      });

      expect(alertMock).toHaveBeenCalledWith(RECIPE_FORM.ERRORS.MISSING_TITLE);
      expect(global.fetch).not.toHaveBeenCalled();

      alertMock.mockRestore();
    });

    it('handles API error', async () => {
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(() => useRecipeAI(mockFormData, mockSetFormData));

      await act(async () => {
        await result.current.generateCompleteRecipe();
      });

      expect(alertMock).toHaveBeenCalledWith(RECIPE_FORM.ERRORS.GENERATE_RECIPE_FAILED);
      expect(consoleSpy).toHaveBeenCalled();

      alertMock.mockRestore();
      consoleSpy.mockRestore();
    });
  });
}); 