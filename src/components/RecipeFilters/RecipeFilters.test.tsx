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

  it('renders all filter sections', () => {
    render(<RecipeFilters {...mockProps} />);
    
    // Check if all main sections are present
    expect(screen.getByPlaceholderText(RECIPE_FILTERS.SEARCH_PLACEHOLDER)).toBeInTheDocument();
    expect(screen.getByText(RECIPE_FILTERS.LABELS.CUISINE)).toBeInTheDocument();
    expect(screen.getByText(RECIPE_FILTERS.LABELS.MAX_TIME)).toBeInTheDocument();
    expect(screen.getByText(RECIPE_FILTERS.BUTTONS.FILTER_BY_TAGS)).toBeInTheDocument();
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
    const cuisineSelect = screen.getByLabelText(RECIPE_FILTERS.LABELS.CUISINE);
    
    mockProps.cuisineTypes.forEach(cuisine => {
      expect(screen.getByText(cuisine)).toBeInTheDocument();
    });
  });

  it('handles time range selection', () => {
    render(<RecipeFilters {...mockProps} />);
    const timeInput = screen.getByRole('slider');
    
    fireEvent.change(timeInput, { target: { value: '90' } });
    expect(mockProps.setMaxTotalTime).toHaveBeenCalledWith(90);
  });

  it('displays and handles tag selection', () => {
    render(<RecipeFilters {...mockProps} />);
    
    // Click the button to expand tags section first
    const expandButton = screen.getByText(RECIPE_FILTERS.BUTTONS.FILTER_BY_TAGS);
    fireEvent.click(expandButton);
    
    // Now we can interact with the tags
    mockProps.availableTags.forEach(tag => {
      const tagButton = screen.getByText(tag);
      expect(tagButton).toBeInTheDocument();
      
      fireEvent.click(tagButton);
      expect(mockProps.setSelectedTags).toHaveBeenCalled();
    });
  });

  it('handles clear all filters', () => {
    render(<RecipeFilters {...mockProps} />);
    const clearButton = screen.getByText(RECIPE_FILTERS.BUTTONS.CLEAR_ALL_FILTERS);
    
    fireEvent.click(clearButton);
    expect(mockProps.clearAllFilters).toHaveBeenCalled();
  });

  it('highlights selected tags', () => {
    const propsWithSelectedTags = {
      ...mockProps,
      selectedTags: ['quick', 'easy'],
    };
    
    render(<RecipeFilters {...propsWithSelectedTags} />);
    
    // Click the button to expand tags section first
    const expandButton = screen.getByRole('button', {
      name: new RegExp(RECIPE_FILTERS.BUTTONS.FILTER_BY_TAGS)
    });
    fireEvent.click(expandButton);
    
    const selectedTags = propsWithSelectedTags.selectedTags;
    selectedTags.forEach(tag => {
      const tagElement = screen.getByText(tag);
      expect(tagElement).toHaveClass('bg-[#819A91]');
      expect(tagElement).toHaveClass('text-white');
    });
  });
}); 