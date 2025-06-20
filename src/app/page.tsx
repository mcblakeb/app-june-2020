"use client";

import { useState } from "react";
import { findLikelyPatientMatches } from "@/actions/query";
import { PatientMatch } from "@/types/types";
import ProviderCard from "@/components/provider-card";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PatientMatch[]>([]);

  const handleQueryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    if (newQuery.length > 2) {
      const searchResults = await findLikelyPatientMatches(newQuery);
      setResults(searchResults);
      console.log(searchResults);
    } else {
      setResults([]);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-4xl">
        <h1 className="text-4xl font-bold">Provider Match</h1>
        <div className="w-full max-w-2xl">
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search for patients..."
            className="w-full p-3 border border-gray-300 rounded-md text-lg"
          />
        </div>
        <div className="w-full max-w-2xl space-y-4">
          {results.map((result, index) => (
            <ProviderCard key={index} match={result} index={index} />
          ))}
        </div>
      </main>
    </div>
  );
}
