import type { Recipe } from '../../types';

export type RecipeUpdatePayload = {
  name: string;
  time: string;
  category: string;
  servings: number;
  ingredients: string[];
  instructions: string[];
  stepIngredients: Record<number, string[]>;
  removeImage: false;
};

export function buildRecipeUpdatePayload(
  recipe: Recipe,
  category: string = recipe.category,
): RecipeUpdatePayload {
  return {
    name: recipe.name,
    time: recipe.time,
    category,
    servings: recipe.servings,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    stepIngredients: recipe.stepIngredients || {},
    removeImage: false,
  };
}
