export function ErrorCard({ error }: { error: string }) {
  return <p style={{ overflowX: 'scroll', scrollbarColor: 'auto' }}>{error}</p>;
}
