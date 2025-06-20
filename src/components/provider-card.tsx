import { PatientMatch } from "@/types/types";

interface ProviderCardProps {
  match: PatientMatch;
  index: number;
}

export default function ProviderCard({ match, index }: ProviderCardProps) {
  const { internal, external, score } = match;

  const formatScore = (score: number) => {
    return Math.round(score * 100);
  };

  const formatPhone = (phone: string) => {
    if (!phone) return "N/A";
    return phone;
  };

  const formatAddress = (address: string, city: string, zip: string) => {
    return `${address}, ${city} ${zip}`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
            #{index + 1}
          </span>
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
            {formatScore(score)}% Match
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Internal Patient */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 text-sm">
            Internal Patient
          </h3>
          <div className="text-sm space-y-1">
            <p className="font-bold text-black">
              {internal.FirstName} {internal.LastName}
            </p>
            <p className="text-gray-600">ID: {internal.InternalPatientId}</p>
            <p className="text-gray-600">DOB: {internal.DOB}</p>
            <p className="text-gray-600">
              Phone: {formatPhone(internal.PhoneNumber || "")}
            </p>
            <p className="text-gray-600 text-xs">
              {formatAddress(
                internal.Address || "",
                internal.City || "",
                internal.ZipCode || ""
              )}
            </p>
          </div>
        </div>

        {/* External Patient */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 text-sm">
            External Patient
          </h3>
          <div className="text-sm space-y-1">
            <p className="font-bold text-black">
              {external.FirstName} {external.LastName}
            </p>
            <p className="text-gray-600">ID: {external.ExternalPatientId}</p>
            <p className="text-gray-600">DOB: {external.DOB}</p>
            <p className="text-gray-600">
              Phone: {formatPhone(external.PhoneNumber || "")}
            </p>
            <p className="text-gray-600 text-xs">
              {formatAddress(
                external.Address || "",
                external.City || "",
                external.ZipCode || ""
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
