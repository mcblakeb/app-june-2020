"use server";

import { getInternalPatients, getExternalPatients } from "../util/datastore";
import { InternalPatient, ExternalPatient, PatientMatch } from "../types/types";
import { similarityRatio, tokenOverlapScore } from "../util/l-distance";

function normalize(str?: string): string {
  // Remove non-alphanumeric characters and convert to lowercase
  return (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

const SearchFields = [
  "FirstName",
  "LastName",
  "DOB",
  "PhoneNumber",
  "Address",
  "City",
  "ZipCode",
];

function matchesQuery(
  patient: Partial<InternalPatient> | Partial<ExternalPatient>,
  query: string
): boolean {
  const normalizedQuery = normalize(query);

  // First check name fields with higher priority
  const firstName = normalize(patient.FirstName || "");
  const lastName = normalize(patient.LastName || "");

  // Check if query matches first or last name exactly or as substring
  if (
    firstName.includes(normalizedQuery) ||
    lastName.includes(normalizedQuery)
  ) {
    return true;
  }

  // Check if query is similar to names using similarity functions
  if (
    similarityRatio(firstName, normalizedQuery) > 0.7 ||
    similarityRatio(lastName, normalizedQuery) > 0.7
  ) {
    return true;
  }

  // For other fields, be more strict - only check if the field contains the query
  // and the field is reasonably sized (avoid matching in long addresses)
  for (const key of ["DOB", "PhoneNumber", "City", "ZipCode"]) {
    const value = (patient as any)[key];
    if (value) {
      const normalizedValue = normalize(value);
      // Only check if the field contains the query, not the other way around
      if (normalizedValue.includes(normalizedQuery)) {
        return true;
      }
    }
  }

  // For address, be more careful - only match if it's a reasonable match
  const address = normalize(patient.Address || "");
  if (address.includes(normalizedQuery) && address.length < 50) {
    return true;
  }

  return false;
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
  const dobMatch = normalize(internal.DOB) === normalize(external.DOB);
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
  external: Partial<ExternalPatient>,
  query: string
): number {
  let score = 0;
  const normalizedQuery = normalize(query);

  // Check if query matches either patient
  let queryMatchScore = 0;
  for (const key of SearchFields) {
    const internalValue = (internal as any)[key];
    const externalValue = (external as any)[key];

    if (internalValue) {
      const normalizedValue = normalize(internalValue);
      if (normalizedValue === normalizedQuery)
        queryMatchScore = Math.max(queryMatchScore, 1.0);
      else if (
        normalizedValue.includes(normalizedQuery) ||
        normalizedQuery.includes(normalizedValue)
      ) {
        queryMatchScore = Math.max(queryMatchScore, 0.8);
      } else if (similarityRatio(normalizedValue, normalizedQuery) > 0.7) {
        queryMatchScore = Math.max(queryMatchScore, 0.6);
      } else if (tokenOverlapScore(normalizedValue, normalizedQuery) > 0.5) {
        queryMatchScore = Math.max(queryMatchScore, 0.4);
      }
    }

    if (externalValue) {
      const normalizedValue = normalize(externalValue);
      if (normalizedValue === normalizedQuery)
        queryMatchScore = Math.max(queryMatchScore, 1.0);
      else if (
        normalizedValue.includes(normalizedQuery) ||
        normalizedQuery.includes(normalizedValue)
      ) {
        queryMatchScore = Math.max(queryMatchScore, 0.8);
      } else if (similarityRatio(normalizedValue, normalizedQuery) > 0.7) {
        queryMatchScore = Math.max(queryMatchScore, 0.6);
      } else if (tokenOverlapScore(normalizedValue, normalizedQuery) > 0.5) {
        queryMatchScore = Math.max(queryMatchScore, 0.4);
      }
    }
  }

  // Calculate patient match score
  let patientMatchScore = 0;
  const firstNameMatch =
    normalize(internal.FirstName) === normalize(external.FirstName);
  const lastNameMatch =
    normalize(internal.LastName) === normalize(external.LastName);
  const dobMatch = normalize(internal.DOB) === normalize(external.DOB);
  const phoneMatch =
    normalize(internal.PhoneNumber) === normalize(external.PhoneNumber) &&
    internal.PhoneNumber !== "";
  const addressMatch =
    normalize(internal.Address) === normalize(external.Address);

  if (firstNameMatch && lastNameMatch) patientMatchScore = 1.0;
  else if (dobMatch && lastNameMatch) patientMatchScore = 0.9;
  else if (phoneMatch) patientMatchScore = 0.8;
  else if (addressMatch) patientMatchScore = 0.7;
  else {
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

    if (firstNameSimilarity > 0.8 && lastNameSimilarity > 0.8)
      patientMatchScore = 0.6;
    else if (addressSimilarity > 0.7 && lastNameSimilarity > 0.7)
      patientMatchScore = 0.5;
  }

  // Combine scores (query match is more important)
  score = queryMatchScore * 0.7 + patientMatchScore * 0.3;

  return score;
}

/**
 * Finds up to 5 likely patient matches based on a user query string.
 * @param query - The user input string to match against patient fields.
 * @returns Up to 5 best matches with details.
 */
export async function findLikelyPatientMatches(
  query: string
): Promise<PatientMatch[]> {
  const [internalPatients, externalPatients] = await Promise.all([
    getInternalPatients(),
    getExternalPatients(),
  ]);
  const matches: PatientMatch[] = [];

  for (const internal of internalPatients) {
    if (!matchesQuery(internal, query)) {
      continue;
    }

    for (const external of externalPatients) {
      if (arePatientsAMatch(internal, external)) {
        const score = calculateMatchScore(internal, external, query);
        matches.push({ internal, external, score });
        if (matches.length >= 10) break; // Get more candidates before sorting
      }
    }
  }

  // Sort by score descending and return top 5
  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, 5);
}
