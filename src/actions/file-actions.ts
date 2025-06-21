"use server";

import { promises as fs } from "fs";
import { PatientMatch } from "@/types/types";

/**
 * Checks if the matches.csv file is empty or doesn't exist
 * @returns true if file is empty or doesn't exist, false otherwise
 */
export async function checkFileEmpty(): Promise<boolean> {
  try {
    const stats = await fs.stat("data/matches.csv");
    return stats.size === 0;
  } catch (fileError) {
    // File doesn't exist
    return true;
  }
}

/**
 * Completely erases the content of the matches.csv file
 */
export async function clearMatchesFile(): Promise<void> {
  try {
    await fs.writeFile("data/matches.csv", "", "utf-8");
  } catch (error) {
    console.error("Error clearing matches.csv file:", error);
    throw error;
  }
}

/**
 * Writes patient matches to matches.csv
 * @param matches - Array of patient matches
 */
export async function writeMatchesToCsv(
  matches: PatientMatch[]
): Promise<void> {
  // Create CSV content
  const csvHeader = "ExternalPatientId,InternalPatientId,Status\n";
  const csvRows = matches
    .map(
      (match) =>
        `${match.external.ExternalPatientId},${match.internal.InternalPatientId},0`
    )
    .join("\n");

  const csvContent = csvHeader + csvRows;

  // Write to file
  await fs.writeFile("data/matches.csv", csvContent, "utf-8");
}

interface MatchRecord {
  ExternalPatientId: string;
  InternalPatientId: string;
  Status?: string;
}

/**
 * Reads all matches from the matches.csv file
 * @returns Array of match records with ExternalPatientId, InternalPatientId, and optional Status
 */
export async function readAllMatches(): Promise<MatchRecord[]> {
  try {
    const fileContent = await fs.readFile("data/matches.csv", "utf-8");
    const lines = fileContent.trim().split("\n");

    if (lines.length <= 1) {
      return []; // Only header or empty file
    }

    const header = lines[0].split(",");
    const hasStatus = header.includes("Status");

    const matches: MatchRecord[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      const values = line.split(",");
      const match: MatchRecord = {
        ExternalPatientId: values[0] || "",
        InternalPatientId: values[1] || "",
      };

      if (hasStatus && values[2]) {
        match.Status = values[2];
      }

      matches.push(match);
    }

    return matches;
  } catch (error) {
    console.error("Error reading matches.csv file:", error);
    return [];
  }
}

/**
 * Removes a specific match line from the matches.csv file
 * @param externalPatientId - The external patient ID to match
 * @param internalPatientId - The internal patient ID to match
 */
export async function removeMatchFromCsv(
  externalPatientId: string,
  internalPatientId: string
): Promise<void> {
  try {
    const fileContent = await fs.readFile("data/matches.csv", "utf-8");
    const lines = fileContent.trim().split("\n");

    if (lines.length <= 1) {
      console.log(
        "No matches to remove - file is empty or only contains header"
      );
      return;
    }

    const header = lines[0];
    const dataLines = lines.slice(1);

    // Filter out the line that matches both IDs
    const filteredLines = dataLines.filter((line) => {
      const values = line.split(",");
      const lineExternalId = values[0] || "";
      const lineInternalId = values[1] || "";

      const shouldKeep = !(
        lineExternalId === externalPatientId &&
        lineInternalId === internalPatientId
      );

      return shouldKeep;
    });

    // Reconstruct the file content
    const newContent = [header, ...filteredLines].join("\n");

    // Write back to file
    await fs.writeFile("data/matches.csv", newContent, "utf-8");
  } catch (error) {
    console.error("Error removing match from matches.csv file:", error);
    throw error;
  }
}

/**
 * Updates the status of a specific match from 0 to 1 in the matches.csv file
 * @param externalPatientId - The external patient ID to match
 * @param internalPatientId - The internal patient ID to match
 */
export async function acceptMatchInCsv(
  externalPatientId: string,
  internalPatientId: string
): Promise<void> {
  try {
    console.log(
      `Attempting to accept match: ${externalPatientId} - ${internalPatientId}`
    );

    const fileContent = await fs.readFile("data/matches.csv", "utf-8");
    const lines = fileContent.trim().split("\n");

    if (lines.length <= 1) {
      return;
    }

    const header = lines[0];
    const dataLines = lines.slice(1);

    // Update the line that matches both IDs
    const updatedLines = dataLines.map((line) => {
      const values = line.split(",");
      const lineExternalId = values[0] || "";
      const lineInternalId = values[1] || "";

      if (
        lineExternalId === externalPatientId &&
        lineInternalId === internalPatientId
      ) {
        // Update status from 0 to 1
        return `${lineExternalId},${lineInternalId},1`;
      }

      return line;
    });

    // Reconstruct the file content
    const newContent = [header, ...updatedLines].join("\n");

    // Write back to file
    await fs.writeFile("data/matches.csv", newContent, "utf-8");
  } catch (error) {
    console.error("Error accepting match in matches.csv file:", error);
    throw error;
  }
}
