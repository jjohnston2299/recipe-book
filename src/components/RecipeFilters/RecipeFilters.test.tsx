import { render, screen, fireEvent } from '@/utils/test-utils';
import RecipeFilters from './RecipeFilters';
import { RECIPE_FILTERS } from '@/constants';
import '@testing-library/jest-dom';

describe('RecipeFilters', () => {
  const mockProps = {
    searchQuery: '',
    setSearchQuery: jest.fn(),
    selectedCuisine: '',
    setSelectedCuisine: jest.fn(),
    maxTotalTime: 120,
    setMaxTotalTime: jest.fn(),
    selectedTags: [],
    setSelectedTags: jest.fn(),
    cuisineTypes: ['Italian', 'Mexican', 'Japanese'],
    availableTags: ['quick', 'easy', 'vegetarian'],
    clearAllFilters: jest.fn(),
  };

  it('renders all filter sections with correct styling', () => {
    render(<RecipeFilters {...mockProps} />);
    
    // Check search input
    const searchInput = screen.getByPlaceholderText(RECIPE_FILTERS.SEARCH_PLACEHOLDER);
    expect(searchInput).toHaveClass('border', 'border-[#D1D8BE]', 'text-[#819A91]', 'bg-white');
    
    // Check cuisine select
    const cuisineSelect = screen.getByLabelText(RECIPE_FILTERS.LABELS.CUISINE);
    expect(cuisineSelect).toHaveClass('border', 'border-[#D1D8BE]', 'text-[#819A91]', 'bg-white');
    
    // Check time slider section
    expect(screen.getByText(RECIPE_FILTERS.LABELS.MAX_TIME)).toHaveClass('text-[#819A91]', 'font-medium');
    
    // Check tags button
    const tagsButton = screen.getByRole('button', { name: new RegExp(RECIPE_FILTERS.BUTTONS.FILTER_BY_TAGS) });
    expect(tagsButton).toHaveClass('bg-[#F5F6F0]', 'text-[#819A91]');
  });

  it('handles search input changes', () => {
    render(<RecipeFilters {...mockProps} />);
    const searchInput = screen.getByPlaceholderText(RECIPE_FILTERS.SEARCH_PLACEHOLDER);
    
    fireEvent.change(searchInput, { target: { value: 'pasta' } });
    expect(mockProps.setSearchQuery).toHaveBeenCalledWith('pasta');
  });

  it('handles cuisine selection', () => {
    render(<RecipeFilters {...mockProps} />);
    const cuisineSelect = screen.getByLabelText(RECIPE_FILTERS.LABELS.CUISINE);
    
    fireEvent.change(cuisineSelect, { target: { value: 'Italian' } });
    expect(mockProps.setSelectedCuisine).toHaveBeenCalledWith('Italian');
  });

  it('displays all available cuisine types', () => {
    render(<RecipeFilters {...mockProps} />);
    
    // Check "All Cuisines" option
    expect(screen.getByText(RECIPE_FILTERS.LABELS.ALL_CUISINES)).toBeInTheDocument();
    
    // Check cuisine options
    mockProps.cuisineTypes.forEach(cuisine => {
      expect(screen.getByText(cuisine)).toBeInTheDocument();
    });
  });

  it('displays and handles tag selection with correct styling', () => {
    render(<RecipeFilters {...mockProps} />);
    
    // Click the button to expand tags section
    const expandButton = screen.getByRole('button', { name: new RegExp(RECIPE_FILTERS.BUTTONS.FILTER_BY_TAGS) });
    fireEvent.click(expandButton);
    
    // Check tag styling
    mockProps.availableTags.forEach(tag => {
      const tagButton = screen.getByRole('button', { name: tag });
      expect(tagButton).toHaveClass('bg-[#EEEFE0]', 'text-[#819A91]');
    });
    
    // Click a tag and check selected styling
    const firstTag = screen.getByRole('button', { name: mockProps.availableTags[0] });
    fireEvent.click(firstTag);
    expect(mockProps.setSelectedTags).toHaveBeenCalled();
  });

  it('handles clear all filters with correct styling', () => {
    render(<RecipeFilters {...mockProps} />);
    const clearButton = screen.getByRole('button', { name: RECIPE_FILTERS.BUTTONS.CLEAR_ALL_FILTERS });
    
    expect(clearButton).toHaveClass('border-[#819A91]', 'text-[#819A91]');
    
    fireEvent.click(clearButton);
    expect(mockProps.clearAllFilters).toHaveBeenCalled();
  });

  it('highlights selected tags with correct styling', () => {
    const propsWithSelectedTags = {
      ...mockProps,
      selectedTags: ['quick', 'easy'],
    };
    
    render(<RecipeFilters {...propsWithSelectedTags} />);
    
    // Click the button to expand tags section
    const expandButton = screen.getByRole('button', { name: new RegExp(RECIPE_FILTERS.BUTTONS.FILTER_BY_TAGS) });
    fireEvent.click(expandButton);
    
    propsWithSelectedTags.selectedTags.forEach(tag => {
      const tagElement = screen.getByRole('button', { name: tag });
      expect(tagElement).toHaveClass('bg-[#819A91]', 'text-white');
    });
  });
}); 