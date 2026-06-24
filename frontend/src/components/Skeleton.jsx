import './Skeleton.css';

export function SkeletonText({ width = '100%', height = '14px' }) {
  return <div className="skeleton-box" style={{ width, height }}></div>;
}

export function SkeletonTableRow({ columns = 5 }) {
  return (
    <tr className="skeleton-row">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i}>
          <div className="skeleton-box" style={{ height: '14px', width: '80%' }}></div>
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className="stat-card skeleton-card">
      <div className="skeleton-box skeleton-icon"></div>
      <div style={{ flex: 1 }}>
        <div className="skeleton-box" style={{ height: '12px', width: '60%', marginBottom: '8px' }}></div>
        <div className="skeleton-box" style={{ height: '20px', width: '40%' }}></div>
      </div>
    </div>
  );
}