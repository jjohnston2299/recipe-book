export interface Recipe {
  _id: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  imageUrl: string;
  prepTime: number;
  cookTime: number;
  cuisineType: string;
  tags: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeFormProps {
  recipe?: Recipe;
}

export interface RecipeGridProps {
  recipes: Recipe[];
}

export interface RecipeFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCuisine: string;
  setSelectedCuisine: (cuisine: string) => void;
  maxTotalTime: number;
  setMaxTotalTime: (time: number) => void;
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
  cuisineTypes: string[];
  availableTags: string[];
  clearAllFilters: () => void;
} 