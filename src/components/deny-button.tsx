interface DenyButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export default function DenyButton({
  onClick,
  disabled = false,
  className = "",
}: DenyButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!disabled) onClick();
        }
      }}
      aria-label="Deny this patient match"
      className={`
        inline-flex items-center gap-2 px-3 py-2 
        bg-red-600 text-white rounded-md 
        hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed
        transition-colors cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
        ${className}
      `}
    >
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
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  );
}
