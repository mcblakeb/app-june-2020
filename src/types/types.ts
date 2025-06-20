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

export interface PatientMatch {
  internal: Partial<InternalPatient>;
  external: Partial<ExternalPatient>;
  score: number;
}
