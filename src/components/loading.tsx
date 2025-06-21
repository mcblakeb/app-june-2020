export default function LoadingSpinner() {
  return (
    <div className="w-full max-w-2xl text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
      <p className="text-gray-300">Loading patient matches...</p>
    </div>
  );
}
