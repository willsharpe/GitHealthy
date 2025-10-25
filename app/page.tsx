
"use client";


import Image from "next/image";
import analyzeIngredients from "./image";
import React, { useRef, useEffect, useState } from 'react';
import { GoogleGenAI } from "@google/genai/web";


export default function ImageCapture() {
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (e:React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(!file)return;
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if(!preview){
      return;
    }
    setLoading(true);
    setResult("");
    
    const base64 = preview.split(",");
    const res = await fetch("/api/analyze", {
      method:"POST",
      headers:{"Content-Type": "application/json"},
      body:JSON.stringify({base64,mimeType:"image/jpeg"}),
    });

    const json = await res.json();
    if(!res.ok){
      throw new Error(json?.error || "API Error");
    }
    setResult(json.text);
  }




  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <h2 className="text-xl font-semibold mb-2">Ingredient Identifier 🍳</h2>

      {!preview && (
        <div className="flex gap-4">
          <button
            onClick={analyzeImage}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Take Photo
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Upload Image
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
        </div>
      )}

      {preview && (
        <>
          <img
            src={preview}
            alt="Preview"
            className="w-80 rounded-2xl shadow-md object-cover"
          />

          <div className="flex gap-4">
            <button
              onClick={() => setPreview(null)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Retake
            </button>
            <button
              onClick={analyzeImage}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60"
            >
              {loading ? "Analyzing..." : "Analyze Image"}
            </button>
          </div>
        </>
      )}

      {result && (
        <pre className="bg-gray-100 text-sm p-4 rounded-lg mt-4 w-full max-w-md overflow-auto">
          {result}
        </pre>
      )}
    </div>
  );
}
