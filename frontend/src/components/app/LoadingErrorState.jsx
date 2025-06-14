export default function LoadingErrorState({ loading, error }) {
  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;
  return null;
}
