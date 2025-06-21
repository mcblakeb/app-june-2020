export interface InternalPatient {
  InternalPatientId: string;
  FirstName: string;
  LastName: string;
  DOB: string;
  Sex: string;
  PhoneNumber: string;
  Address: string;
  City: string;
  ZipCode: string;
}

export interface ExternalPatient {
  ExternalPatientId: string;
  FirstName: string;
  LastName: string;
  DOB: string;
  Sex: string;
  PhoneNumber: string;
  Address: string;
  City: string;
  ZipCode: string;
}

export type MatchStatus = 0 | 1 | 2;

export const MatchStatusLabels: Record<MatchStatus, string> = {
  0: "None",
  1: "Approved",
  2: "Denied",
};

export interface PatientMatch {
  internal: Partial<InternalPatient>;
  external: Partial<ExternalPatient>;
  score: number;
  status?: MatchStatus;
}
