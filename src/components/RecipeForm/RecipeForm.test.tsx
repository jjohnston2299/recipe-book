import { render, screen, fireEvent, waitFor } from '@/utils/test-utils';
import RecipeForm from './RecipeForm';
import { RECIPE_FORM } from '@/constants';
import '@testing-library/jest-dom';

// Mock the useAIFeatures hook
jest.mock('@/context/AIFeaturesContext', () => ({
  useAIFeatures: () => true
}));

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');

describe('RecipeForm', () => {
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
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
    (global.URL.createObjectURL as jest.Mock).mockReset();
    (global.URL.createObjectURL as jest.Mock).mockReturnValue('mock-url');
  });

  it('renders empty form in create mode', () => {
    render(<RecipeForm />);
    
    // Check if all form fields are present and empty
    expect(screen.getByPlaceholderText(RECIPE_FORM.TITLE_PLACEHOLDER)).toHaveValue('');
    expect(screen.getByPlaceholderText(RECIPE_FORM.DESCRIPTION_PLACEHOLDER)).toHaveValue('');
    expect(screen.getByPlaceholderText(RECIPE_FORM.CUISINE_PLACEHOLDER)).toHaveValue('');
    
    // Check if add buttons are present
    expect(screen.getByText(RECIPE_FORM.BUTTONS.ADD_INGREDIENT)).toBeInTheDocument();
    expect(screen.getByText(RECIPE_FORM.BUTTONS.ADD_INSTRUCTION)).toBeInTheDocument();
  });

  it('renders form with recipe data in edit mode', () => {
    render(<RecipeForm recipe={mockRecipe} />);
    
    // Check if form fields are populated with recipe data
    expect(screen.getByPlaceholderText(RECIPE_FORM.TITLE_PLACEHOLDER)).toHaveValue(mockRecipe.title);
    expect(screen.getByPlaceholderText(RECIPE_FORM.DESCRIPTION_PLACEHOLDER)).toHaveValue(mockRecipe.description);
    expect(screen.getByPlaceholderText(RECIPE_FORM.CUISINE_PLACEHOLDER)).toHaveValue(mockRecipe.cuisineType);
    
    // Check if ingredients and instructions are populated
    mockRecipe.ingredients.forEach(ingredient => {
      expect(screen.getByDisplayValue(ingredient)).toBeInTheDocument();
    });
    mockRecipe.instructions.forEach(instruction => {
      expect(screen.getByDisplayValue(instruction)).toBeInTheDocument();
    });
  });

  it('handles adding and removing ingredients', () => {
    render(<RecipeForm />);
    
    // Add new ingredient
    const addButton = screen.getByText(RECIPE_FORM.BUTTONS.ADD_INGREDIENT);
    fireEvent.click(addButton);
    
    // Should now have two ingredient inputs (one default + one added)
    const ingredientInputs = screen.getAllByPlaceholderText(RECIPE_FORM.INGREDIENT_PLACEHOLDER);
    expect(ingredientInputs).toHaveLength(2);
    
    // Fill in and verify ingredient
    fireEvent.change(ingredientInputs[0], { target: { value: 'New ingredient' } });
    expect(ingredientInputs[0]).toHaveValue('New ingredient');
  });

  it('handles adding and removing instructions', () => {
    render(<RecipeForm />);
    
    // Add new instruction
    const addButton = screen.getByText(RECIPE_FORM.BUTTONS.ADD_INSTRUCTION);
    fireEvent.click(addButton);
    
    // Should now have two instruction inputs
    const instructionInputs = screen.getAllByPlaceholderText(/Step \d+/);
    expect(instructionInputs).toHaveLength(2);
    
    // Fill in and verify instruction
    fireEvent.change(instructionInputs[0], { target: { value: 'New instruction' } });
    expect(instructionInputs[0]).toHaveValue('New instruction');
  });

  it('handles form submission in create mode', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
    
    render(<RecipeForm />);
    
    // Fill in required fields
    fireEvent.change(screen.getByPlaceholderText(RECIPE_FORM.TITLE_PLACEHOLDER), {
      target: { value: 'New Recipe' }
    });
    fireEvent.change(screen.getByPlaceholderText(RECIPE_FORM.INGREDIENT_PLACEHOLDER), {
      target: { value: 'Test ingredient' }
    });
    fireEvent.change(screen.getByPlaceholderText('Step 1'), {
      target: { value: 'Test instruction' }
    });
    
    // Submit form
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/recipes', expect.any(Object));
    });
  });

  it('handles form submission in edit mode', async () => {
    const onSuccess = jest.fn();
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
    
    render(<RecipeForm recipe={mockRecipe} onSuccess={onSuccess} />);
    
    // Submit form
    const submitButton = screen.getByText(RECIPE_FORM.BUTTONS.SAVE_RECIPE);
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(`/api/recipes/${mockRecipe._id}`, expect.any(Object));
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('handles AI description generation', async () => {
    const generatedDescription = 'AI generated description';
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ description: generatedDescription })
    });
    
    render(<RecipeForm recipe={mockRecipe} />);
    
    const generateButton = screen.getByText(RECIPE_FORM.BUTTONS.GENERATE_DESCRIPTION);
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/ai', expect.any(Object));
      expect(screen.getByPlaceholderText(RECIPE_FORM.DESCRIPTION_PLACEHOLDER)).toHaveValue(generatedDescription);
    });
  });

  it('handles AI tag generation', async () => {
    const generatedTags = ['healthy', 'quick'];
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ tags: generatedTags })
    });
    
    render(<RecipeForm recipe={mockRecipe} />);
    
    const generateButton = screen.getByText(RECIPE_FORM.BUTTONS.GENERATE_TAGS);
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/ai', expect.any(Object));
      generatedTags.forEach(tag => {
        expect(screen.getByText(tag)).toBeInTheDocument();
      });
    });
  });

  it('handles image upload', async () => {
    const mockUrl = 'https://example.com/uploaded.jpg';
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, url: mockUrl })
    });
    
    render(<RecipeForm />);
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(RECIPE_FORM.BUTTONS.UPLOAD_IMAGE);
    
    Object.defineProperty(input, 'files', {
      value: [file]
    });
    
    fireEvent.change(input);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/images', expect.any(Object));
      expect(screen.getByText(RECIPE_FORM.UPLOAD_STATUS.SUCCESS)).toBeInTheDocument();
    });
  });

  it('displays error message on failed submission', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to save'));
    
    render(<RecipeForm recipe={mockRecipe} />);
    
    const submitButton = screen.getByText(RECIPE_FORM.BUTTONS.SAVE_RECIPE);
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(RECIPE_FORM.ERRORS.SAVE_FAILED);
    });
    
    consoleSpy.mockRestore();
    alertMock.mockRestore();
  });

  it('handles updating existing recipe fields in edit mode', async () => {
    render(<RecipeForm recipe={mockRecipe} />);
    
    // Update title
    const titleInput = screen.getByPlaceholderText(RECIPE_FORM.TITLE_PLACEHOLDER);
    fireEvent.change(titleInput, { target: { value: 'Updated Recipe Title' } });
    expect(titleInput).toHaveValue('Updated Recipe Title');
    
    // Update description
    const descInput = screen.getByPlaceholderText(RECIPE_FORM.DESCRIPTION_PLACEHOLDER);
    fireEvent.change(descInput, { target: { value: 'Updated description' } });
    expect(descInput).toHaveValue('Updated description');
    
    // Update cuisine type
    const cuisineInput = screen.getByPlaceholderText(RECIPE_FORM.CUISINE_PLACEHOLDER);
    fireEvent.change(cuisineInput, { target: { value: 'French' } });
    expect(cuisineInput).toHaveValue('French');
    
    // Update prep and cook time
    const [prepTimeInput, cookTimeInput] = screen.getAllByRole('spinbutton');
    fireEvent.change(prepTimeInput, { target: { value: '45' } });
    fireEvent.change(cookTimeInput, { target: { value: '60' } });
    expect(prepTimeInput).toHaveValue(45);
    expect(cookTimeInput).toHaveValue(60);
  });

  it('handles removing and adding ingredients in edit mode', () => {
    render(<RecipeForm recipe={mockRecipe} />);
    
    // Get initial ingredients
    const initialIngredients = screen.getAllByDisplayValue(/Ingredient \d/);
    expect(initialIngredients).toHaveLength(2);
    
    // Remove an ingredient
    const removeButtons = screen.getAllByText('×');
    fireEvent.click(removeButtons[0]);
    
    // Verify ingredient was removed
    expect(screen.getAllByDisplayValue(/Ingredient \d/)).toHaveLength(1);
    
    // Add new ingredient
    fireEvent.click(screen.getByText(RECIPE_FORM.BUTTONS.ADD_INGREDIENT));
    const ingredientInputs = screen.getAllByPlaceholderText(RECIPE_FORM.INGREDIENT_PLACEHOLDER);
    fireEvent.change(ingredientInputs[1], { target: { value: 'New test ingredient' } });
    
    // Verify new ingredient was added
    expect(screen.getByDisplayValue('New test ingredient')).toBeInTheDocument();
  });

  it('handles removing and adding instructions in edit mode', () => {
    render(<RecipeForm recipe={mockRecipe} />);
    
    // Get initial instructions
    const initialInstructions = screen.getAllByDisplayValue(/Step \d/);
    expect(initialInstructions).toHaveLength(2);
    
    // Remove an instruction
    const removeButtons = screen.getAllByText('×');
    fireEvent.click(removeButtons[2]); // Skip ingredient remove buttons
    
    // Verify instruction was removed
    expect(screen.getAllByDisplayValue(/Step \d/)).toHaveLength(1);
    
    // Add new instruction
    fireEvent.click(screen.getByText(RECIPE_FORM.BUTTONS.ADD_INSTRUCTION));
    const instructionInputs = screen.getAllByPlaceholderText(/Step \d/);
    fireEvent.change(instructionInputs[1], { target: { value: 'New test instruction' } });
    
    // Verify new instruction was added
    expect(screen.getByDisplayValue('New test instruction')).toBeInTheDocument();
  });

  it('handles tag management in edit mode', () => {
    render(<RecipeForm recipe={mockRecipe} />);
    
    // Verify initial tags
    mockRecipe.tags.forEach(tag => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
    
    // Remove a tag
    const removeTagButtons = screen.getAllByText('×');
    fireEvent.click(removeTagButtons[removeTagButtons.length - 1]);
    expect(screen.queryByText(mockRecipe.tags[1])).not.toBeInTheDocument();
    
    // Add a new tag
    const tagInput = screen.getByPlaceholderText('Add a tag');
    fireEvent.keyDown(tagInput, { key: 'Enter', target: { value: 'new-tag' } });
    expect(screen.getByText('new-tag')).toBeInTheDocument();
  });

  it('handles image management in edit mode', () => {
    render(<RecipeForm recipe={mockRecipe} />);
    
    // Verify initial image is displayed
    const initialImage = screen.getByAltText('Recipe preview');
    expect(initialImage).toHaveAttribute('src', expect.stringContaining(mockRecipe.imageUrl));
    
    // Remove image
    fireEvent.click(screen.getByText(RECIPE_FORM.BUTTONS.REMOVE_IMAGE));
    
    // After removal, we should see the placeholder SVG instead of the image
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(document.querySelector('svg')).toBeInTheDocument();
    
    // Upload new image
    const file = new File(['test'], 'new-image.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(RECIPE_FORM.BUTTONS.UPLOAD_IMAGE);
    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);
    
    // Verify upload status message
    expect(screen.getByText(RECIPE_FORM.UPLOAD_STATUS.UPLOADING)).toBeInTheDocument();
  });

  it('calls onSuccess callback after successful edit submission', async () => {
    const onSuccess = jest.fn();
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
    
    render(<RecipeForm recipe={mockRecipe} onSuccess={onSuccess} />);
    
    // Make some changes
    fireEvent.change(screen.getByPlaceholderText(RECIPE_FORM.TITLE_PLACEHOLDER), {
      target: { value: 'Updated Title' }
    });
    
    // Submit form
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(`/api/recipes/${mockRecipe._id}`, expect.any(Object));
      expect(onSuccess).toHaveBeenCalled();
    });
  });
}); 