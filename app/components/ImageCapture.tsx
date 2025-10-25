"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import {Commet} from "react-loading-indicators";

type AnalyzePayload = { base64: string; mimeType: string };
type Props = { onAnalyze: (data: AnalyzePayload) => Promise<void> | void,
  onReset?:()=> void;} // make it required

export default function ImageCapture({
  onAnalyze,
  onReset,
}: {
  onAnalyze:(data:{base64:string;mimeType:string}) => void;
  onReset?: () => void;

}) {
 
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // Handle file upload or camera capture
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };


  const handleRetake = () => {
    setPreview(null);
    onReset?.();
  }

  // Convert preview to base64 and pass up to parent
  const analyzeImage = async () => {
    if (!preview) return;
    setLoading(true);
    try {
      const [prefix, base64] = preview.split(",");
      const mimeType = prefix.match(/data:(.*);base64/)?.[1] ?? "image/jpeg";
      const ingredients = await onAnalyze({ base64, mimeType });
    } catch (err) {
      console.error(err);
      alert("Error analyzing image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      
      {!preview && (
        <>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Take or Upload Photo
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFile}
            className="hidden"
          />
        </>
      )}

      {preview && (
        <>
          <Image
            src={preview}
            alt="Preview"
            width={320}
            height={240}
            className="rounded-xl object-cover shadow-md"
          />
          <div className="flex gap-3">
            <button
              onClick={handleRetake}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Retake
            </button>
            <button
              onClick={analyzeImage}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60"
            >
              Analyze Image
            </button>
          </div>
          {loading && (
            <div className="flex justify-center items-center mt-6">
              <Commet color="#32cd32" size="medium" text="" textColor="" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
