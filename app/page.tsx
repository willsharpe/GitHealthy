"use client";

import ImageCapture from "./components/ImageCapture";
import RecipeList from "./components/RecipeList";
import { useState } from "react";

type Ingredient = { name: string; confidence: number };
type Recipe = { id: number; title: string; image: string };

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
    let text = (data.text ?? "")
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```/, "")
      .replace(/```$/, "");

    const parsed: Ingredient[] = JSON.parse(text);
    setIngredients(parsed);
    setIngredientNames(parsed.map((i) => i.name.toLowerCase()));
    setRecipes([]);
  };

  const handleRecipes = async () => {
    if (!ingredientNames.length) return;
    setLoading(true);
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: ingredientNames }),
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
  };

  const hasIngredients = ingredients.length > 0;
  const hasRecipes = recipes.length > 0;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-300 text-gray-900 flex flex-col items-center p-6 relative">
      {/* Top header */}
      <header className="absolute top-6 left-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-800">GitHealthy</h1>
        <p className="text-sm text-gray-500 font-medium ml-1">AI-Powered Nutrition & Recipes</p>
      </header>

      {/* Center content */}
      <main className="flex flex-col items-center justify-center mt-24 w-full max-w-2xl">
        <div className="bg-white/70 backdrop-blur-lg shadow-lg border border-gray-200 rounded-2xl p-8 w-full">
          <ImageCapture onAnalyze={handleAnalyze} onReset={handleReset} />

          {/* Ingredients list */}
          {hasIngredients && (
            <div className="mt-6 bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold mb-2 text-gray-800">Detected Ingredients 🥬</h2>
              <ul className="divide-y divide-gray-300">
                {ingredients.map((item, index) => (
                  <li
                    key={index}
                    className="py-2 flex justify-between text-gray-700 font-medium"
                  >
                    <span>{item.name}</span>
                    <span className="text-sm text-gray-500">
                      confidence: {Math.round(item.confidence)}%
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex justify-center pt-6">
                <button
                  className="px-6 py-2 rounded-lg bg-gray-800 text-white font-semibold hover:bg-gray-700 disabled:opacity-60 transition-all"
                  onClick={handleRecipes}
                  disabled={loading}
                >
                  {loading ? "Fetching recipes..." : "Get Recipes 🍽️"}
                </button>
              </div>

              {/* Recipes */}
              {hasRecipes && <RecipeList recipes={recipes} />}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-4 text-gray-500 text-xs">
        © {new Date().getFullYear()} GitHealthy — Made with ❤️ using Gemini Vision API
      </footer>
    </div>
  );
}
