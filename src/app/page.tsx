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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full max-w-2xl space-y-4">
      {results.map((result, index) => (
        <ProviderCard
          key={index}
          match={result}
          index={index}
          onMatchRemoved={handleMatchRemoved}
          isRefreshing={refreshing}
        />
      ))}
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
    <div className="min-h-screen flex justify-center">
      <main className="flex flex-col gap-[32px] mt-10 items-center w-full max-w-4xl px-4">
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-4xl font-bold">Patient Match</h1>
          <button
            onClick={handleReset}
            disabled={isResetting}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (!isResetting) handleReset();
              }
            }}
            aria-label="Reset all patient match data and reload from databases"
            className={`mt-4 px-6 py-2 underline text-white rounded-md transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isResetting
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-900"
            }`}
          >
            {isResetting ? "Resetting..." : "Reset All Data"}
          </button>
        </div>
        <Suspense fallback={<LoadingSpinner />}>
          <ProviderMatchContent onReset={handleReset} />
        </Suspense>
      </main>
    </div>
  );
}
