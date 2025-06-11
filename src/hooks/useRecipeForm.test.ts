import { renderHook, act } from '@testing-library/react';
import { useRecipeForm } from './useRecipeForm';
import { RECIPE_FORM } from '@/constants';
import { NetworkError, ValidationError } from '@/services/api/errors';

// Mock global fetch
global.fetch = jest.fn();

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn();

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn()
  })
}));

// Mock recipeApi
jest.mock('@/services/api/recipeApi', () => ({
  recipeApi: {
    create: jest.fn(),
    update: jest.fn(),
    uploadImage: jest.fn()
  }
}));

describe('useRecipeForm', () => {
  const mockRecipe = {
    _id: '123',
    title: 'Test Recipe',
    ingredients: ['Ingredient 1', 'Ingredient 2'],
    instructions: ['Step 1', 'Step 2'],
    imageUrl: 'https://example.com/image.jpg',
    prepTime: 30,
    cookTime: 45,
    cuisineType: 'Italian',
    tags: ['quick', 'easy'],
    description: 'A test recipe description',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
    (global.URL.createObjectURL as jest.Mock).mockReset();
    (global.URL.createObjectURL as jest.Mock).mockReturnValue('mock-url');
  });

  it('initializes with empty state in create mode', () => {
    const { result } = renderHook(() => useRecipeForm());
    
    // Get the current date for comparison
    const now = new Date();
    const formData = result.current.formData;
    
    // Basic form data validation
    expect(formData.title).toBe('');
    expect(formData.description).toBe('');
    expect(formData.ingredients).toEqual(['']);
    expect(formData.instructions).toEqual(['']);
    expect(formData.imageUrl).toBe('');
    expect(formData.prepTime).toBe(0);
    expect(formData.cookTime).toBe(0);
    expect(formData.cuisineType).toBe('');
    expect(formData.tags).toEqual([]);
    
    // Date validation - ensure they're recent dates
    const createdDate = new Date(formData.createdAt);
    const updatedDate = new Date(formData.updatedAt);
    expect(createdDate.getTime()).toBeLessThanOrEqual(now.getTime());
    expect(updatedDate.getTime()).toBeLessThanOrEqual(now.getTime());
    expect(createdDate.getTime()).toBeGreaterThan(now.getTime() - 1000); // Within last second
    expect(updatedDate.getTime()).toBeGreaterThan(now.getTime() - 1000);
    
    // Other state checks
    expect(result.current.imagePreview).toBeNull();
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('initializes with recipe data when provided', () => {
    const { result } = renderHook(() => useRecipeForm(mockRecipe));
    
    expect(result.current.formData).toEqual(expect.objectContaining({
      title: mockRecipe.title,
      description: mockRecipe.description,
      ingredients: mockRecipe.ingredients,
      instructions: mockRecipe.instructions,
      imageUrl: mockRecipe.imageUrl,
      prepTime: mockRecipe.prepTime,
      cookTime: mockRecipe.cookTime,
      cuisineType: mockRecipe.cuisineType,
      tags: mockRecipe.tags,
    }));
    expect(result.current.imagePreview).toBe(mockRecipe.imageUrl);
  });

  it('handles successful image upload', async () => {
    const mockUrl = 'https://example.com/uploaded.jpg';
    const { recipeApi } = require('@/services/api/recipeApi');
    recipeApi.uploadImage.mockResolvedValueOnce({ success: true, url: mockUrl });

    const { result } = renderHook(() => useRecipeForm());

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const event = {
      target: {
        files: [file]
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    await act(async () => {
      await result.current.handleImageUpload(event);
    });

    expect(result.current.imagePreview).toBe('mock-url');
    expect(result.current.formData.imageUrl).toBe(mockUrl);
    expect(result.current.uploadProgress).toBe('done');
    expect(result.current.error).toBeNull();
  });

  it('handles image upload failure', async () => {
    const { recipeApi } = require('@/services/api/recipeApi');
    recipeApi.uploadImage.mockRejectedValueOnce(new Error('Upload failed'));

    const { result } = renderHook(() => useRecipeForm());

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const event = {
      target: {
        files: [file]
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    await act(async () => {
      await result.current.handleImageUpload(event);
    });

    expect(result.current.uploadProgress).toBe('error');
    expect(result.current.error).toBe(RECIPE_FORM.ERRORS.UPLOAD_FAILED);
  });

  it('handles successful form submission in create mode', async () => {
    const onSuccess = jest.fn();
    const { recipeApi } = require('@/services/api/recipeApi');
    recipeApi.create.mockResolvedValueOnce({ id: 'new-recipe-id' });

    const { result } = renderHook(() => useRecipeForm(undefined, onSuccess));

    const event = {
      preventDefault: jest.fn()
    } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(event.preventDefault).toHaveBeenCalled();
    expect(recipeApi.create).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
    expect(result.current.error).toBeNull();
  });

  it('handles successful form submission in edit mode', async () => {
    const onSuccess = jest.fn();
    const { recipeApi } = require('@/services/api/recipeApi');
    recipeApi.update.mockResolvedValueOnce({ recipe: mockRecipe });

    const { result } = renderHook(() => useRecipeForm(mockRecipe, onSuccess));

    const event = {
      preventDefault: jest.fn()
    } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(event.preventDefault).toHaveBeenCalled();
    expect(recipeApi.update).toHaveBeenCalledWith(mockRecipe._id, expect.any(Object));
    expect(onSuccess).toHaveBeenCalled();
    expect(result.current.error).toBeNull();
  });

  it('handles form submission failure', async () => {
    const { recipeApi } = require('@/services/api/recipeApi');
    recipeApi.create.mockRejectedValueOnce(new Error('Save failed'));

    const { result } = renderHook(() => useRecipeForm());

    const event = {
      preventDefault: jest.fn()
    } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(result.current.error).toBe(RECIPE_FORM.ERRORS.SAVE_FAILED);
    expect(result.current.isSubmitting).toBe(false);
  });

  it('handles network errors during form submission', async () => {
    const { recipeApi } = require('@/services/api/recipeApi');
    recipeApi.create.mockRejectedValueOnce(new NetworkError());

    const { result } = renderHook(() => useRecipeForm());

    const event = {
      preventDefault: jest.fn()
    } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(result.current.error).toBe(RECIPE_FORM.ERRORS.NETWORK_ERROR);
    expect(result.current.isSubmitting).toBe(false);
  });

  it('handles validation errors during form submission', async () => {
    const { recipeApi } = require('@/services/api/recipeApi');
    recipeApi.create.mockRejectedValueOnce(new ValidationError('Invalid input'));

    const { result } = renderHook(() => useRecipeForm());

    const event = {
      preventDefault: jest.fn()
    } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(result.current.error).toBe('Invalid input');
    expect(result.current.isSubmitting).toBe(false);
  });
}); 