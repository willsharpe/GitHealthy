"use client";

import ImageCapture from "./components/ImageCapture";
import RecipeList from "./components/RecipeList";
import { useState } from "react";

type Ingredient = { name: string; confidence: number };
type Recipe = { id: number; title: string; image: string }; // adjust if needed

export default function Page() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [ingredientNames, setIngredientNames] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async ({ base64, mimeType }: { base64: string; mimeType: string }) => {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64, mimeType }),
    });
  
    const data = await res.json();
    let text = (data.text ?? "").trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```/, "")
      .replace(/```$/, "");

    const parsed: Ingredient[] = JSON.parse(text);
    setIngredients(parsed);
    setIngredientNames(parsed.map((i) => i.name.toLowerCase()));
    setRecipes([]); // clear any old results when a new image is analyzed
  };

  const handleRecipes = async () => {
    if (!ingredientNames.length) return;
    setLoading(true);
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: ingredientNames }), // or recipeIngredients if your API expects that
      });
      const json = await res.json();
      setRecipes(json.recipes ?? []);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setIngredients([]);
    setIngredientNames([]);
    setRecipes([]);
  }

  const hasIngredients = ingredients.length > 0;
  const hasRecipes = recipes.length > 0;

  return (
    
    <div className="min-h-screen bg-green-100 flex flex-col items-center p-6">
      <div className="absolute top-4 left-6">
        <h1 className=" px-4 py-4 text-xl font-bold rounded-lg text-left bg-purple-100 text-black">GitHealthy</h1>
      </div>
      <ImageCapture onAnalyze={handleAnalyze}onReset={handleReset}/>

      {hasIngredients && (
        <div className="text-sm p-4 rounded-lg mt-4 w-full max-w-md">
          <ul className="divide-y divide-gray-200">
            {ingredients.map((item, index) => (
              <li key={index} className="py-2 flex justify-between text-gray-700">
                <span>{item.name}</span>
                <span className="font-medium">confidence: {Math.round(item.confidence)}</span>
              </li>
            ))}
          </ul>

          <div className="flex justify-center py-6">
            <button
              className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60"
              onClick={handleRecipes}
              disabled={loading}
            >
              {loading ? "Fetching recipes..." : "Get Recipes 🍽️"}
            </button>
          </div>

          {hasRecipes && <RecipeList recipes={recipes} />}
        </div>
      )}
    </div>
  );
}
