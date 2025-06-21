const MatchIndicator = ({ isMatch }: { isMatch: boolean }) => {
  if (!isMatch) return null;
  return (
    <span className="inline-flex items-center ml-2">
      <svg
        className="w-4 h-4 text-green-600"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  );
};

export default MatchIndicator;
