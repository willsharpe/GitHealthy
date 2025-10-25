"use client";
import { useState } from "react";

type Recipe = { id: number; title: string; image: string };

export default function RecipeList({ recipes }: { recipes: Recipe[] }) {
  const [loading, setLoading] = useState(false);
  const [recipeInfo, setRecipeInfo] = useState<any | null>(null);

  const handleRecipeInfo = async (id: number) => {
    try {
      setLoading(true);
      setRecipeInfo(null);
      const res = await fetch("/api/recipeInfo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      setRecipeInfo(json.info);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 w-full max-w-md">
      <h3 className="text-lg font-semibold mb-2 text-center">Suggested Meals 🍕</h3>

      <ul className="grid gap-4">
        {recipes.map((recipe) => (
          <li key={recipe.id} className="bg-white p-3 rounded-lg shadow-sm">
            <img
              src={recipe.image}
              alt={recipe.title}
              className="rounded-lg mb-2 w-full object-cover"
            />
            <p className="font-medium text-gray-800 text-center">{recipe.title}</p>
            <button
              onClick={() => handleRecipeInfo(recipe.id)}
              disabled={loading}
              className="w-full bg-green-600 text-white py-1 rounded-md hover:bg-green-700 disabled:opacity-60 mt-2"
            >
              {loading ? "Loading..." : "View Health Info"}
            </button>
          </li>
        ))}
      </ul>

      {recipeInfo && (
        <div className="mt-6 bg-gray-50 p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold mb-2">{recipeInfo.title}</h4>
          {"healthScore" in recipeInfo && <p>Health Score: {recipeInfo.healthScore}</p>}
          {"readyInMinutes" in recipeInfo && <p>Ready in {recipeInfo.readyInMinutes} minutes</p>}
          {"servings" in recipeInfo && <p>Servings: {recipeInfo.servings}</p>}
          {recipeInfo?.nutrition && (
            <p>
              Calories: {
                recipeInfo.nutrition?.nutrients?.find((n: any) => n.name === "Calories")?.amount
              }
            </p>
          )}
          {recipeInfo?.sourceUrl && (
            <a href={recipeInfo.sourceUrl} target="_blank" className="text-blue-600 underline">
              Full Recipe ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
}
