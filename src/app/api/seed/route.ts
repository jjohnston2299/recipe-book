import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

const testRecipes = [
  {
    title: "Classic Spaghetti Carbonara",
    ingredients: [
      "400g spaghetti",
      "200g guanciale or pancetta, diced",
      "4 large egg yolks",
      "2 large whole eggs",
      "100g Pecorino Romano, freshly grated",
      "100g Parmigiano Reggiano, freshly grated",
      "2 cloves garlic, lightly crushed (optional)",
      "Fresh black pepper",
      "Salt"
    ],
    instructions: [
      "Bring a large pot of salted water to boil for the pasta",
      "In a large bowl, whisk together egg yolks, whole eggs, and grated cheeses. Season with black pepper",
      "Cook guanciale in a dry pan until crispy and fat has rendered, about 3-4 minutes. Remove from heat",
      "Cook spaghetti in the boiling water until al dente",
      "Reserve 1 cup of pasta water, then drain pasta",
      "Working quickly, add hot pasta to the bowl with egg mixture",
      "Add guanciale and some rendered fat",
      "Toss everything together, adding pasta water as needed to create a creamy sauce",
      "Serve immediately with extra cheese and black pepper"
    ],
    imageUrl: "",
    prepTime: 15,
    cookTime: 20,
    cuisineType: "Italian",
    tags: ["pasta", "quick", "traditional", "dinner"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Vegetarian Buddha Bowl",
    ingredients: [
      "1 cup quinoa, rinsed",
      "1 large sweet potato, cubed",
      "2 cups kale, chopped",
      "1 can chickpeas, drained and rinsed",
      "1 ripe avocado, sliced",
      "2 tbsp olive oil",
      "1 lemon, juiced",
      "2 tbsp tahini",
      "1 tbsp maple syrup",
      "Salt and pepper to taste",
      "Optional toppings: sesame seeds, microgreens"
    ],
    instructions: [
      "Preheat oven to 400°F (200°C)",
      "Cook quinoa according to package instructions",
      "Toss sweet potato cubes with 1 tbsp olive oil, salt, and pepper",
      "Roast sweet potatoes for 20-25 minutes until tender",
      "Drain and rinse chickpeas, toss with olive oil and seasonings",
      "Add chickpeas to the oven for the last 10 minutes to crisp up",
      "Massage kale with lemon juice and a pinch of salt",
      "Make dressing: whisk together tahini, remaining lemon juice, maple syrup, and water to thin",
      "Assemble bowls: quinoa base, roasted veggies, kale, avocado",
      "Drizzle with tahini dressing and add optional toppings"
    ],
    imageUrl: "",
    prepTime: 20,
    cookTime: 30,
    cuisineType: "International",
    tags: ["vegetarian", "healthy", "bowl", "lunch", "dinner"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Classic French Croissants",
    ingredients: [
      "4 cups all-purpose flour",
      "1/4 cup sugar",
      "1 tbsp active dry yeast",
      "2 tsp salt",
      "1 1/4 cups cold whole milk",
      "2 cups unsalted butter for laminating",
      "1 egg (for egg wash)",
      "1 tbsp water (for egg wash)"
    ],
    instructions: [
      "Mix flour, sugar, yeast, and salt in a large bowl",
      "Gradually add cold milk to form a dough",
      "Knead for 10 minutes until smooth",
      "Rest dough in refrigerator for 1 hour",
      "Prepare butter block by pounding cold butter into a rectangle",
      "Roll dough and encase butter block",
      "Perform 3 letter folds with 1-hour rests in between",
      "Roll final dough to 1/8 inch thickness",
      "Cut triangles and roll into croissants",
      "Proof for 2 hours until doubled in size",
      "Brush with egg wash",
      "Bake at 400°F for 15-20 minutes until golden brown"
    ],
    imageUrl: "",
    prepTime: 180,
    cookTime: 20,
    cuisineType: "French",
    tags: ["pastry", "breakfast", "baking", "advanced"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Spicy Thai Green Curry",
    ingredients: [
      "2 cans coconut milk",
      "3 tbsp green curry paste",
      "2 chicken breasts, sliced (or tofu for vegetarian)",
      "1 cup bamboo shoots",
      "1 red bell pepper, sliced",
      "1 cup snap peas",
      "4 kaffir lime leaves",
      "2 tbsp fish sauce",
      "1 tbsp palm sugar",
      "1 cup Thai basil leaves",
      "2 Thai chilies (optional)",
      "Jasmine rice for serving"
    ],
    instructions: [
      "Heat thick part of coconut milk in a wok until oil separates",
      "Add curry paste and fry until fragrant",
      "Add chicken/tofu and stir to coat",
      "Add remaining coconut milk and bring to simmer",
      "Add bamboo shoots and bell pepper",
      "Season with fish sauce and palm sugar",
      "Add snap peas and kaffir lime leaves",
      "Simmer until vegetables are tender-crisp",
      "Stir in Thai basil leaves",
      "Serve hot over jasmine rice"
    ],
    imageUrl: "",
    prepTime: 20,
    cookTime: 25,
    cuisineType: "Thai",
    tags: ["curry", "spicy", "asian", "dinner"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Classic Apple Pie",
    ingredients: [
      "For the crust:",
      "2 1/2 cups all-purpose flour",
      "1 cup cold butter, cubed",
      "1/4 cup cold water",
      "1 tsp salt",
      "For the filling:",
      "6 large Granny Smith apples, sliced",
      "3/4 cup sugar",
      "2 tbsp lemon juice",
      "1 tsp ground cinnamon",
      "1/4 tsp ground nutmeg",
      "1/4 tsp ground allspice",
      "3 tbsp cornstarch",
      "1 egg (for egg wash)"
    ],
    instructions: [
      "Make the crust: Mix flour and salt",
      "Cut in cold butter until pea-sized",
      "Gradually add cold water until dough forms",
      "Chill dough for 1 hour",
      "Mix sliced apples with sugar, spices, lemon juice, and cornstarch",
      "Roll out bottom crust and place in pie dish",
      "Fill with apple mixture",
      "Roll out top crust and cover pie",
      "Cut slits for venting",
      "Brush with egg wash",
      "Bake at 375°F for 45-50 minutes until golden"
    ],
    imageUrl: "",
    prepTime: 45,
    cookTime: 50,
    cuisineType: "American",
    tags: ["dessert", "baking", "pie", "traditional"],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export async function POST() {
  try {
    const db = await getDb();
    
    // Clear existing recipes
    await db.collection('recipes').deleteMany({});
    
    // Insert test recipes
    const result = await db.collection('recipes').insertMany(testRecipes);
    
    return NextResponse.json({ 
      success: true,
      message: `Successfully seeded database with ${result.insertedCount} recipes`,
      insertedIds: result.insertedIds
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 