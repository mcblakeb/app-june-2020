import { promises as fs } from "fs";
import * as path from "path";

/**
 * Generic function to read a file as text.
 * @param filePath - The path to the file.
 * @returns The file contents as a string.
 */
export async function readFile(filePath: string): Promise<string> {
  const absolutePath = path.resolve(filePath);
  return fs.readFile(absolutePath, "utf-8");
}

/**
 * Reads the internal.csv file from the data directory.
 * @returns The contents of internal.csv as a string.
 */
export async function readInternalCsv(): Promise<string> {
  return readFile("data/internal.csv");
}

/**
 * Reads the external.csv file from the data directory.
 * @returns The contents of external.csv as a string.
 */
export async function readExternalCsv(): Promise<string> {
  return readFile("data/external.csv");
}
