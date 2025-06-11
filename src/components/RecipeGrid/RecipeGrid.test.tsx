import { render, screen } from '@/utils/test-utils';
import RecipeGrid from './RecipeGrid';
import { RECIPE_GRID } from '@/constants';
import '@testing-library/jest-dom';

describe('RecipeGrid', () => {
  const mockRecipes = [
    {
      _id: '1',
      title: 'Test Recipe 1',
      ingredients: ['ingredient 1', 'ingredient 2'],
      instructions: ['step 1', 'step 2'],
      imageUrl: 'https://example.com/image1.jpg',
      prepTime: 30,
      cookTime: 45,
      cuisineType: 'Italian',
      tags: ['pasta', 'dinner'],
      description: 'A test recipe description',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: '2',
      title: 'Test Recipe 2',
      ingredients: ['ingredient 3', 'ingredient 4'],
      instructions: ['step 3', 'step 4'],
      imageUrl: '',
      prepTime: 20,
      cookTime: 25,
      cuisineType: 'Mexican',
      tags: ['quick', 'spicy'],
      description: 'Another test recipe description',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  it('renders empty state message when no recipes are provided', () => {
    render(<RecipeGrid recipes={[]} />);
    expect(screen.getByText(RECIPE_GRID.NO_RECIPES)).toBeInTheDocument();
  });

  it('renders all recipes with their details', () => {
    render(<RecipeGrid recipes={mockRecipes} />);

    // Check if both recipe titles are rendered
    expect(screen.getByText('Test Recipe 1')).toBeInTheDocument();
    expect(screen.getByText('Test Recipe 2')).toBeInTheDocument();

    // Check if cuisine types are rendered
    expect(screen.getByText('Italian')).toBeInTheDocument();
    expect(screen.getByText('Mexican')).toBeInTheDocument();

    // Check if total time is rendered correctly
    expect(screen.getByText(`${RECIPE_GRID.TOTAL_TIME} 1h 15m`)).toBeInTheDocument();
    expect(screen.getByText(`${RECIPE_GRID.TOTAL_TIME} 45m`)).toBeInTheDocument();

    // Check if tags are rendered with correct styling
    const tags = screen.getAllByText(/(pasta|dinner|quick|spicy)/);
    tags.forEach(tag => {
      expect(tag).toHaveClass('bg-[#EEEFE0]', 'text-[#819A91]', 'px-2', 'py-0.5', 'rounded-full', 'text-sm', 'font-accent');
    });
  });

  it('renders placeholder image when imageUrl is empty', () => {
    render(<RecipeGrid recipes={[mockRecipes[1]]} />);
    const placeholderSvg = document.querySelector('svg');
    expect(placeholderSvg).toBeInTheDocument();
    expect(placeholderSvg).toHaveClass('h-12', 'w-12');
  });

  it('renders actual image when imageUrl is provided', () => {
    render(<RecipeGrid recipes={[mockRecipes[0]]} />);
    const image = screen.getByAltText('Test Recipe 1');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', expect.stringContaining('image1.jpg'));
  });

  it('renders recipe cards with correct styling', () => {
    render(<RecipeGrid recipes={mockRecipes} />);
    
    const cards = screen.getAllByRole('link');
    cards.forEach(card => {
      expect(card).toHaveClass('border', 'border-[#D1D8BE]', 'rounded-lg', 'overflow-hidden', 'hover:shadow-lg', 'transition-shadow', 'bg-white');
    });
  });
}); 