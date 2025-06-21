import { PatientMatch } from "@/types/types";
import AcceptButton from "./accept-button";
import DenyButton from "./deny-button";
import { removeMatchFromCsv, acceptMatchInCsv } from "@/actions/file-actions";
import { useState } from "react";
import MatchIndicator from "./match-indicator";

interface ProviderCardProps {
  match: PatientMatch;
  index: number;
  onMatchRemoved?: () => void;
  isRefreshing?: boolean;
}

export default function ProviderCard({
  match,
  index,
  onMatchRemoved,
  isRefreshing = false,
}: ProviderCardProps) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDenying, setIsDenying] = useState(false);
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

  const normalize = (str?: string): string => {
    return (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  };

  const normalizeDate = (dateStr?: string): string => {
    if (!dateStr) return "";

    const normalized = dateStr.trim();

    const monthNames: { [key: string]: string } = {
      jan: "01",
      feb: "02",
      mar: "03",
      apr: "04",
      may: "05",
      jun: "06",
      jul: "07",
      aug: "08",
      sep: "09",
      oct: "10",
      nov: "11",
      dec: "12",
    };

    const pattern1 = /^(\d{1,2})-([a-zA-Z]{3})-(\d{2,4})$/;
    const match1 = normalized.match(pattern1);

    if (match1) {
      const day = match1[1].padStart(2, "0");
      const month = monthNames[match1[2].toLowerCase()];
      let year = match1[3];

      if (year.length === 2) {
        year = parseInt(year) < 50 ? `20${year}` : `19${year}`;
      }

      return `${year}-${month}-${day}`;
    }

    const pattern2 = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
    const match2 = normalized.match(pattern2);

    if (match2) {
      const year = match2[1];
      const month = match2[2].padStart(2, "0");
      const day = match2[3].padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    return normalized;
  };

  const isExactMatch = (
    field: string,
    internalValue?: string,
    externalValue?: string
  ): boolean => {
    if (field === "dob") {
      return normalizeDate(internalValue) === normalizeDate(externalValue);
    }
    return normalize(internalValue) === normalize(externalValue);
  };

  const handleApprove = async () => {
    try {
      setIsAccepting(true);

      // Ensure both IDs exist before proceeding
      if (!external.ExternalPatientId || !internal.InternalPatientId) {
        console.error("Cannot approve match: missing patient IDs");
        return;
      }

      await acceptMatchInCsv(
        external.ExternalPatientId,
        internal.InternalPatientId
      );

      // Call the callback to refresh the data
      if (onMatchRemoved) {
        onMatchRemoved();
      }
    } catch (error) {
      console.error("Error approving match:", error);
      // You might want to show a toast notification here
    } finally {
      // Don't reset the loading state here - let it persist until data refresh is complete
    }
  };

  const handleDeny = async () => {
    try {
      setIsDenying(true);
      if (!external.ExternalPatientId || !internal.InternalPatientId) {
        console.error("Cannot deny match: missing patient IDs");
        return;
      }

      await removeMatchFromCsv(
        external.ExternalPatientId,
        internal.InternalPatientId
      );

      // Call the callback to refresh the data
      if (onMatchRemoved) {
        onMatchRemoved();
      }
    } catch (error) {
      console.error("Error denying match:", error);
      // You might want to show a toast notification here
    } finally {
      // Don't reset the loading state here - let it persist until data refresh is complete
    }
  };

  // Reset loading states when data refresh is complete
  if (!isRefreshing && (isAccepting || isDenying)) {
    setIsAccepting(false);
    setIsDenying(false);
  }

  const isLoading = isAccepting || isDenying || isRefreshing;

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 ${
        isLoading ? "opacity-60 pointer-events-none" : ""
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
            #{index + 1}
          </span>
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
            {formatScore(score)}% Match
          </span>
        </div>
        <div className="flex items-center gap-2">
          <AcceptButton
            onClick={handleApprove}
            disabled={match.status === 1 || isLoading}
          />
          {match.status !== 1 && (
            <DenyButton onClick={handleDeny} disabled={isLoading} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Internal Patient */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 text-sm">
            Internal Patient
          </h3>
          <div className="text-sm space-y-1">
            <p className="font-bold text-black flex items-center">
              {internal.FirstName} {internal.LastName}
              <MatchIndicator
                isMatch={isExactMatch(
                  "name",
                  `${internal.FirstName} ${internal.LastName}`,
                  `${external.FirstName} ${external.LastName}`
                )}
              />
            </p>
            <p className="text-gray-600 flex items-center">
              ID: {internal.InternalPatientId}
            </p>
            <p className="text-gray-600 flex items-center">
              DOB: {internal.DOB}
              <MatchIndicator
                isMatch={isExactMatch("dob", internal.DOB, external.DOB)}
              />
            </p>
            <p className="text-gray-600 flex items-center">
              Phone: {formatPhone(internal.PhoneNumber || "")}
              <MatchIndicator
                isMatch={isExactMatch(
                  "phone",
                  internal.PhoneNumber,
                  external.PhoneNumber
                )}
              />
            </p>
            <p className="text-gray-600 text-xs flex items-center">
              {formatAddress(
                internal.Address || "",
                internal.City || "",
                internal.ZipCode || ""
              )}
              <MatchIndicator
                isMatch={isExactMatch(
                  "address",
                  internal.Address,
                  external.Address
                )}
              />
            </p>
          </div>
        </div>

        {/* External Patient */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 text-sm">
            External Patient
          </h3>
          <div className="text-sm space-y-1">
            <p className="font-bold text-black flex items-center">
              {external.FirstName} {external.LastName}
              <MatchIndicator
                isMatch={isExactMatch(
                  "name",
                  `${internal.FirstName} ${internal.LastName}`,
                  `${external.FirstName} ${external.LastName}`
                )}
              />
            </p>
            <p className="text-gray-600 flex items-center">
              ID: {external.ExternalPatientId}
            </p>
            <p className="text-gray-600 flex items-center">
              DOB: {external.DOB}
              <MatchIndicator
                isMatch={isExactMatch("dob", internal.DOB, external.DOB)}
              />
            </p>
            <p className="text-gray-600 flex items-center">
              Phone: {formatPhone(external.PhoneNumber || "")}
              <MatchIndicator
                isMatch={isExactMatch(
                  "phone",
                  internal.PhoneNumber,
                  external.PhoneNumber
                )}
              />
            </p>
            <p className="text-gray-600 text-xs flex items-center">
              {formatAddress(
                external.Address || "",
                external.City || "",
                external.ZipCode || ""
              )}
              <MatchIndicator
                isMatch={isExactMatch(
                  "address",
                  internal.Address,
                  external.Address
                )}
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
