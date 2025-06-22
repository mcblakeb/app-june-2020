import React from "react";

interface AcceptButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export default function AcceptButton({
  onClick,
  disabled = false,
  className = "",
}: AcceptButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (!disabled) onClick();
        }
      }}
      aria-label="Approve this patient match"
      className={`
        inline-flex items-center gap-2 px-3 py-2 
        bg-green-600 text-white rounded-md 
        hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed
        transition-colors cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
        ${className}
      `}
    >
      {/* SVG icon for the button */}
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    </button>
  );
}
