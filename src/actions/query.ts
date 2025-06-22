"use server";

import { getInternalPatients, getExternalPatients } from "../util/datastore";
import {
  InternalPatient,
  ExternalPatient,
  PatientMatch,
  MatchStatus,
} from "../types/types";
import { similarityRatio, tokenOverlapScore } from "../util/l-distance";
import { readAllMatches } from "@/actions/file-actions";
import { normalizeDate } from "@/util/date";

function normalize(str?: string): string {
  // Remove non-alphanumeric characters and convert to lowercase
  return (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function arePatientsAMatch(
  internal: Partial<InternalPatient>,
  external: Partial<ExternalPatient>
): boolean {
  // Exact matches
  const firstNameMatch =
    normalize(internal.FirstName) === normalize(external.FirstName);
  const lastNameMatch =
    normalize(internal.LastName) === normalize(external.LastName);
  const dobMatch = normalizeDate(internal.DOB) === normalizeDate(external.DOB);
  const phoneMatch =
    normalize(internal.PhoneNumber) === normalize(external.PhoneNumber) &&
    internal.PhoneNumber !== "";
  const addressMatch =
    normalize(internal.Address) === normalize(external.Address);

  // Fuzzy matches using similarity functions
  const firstNameSimilarity = similarityRatio(
    normalize(internal.FirstName || ""),
    normalize(external.FirstName || "")
  );
  const lastNameSimilarity = similarityRatio(
    normalize(internal.LastName || ""),
    normalize(external.LastName || "")
  );
  const addressSimilarity = similarityRatio(
    normalize(internal.Address || ""),
    normalize(external.Address || "")
  );

  // First check: if names have no similarity and DOB doesn't match, return false
  // This is a custom rule I added based on looking at the results
  if ((firstNameSimilarity === 0 || lastNameSimilarity === 0) && !dobMatch) {
    return false;
  }

  return (
    (firstNameMatch && lastNameMatch) ||
    (dobMatch && lastNameMatch) ||
    phoneMatch ||
    addressMatch ||
    (firstNameSimilarity > 0.8 && lastNameSimilarity > 0.8) ||
    (addressSimilarity > 0.7 && lastNameSimilarity > 0.7)
  );
}

function calculateMatchScore(
  internal: Partial<InternalPatient>,
  external: Partial<ExternalPatient>
): number {
  // Calculate exact matches
  const firstNameMatch =
    normalize(internal.FirstName) === normalize(external.FirstName);
  const lastNameMatch =
    normalize(internal.LastName) === normalize(external.LastName);
  const dobMatch = normalizeDate(internal.DOB) === normalizeDate(external.DOB);
  const phoneMatch =
    normalize(internal.PhoneNumber) === normalize(external.PhoneNumber) &&
    internal.PhoneNumber !== "";
  const addressMatch =
    normalize(internal.Address) === normalize(external.Address);

  // Calculate similarity ratios for all fields
  const firstNameSimilarity = similarityRatio(
    normalize(internal.FirstName || ""),
    normalize(external.FirstName || "")
  );
  const lastNameSimilarity = similarityRatio(
    normalize(internal.LastName || ""),
    normalize(external.LastName || "")
  );
  const addressSimilarity = similarityRatio(
    normalize(internal.Address || ""),
    normalize(external.Address || "")
  );
  const addressTokenOverlap = tokenOverlapScore(
    normalize(internal.Address || ""),
    normalize(external.Address || "")
  );

  const combinedAddressScore = (addressSimilarity + addressTokenOverlap) / 2;

  // Calculate weighted score based on all available data
  let totalScore = 0;
  let totalWeight = 0;

  totalScore += (firstNameMatch ? 1.0 : firstNameSimilarity) * 0.15;
  totalWeight += 0.15;

  totalScore += (lastNameMatch ? 1.0 : lastNameSimilarity) * 0.25;
  totalWeight += 0.25;

  totalScore += (dobMatch ? 1.0 : 0.0) * 0.25;
  totalWeight += 0.25;

  totalScore += (phoneMatch ? 1.0 : 0.0) * 0.2;
  totalWeight += 0.2;

  totalScore += (addressMatch ? 1.0 : combinedAddressScore) * 0.15;
  totalWeight += 0.15;

  // Calculate final score as weighted average
  const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;

  // Apply bonus for multiple exact matches
  let bonus = 0;
  const exactMatches = [
    firstNameMatch,
    lastNameMatch,
    dobMatch,
    phoneMatch,
    addressMatch,
  ].filter(Boolean).length;

  // Only apply bonus if firstNameMatch is true
  if ((firstNameMatch || lastNameMatch) && exactMatches >= 3) {
    bonus = 0.1;
  } else if ((firstNameMatch || lastNameMatch) && exactMatches >= 2) {
    bonus = 0.05;
  }

  // Apply bonus as a percentage of remaining possible score
  const remainingScore = 1.0 - finalScore;
  const bonusAmount = remainingScore * bonus;

  return Math.min(1.0, finalScore + bonusAmount);
}

/**
 * Finds all likely patient matches between internal and external databases.
 * @returns All matches found between internal and external patients.
 */
export async function findAllPatientMatches(): Promise<PatientMatch[]> {
  const [internalPatients, externalPatients] = await Promise.all([
    getInternalPatients(),
    getExternalPatients(),
  ]);
  const matches: PatientMatch[] = [];

  for (const internal of internalPatients) {
    for (const external of externalPatients) {
      if (arePatientsAMatch(internal, external)) {
        const score = calculateMatchScore(internal, external);
        matches.push({ internal, external, score });
      }
    }
  }

  // Sort by score descending
  matches.sort((a, b) => b.score - a.score);
  return matches;
}

/**
 * Gets full PatientMatch objects from the matches.csv file by reading IDs and fetching patient data
 * @returns Array of complete PatientMatch objects with full patient data
 */
export async function getPatientsFromFile(): Promise<PatientMatch[]> {
  try {
    // Read the match records from CSV
    const matchRecords = await readAllMatches();

    if (matchRecords.length === 0) {
      return [];
    }

    // Get all patient data
    const [internalPatients, externalPatients] = await Promise.all([
      getInternalPatients(),
      getExternalPatients(),
    ]);

    // Create lookup maps for efficient searching
    const internalMap = new Map(
      internalPatients.map((patient) => [patient.InternalPatientId, patient])
    );
    const externalMap = new Map(
      externalPatients.map((patient) => [patient.ExternalPatientId, patient])
    );

    // Build complete PatientMatch objects
    const fullMatches: PatientMatch[] = [];

    for (const record of matchRecords) {
      const internal = internalMap.get(record.InternalPatientId);
      const external = externalMap.get(record.ExternalPatientId);

      if (internal && external) {
        const match: PatientMatch = {
          internal,
          external,
          score: calculateMatchScore(internal, external), // Recalculate the score
          status: record.Status ? (parseInt(record.Status) as MatchStatus) : 0,
        };

        fullMatches.push(match);
      } else {
        console.warn(
          `Missing patient data for match: ${record.InternalPatientId} - ${record.ExternalPatientId}`
        );
      }
    }

    // Sort by score descending
    fullMatches.sort((a, b) => b.score - a.score);

    return fullMatches;
  } catch (error) {
    console.error("Error getting patients from file:", error);
    return [];
  }
}
