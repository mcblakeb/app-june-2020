import { readInternalCsv, readExternalCsv } from "./file-util";
import { InternalPatient, ExternalPatient } from "../types/types";

/**
 * Parses a CSV string into an array of objects of the given type.
 */
function parseCsv<T>(csv: string): T[] {
  const [headerLine, ...lines] = csv.trim().split("\n");
  const headers = headerLine.split(",");

  return lines.map((line) => {
    const values = line.split(",");
    const obj: any = {};
    headers.forEach((header, i) => {
      obj[header] = values[i];
    });
    return obj as T;
  });
}

let internalPatientsCache: Partial<InternalPatient>[] | null = null;
let externalPatientsCache: Partial<ExternalPatient>[] | null = null;

/**
 * Reads and parses internal.csv into InternalPatient[]
 */
export async function getInternalPatients(): Promise<
  Partial<InternalPatient>[]
> {
  if (!internalPatientsCache) {
    const csv = await readInternalCsv();
    internalPatientsCache = parseCsv<InternalPatient>(csv);
  }
  return internalPatientsCache;
}

/**
 * Reads and parses external.csv into ExternalPatient[]
 */
export async function getExternalPatients(): Promise<
  Partial<ExternalPatient>[]
> {
  if (!externalPatientsCache) {
    const csv = await readExternalCsv();
    externalPatientsCache = parseCsv<ExternalPatient>(csv);
  }
  return externalPatientsCache;
}
