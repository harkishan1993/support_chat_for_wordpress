export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent" />
      <p className="mt-4 text-lg text-gray-500">Loading, please wait...</p>
    </div>
  );
}
