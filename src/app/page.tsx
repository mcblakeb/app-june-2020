"use client";

import { useState, useEffect, Suspense } from "react";
import { findAllPatientMatches, getProvidersFromFile } from "@/actions/query";
import {
  writeMatchesToCsv,
  checkFileEmpty,
  clearMatchesFile,
} from "@/actions/file-actions";
import { PatientMatch } from "@/types/types";
import ProviderCard from "@/components/provider-card";
import LoadingSpinner from "@/components/loading";

function ProviderMatchContent({ onReset }: { onReset: () => void }) {
  const [results, setResults] = useState<PatientMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterText, setFilterText] = useState("");

  const loadMatches = async () => {
    try {
      // Check if matches.csv is empty or doesn't exist, then generate and write to it
      const isEmpty = await checkFileEmpty();
      if (isEmpty) {
        const allMatches = await findAllPatientMatches();
        await writeMatchesToCsv(allMatches);
      }

      // Load matches from the matches.csv file
      const matchesFromFile = await getProvidersFromFile();
      setResults(matchesFromFile);
    } catch (error) {
      console.error("Error loading matches:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleMatchRemoved = async () => {
    // Set refreshing state and reload matches after a match is removed
    setRefreshing(true);
    await loadMatches();
  };

  useEffect(() => {
    loadMatches();
  }, []);

  // Filter results based on search text
  const filteredResults = results.filter((result) => {
    if (!filterText.trim()) return true;

    const searchTerm = filterText.toLowerCase();
    const internalName =
      `${result.internal.FirstName} ${result.internal.LastName}`.toLowerCase();
    const externalName =
      `${result.external.FirstName} ${result.external.LastName}`.toLowerCase();
    const internalId = result.internal.InternalPatientId?.toLowerCase() || "";
    const externalId = result.external.ExternalPatientId?.toLowerCase() || "";

    return (
      internalName.includes(searchTerm) ||
      externalName.includes(searchTerm) ||
      internalId.includes(searchTerm) ||
      externalId.includes(searchTerm)
    );
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full max-w-2xl space-y-4">
      {/* Filter and Reset Section */}
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Filter by name or ID..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-300">
            Showing {filteredResults.length} of {results.length} matches
          </div>
          <button
            onClick={onReset}
            className="text-sm underline text-white hover:text-gray-300 transition-colors"
          >
            Reset All Data
          </button>
        </div>
      </div>

      {/* Filtered results */}
      <div className="space-y-4">
        {filteredResults.map((result, index) => (
          <ProviderCard
            key={index}
            match={result}
            index={index}
            onMatchRemoved={handleMatchRemoved}
            isRefreshing={refreshing}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await clearMatchesFile();
      // Trigger a page reload to regenerate the matches
      window.location.reload();
    } catch (error) {
      console.error("Error resetting data:", error);
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen w-full">
      <main className="flex flex-col gap-[32px] mt-10 items-center w-full max-w-4xl mx-auto px-4">
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-4xl font-bold">Patient Match</h1>
        </div>
        <Suspense fallback={<LoadingSpinner />}>
          <ProviderMatchContent onReset={handleReset} />
        </Suspense>
      </main>
    </div>
  );
}
