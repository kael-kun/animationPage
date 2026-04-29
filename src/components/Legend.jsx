export default function Legend() {
  return (
    <div className="legend">
      <h4 className="legend-title">Node Size Scale</h4>
      <div className="legend-items">
        <div className="legend-item">
          <span className="legend-dot small"></span>
          <span className="legend-label">1-10 letters</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot medium"></span>
          <span className="legend-label">11-50 letters</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot large"></span>
          <span className="legend-label">51-150 letters</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot max"></span>
          <span className="legend-label">150+ letters</span>
        </div>
      </div>
    </div>
  );
}