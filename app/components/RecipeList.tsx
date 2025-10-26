"use client";
import { useState } from "react";

type Recipe = { id: number; title: string; image: string };

export default function RecipeList({ recipes }: { recipes: Recipe[] }) {
  const [loading, setLoading] = useState(false);
  const [recipeInfo, setRecipeInfo] = useState<Record<number, any> | null>(null); // Store info per recipe

  const handleRecipeInfo = async (id: number) => {
    try {
      setLoading(true);

      const res = await fetch("/api/recipeInfo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const json = await res.json();

      // Keep info specific to this recipe
      setRecipeInfo((prev) => ({
        ...prev,
        [id]: json.info,
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 w-full max-w-md">
      <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">
        Suggested Meals 🍕
      </h3>

      <ul className="grid gap-6">
        {recipes.map((recipe) => (
          <li
            key={recipe.id}
            className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-4 shadow-md border border-gray-300 hover:shadow-lg transition-all duration-200"
          >
            {/* Recipe image */}
            <img
              src={recipe.image}
              alt={recipe.title}
              className="rounded-xl mb-3 w-full object-cover border border-gray-300"
            />

            {/* Recipe title */}
            <p className="font-semibold text-gray-800 text-center text-lg mb-2">
              {recipe.title}
            </p>

            {/* View info button */}
            <button
              onClick={() => handleRecipeInfo(recipe.id)}
              disabled={loading}
              className="w-full bg-gray-800 text-white py-2 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-60 transition-all"
            >
              {loading ? "Loading..." : "View Health Info"}
            </button>

            {/* Recipe Info (specific to each card) */}
            {recipeInfo?.[recipe.id] && (
              <div className="mt-4 bg-white/70 backdrop-blur-md border border-gray-300 rounded-xl p-4 text-gray-800 shadow-inner transition-all">
                <h4 className="font-bold text-lg mb-2 text-gray-900">
                  {recipeInfo[recipe.id].title}
                </h4>

                {"healthScore" in recipeInfo[recipe.id] && (
                  <p className="text-sm text-gray-700">
                    🩺 <span className="font-semibold">Health Score:</span>{" "}
                    {recipeInfo[recipe.id].healthScore}
                  </p>
                )}

                {"readyInMinutes" in recipeInfo[recipe.id] && (
                  <p className="text-sm text-gray-700">
                    ⏱️ Ready in {recipeInfo[recipe.id].readyInMinutes} min
                  </p>
                )}

                {"servings" in recipeInfo[recipe.id] && (
                  <p className="text-sm text-gray-700">
                    🍽️ Servings: {recipeInfo[recipe.id].servings}
                  </p>
                )}

                {recipeInfo[recipe.id]?.nutrition && (
                  <p className="text-sm text-gray-700">
                    🔥 Calories:{" "}
                    {
                      recipeInfo[recipe.id].nutrition?.nutrients?.find(
                        (n: any) => n.name === "Calories"
                      )?.amount
                    }
                  </p>
                )}

                {recipeInfo[recipe.id]?.sourceUrl && (
                  <a
                    href={recipeInfo[recipe.id].sourceUrl}
                    target="_blank"
                    className="block text-center mt-3 text-sm text-blue-600 font-medium hover:underline"
                  >
                    Full Recipe ↗
                  </a>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
