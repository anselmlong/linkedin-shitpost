"use client";

import { useState, useRef } from "react";

interface InputPanelProps {
  onGenerate: (prompt: string, imageBase64: string | null, mimeType: string | null) => Promise<void>;
  isLoading: boolean;
}

export default function InputPanel({ onGenerate, isLoading }: InputPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = (ev.target?.result as string).split(",")[1];
      setImageBase64(base64);
      setImagePreview(ev.target?.result as string);
      setMimeType(file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    await onGenerate(prompt, imageBase64, mimeType);
  };

  const clearImage = () => {
    setImageBase64(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-200">
          What do you want to make fun of?
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. my coworker doesn't refactor anything, sprint planning meetings, linkedin humble brags about coffee..."
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-200">
          Optional: Add an image (meme, screenshot, etc.)
        </label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-gray-200 hover:file:bg-gray-700"
        />
        {imagePreview && (
          <div className="mt-3 relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-32 rounded-lg border border-gray-700"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-500"
            >
              ×
            </button>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || !prompt.trim()}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⚙</span>
            Generating shitposts...
          </span>
        ) : (
          "Generate LinkedIn Shitposts"
        )}
      </button>
    </form>
  );
}
