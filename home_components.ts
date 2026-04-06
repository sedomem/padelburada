// components/HomeSearch.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomeSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/kortlar?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/kortlar");
    }
  }

  return (
    <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 bg-surface-high p-2 rounded-2xl">
        <div className="flex-1 flex items-center gap-3 px-4">
          <svg className="w-5 h-5 text-on-surface-variant flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Şehir, ilçe veya kort adı ara..."
            className="flex-1 bg-transparent text-on-surface placeholder:text-on-surface-variant outline-none text-base py-2"
          />
        </div>
        <button type="submit" className="btn-primary py-3 px-6 text-base whitespace-nowrap">
          Keşfet
        </button>
      </div>
    </form>
  );
}
