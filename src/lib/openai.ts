import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getRecipeRecommendation(prompt: string) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful cooking assistant that provides detailed recipes with ingredients and instructions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-3.5-turbo",
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error getting recipe recommendation:', error);
    throw error;
  }
}

export async function getRecipeModification(recipe: string, modification: string) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful cooking assistant that provides recipe modifications while maintaining the original recipe's essence."
        },
        {
          role: "user",
          content: `Original recipe: ${recipe}\nRequested modification: ${modification}`
        }
      ],
      model: "gpt-3.5-turbo",
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error modifying recipe:', error);
    throw error;
  }
}

export async function generateRecipeDescription(title: string, ingredients: string[], instructions: string[]) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that writes engaging, concise recipe descriptions. Focus on the key flavors, techniques, and what makes the recipe special. Keep descriptions between 2-3 sentences."
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
      max_tokens: 150,
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
          content: "You are a helpful assistant that suggests relevant tags for recipes. Focus on cuisine type, cooking method, and dietary restrictions. Return exactly 3 most relevant tags as a comma-separated list."
        },
        {
          role: "user",
          content: `Suggest exactly 3 tags for a recipe with the following details:
Title: ${title}
Ingredients: ${ingredients.join(', ')}
Key Steps: ${instructions.slice(0, 3).join(', ')}...`
        }
      ],
      temperature: 0.7,
      max_tokens: 100,
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
          content: "You are a professional chef who creates detailed recipes. For each recipe, provide a description, ingredients list, step-by-step instructions, estimated prep and cook times, cuisine type, and 3 relevant tags. Format the response as JSON with the following structure: { description: string, ingredients: string[], instructions: string[], prepTime: number, cookTime: number, cuisineType: string, tags: string[] }"
        },
        {
          role: "user",
          content: `Create a complete recipe for: ${title}`
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const recipeData = JSON.parse(response.choices[0].message.content || '{}');
    return {
      ...recipeData,
      prepTime: Math.min(Math.max(recipeData.prepTime || 15, 5), 120), // Ensure prep time is between 5-120 minutes
      cookTime: Math.min(Math.max(recipeData.cookTime || 20, 5), 360), // Ensure cook time is between 5-360 minutes
      tags: (recipeData.tags || []).slice(0, 3), // Ensure max 3 tags
    };
  } catch (error) {
    console.error('Error generating complete recipe:', error);
    throw error;
  }
} 