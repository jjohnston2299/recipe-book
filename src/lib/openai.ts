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
          content: "You are a Michelin-level recipe consultant. When a user describes what they're craving or their dietary needs, respond with a fully detailed, original recipe that meets their request. Include ingredients and detailed instructions. Recipes should balance creativity with professional reliability. Use professional culinary terminology, avoid vague quantities (e.g., say '2 tsp' not 'a little'), and always consider seasonality, balance, and technique."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.8,
      max_tokens: 650,
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
          content: "You are a culinary expert who specializes in adapting recipes without compromising flavor or technique. Given a recipe and a requested modification, return a new version of the recipe that meets the request while preserving its original essence and professional quality. If needed, make substitutions and explain changes briefly in the instructions. Clearly reflect the requested change, preserve the tone and technique of the original, and use culinary logic to balance substitutions (e.g., umami alternatives for meat)."
        },
        {
          role: "user",
          content: `Original recipe: ${recipe}\nRequested modification: ${modification}`
        }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.6,
      max_tokens: 600,
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
          content: "You are a professional chef and recipe developer. Given only the recipe title, generate a complete, realistic, high-quality recipe as JSON. Ensure all components are present: description, ingredients (as a list of strings), step-by-step instructions (clear and concise), preparation and cook time in minutes, cuisine type, and three relevant tags. Keep it chef-level but accessible for other professionals. Prioritize clarity, realism, and efficiency. Assume a professional kitchen context with appropriate shorthand. Instructions should be step-based (1 idea per step)."
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