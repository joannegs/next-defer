export default function HeavyCard({ label }: { label: string }) {
  return (
    <div style={{ padding: 16, borderRadius: 5, background: '#d0cfcf' }}>
      Loaded on <strong>{label}</strong>
    </div>
  );
}
