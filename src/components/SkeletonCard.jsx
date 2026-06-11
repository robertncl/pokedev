export default function SkeletonCard() {
  return (
    <div className="card neu skeleton" aria-hidden="true">
      <div className="card-dish neu-inset">
        <div className="skeleton-circle" />
      </div>
      <div className="skeleton-line w-60" />
      <div className="skeleton-line w-40" />
    </div>
  );
}
