import { renderHook, act } from '@testing-library/react';
import { useRecipeForm } from './useRecipeForm';
import { RECIPE_FORM } from '@/constants';

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');

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
    // Reset all mocks before each test
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
    (global.URL.createObjectURL as jest.Mock).mockReset();
    (global.URL.createObjectURL as jest.Mock).mockReturnValue('mock-url');
  });

  it('initializes with default values when no recipe is provided', () => {
    const { result } = renderHook(() => useRecipeForm());
    
    expect(result.current.formData).toEqual({
      title: '',
      description: '',
      ingredients: [''],
      instructions: [''],
      imageUrl: '',
      prepTime: 0,
      cookTime: 0,
      cuisineType: '',
      tags: [],
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
    expect(result.current.imagePreview).toBeNull();
    expect(result.current.uploadProgress).toBe('idle');
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
    expect(result.current.uploadProgress).toBe('idle');
  });

  it('handles successful image upload', async () => {
    const mockUrl = 'https://example.com/uploaded.jpg';
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, url: mockUrl })
    });

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

    expect(result.current.uploadProgress).toBe('done');
    expect(result.current.imagePreview).toBe('mock-url');
    expect(result.current.formData.imageUrl).toBe(mockUrl);
    expect(global.fetch).toHaveBeenCalledWith('/api/images', expect.any(Object));
  });

  it('handles image upload failure', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Upload failed'));

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
    expect(alertMock).toHaveBeenCalledWith(RECIPE_FORM.ERRORS.UPLOAD_FAILED);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
    alertMock.mockRestore();
  });

  it('handles empty file selection', async () => {
    const { result } = renderHook(() => useRecipeForm());

    const event = {
      target: {
        files: []
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    await act(async () => {
      await result.current.handleImageUpload(event);
    });

    expect(result.current.uploadProgress).toBe('idle');
    expect(result.current.imagePreview).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('handles API response with success: false', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: false, error: 'Upload failed' })
    });

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
    expect(alertMock).toHaveBeenCalledWith(RECIPE_FORM.ERRORS.UPLOAD_FAILED);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
    alertMock.mockRestore();
  });
}); 