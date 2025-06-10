import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateRecipeDescription(title: string, ingredients: string[], instructions: string[]) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a culinary copywriter crafting engaging, professional recipe descriptions for expert chefs. Based on the recipe title, ingredients, and first few instructions, generate a concise, vivid, and appetizing 2–3 sentence description. Highlight key flavors, techniques, and any special cultural or seasonal relevance. Avoid exaggeration and maintain a refined tone. Emphasize flavor dynamics, texture, and cooking techniques. Avoid generic phrases like 'delicious' or 'tasty'. Reflect the sophistication of a professional kitchen."
        },
        {
          role: "user",
          content: `Write a description for a recipe with the following details:
Title: ${title}
Ingredients: ${ingredients.join(', ')}
Key Steps: ${instructions.slice(0, 3).join(', ')}...`
        }
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating recipe description:', error);
    throw error;
  }
}

export async function suggestRecipeTags(title: string, ingredients: string[], instructions: string[]) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert culinary categorization assistant. Based on the recipe's title, ingredients, and instructions, generate exactly three unique, relevant tags that describe flavor profiles, cooking methods, or dietary categories. Do not repeat any words already present in the recipe title or the cuisine type. Tags should be concise and descriptive. Prefer culinary terminology used by professionals (e.g., 'Umami', 'Poached', 'Low Carb')."
        },
        {
          role: "user",
          content: `Suggest exactly 3 tags for a recipe with the following details:
Title: ${title}
Ingredients: ${ingredients.join(', ')}
Key Steps: ${instructions.slice(0, 3).join(', ')}...`
        }
      ],
      temperature: 0.5,
      max_tokens: 25,
    });

    const tags = response.choices[0].message.content?.split(',').map(tag => tag.trim()) || [];
    return tags.slice(0, 3); // Ensure we never return more than 3 tags
  } catch (error) {
    console.error('Error generating recipe tags:', error);
    throw error;
  }
}

export async function generateCompleteRecipe(title: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional chef and recipe developer. Given only the recipe title, generate a complete, realistic, high-quality recipe as JSON. Ensure all components are present: description (string), ingredients (array of strings), instructions (array of strings with numbered steps), preparation and cook time in minutes (numbers), cuisine type (string), and three relevant tags (array of strings). Keep it chef-level but accessible for other professionals. Prioritize clarity, realism, and efficiency. Assume a professional kitchen context with appropriate shorthand. Each instruction should be a clear, concise string describing a single step."
        },
        {
          role: "user",
          content: `Create a complete recipe for: ${title}`
        }
      ],
      temperature: 0.6,
      max_tokens: 700,
      response_format: { type: "json_object" },
    });

    const recipeData = JSON.parse(response.choices[0].message.content || '{}');
    
    // Ensure instructions are properly formatted as strings
    const formattedInstructions = recipeData.instructions?.map((instruction: any) => 
      typeof instruction === 'object' ? instruction.text || String(instruction) : String(instruction)
    ) || [];

    // Ensure cuisine type is a string
    const cuisineType = typeof recipeData.cuisineType === 'string' ? 
      recipeData.cuisineType : 
      (recipeData.cuisine || recipeData.type || 'Other');

    const formattedRecipe = {
      ...recipeData,
      instructions: formattedInstructions,
      cuisineType,
      prepTime: Math.min(Math.max(recipeData.prepTime || 15, 5), 120), // Ensure prep time is between 5-120 minutes
      cookTime: Math.min(Math.max(recipeData.cookTime || 20, 5), 360), // Ensure cook time is between 5-360 minutes
      tags: (recipeData.tags || []).slice(0, 3), // Ensure max 3 tags
    };

    console.log('Formatted Recipe:', formattedRecipe);
    return formattedRecipe;
  } catch (error) {
    console.error('Error generating complete recipe:', error);
    throw error;
  }
} 