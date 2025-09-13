import { useState, useEffect } from "react";

type TrackMetrics = {
  metrics: { reps: number; accuracy: number; progress: number };
  showSticky: boolean;
  exercise: string;
};

export default function Topbar({ label, me, guest }: { label: string; me?: { name: string } | null; guest: boolean }) {
  const [trackMetrics, setTrackMetrics] = useState<TrackMetrics | null>(null);

  useEffect(() => {
    const handleTrackMetrics = (event: CustomEvent<TrackMetrics>) => {
      setTrackMetrics(event.detail);
    };

    window.addEventListener('trackMetrics', handleTrackMetrics as EventListener);
    return () => window.removeEventListener('trackMetrics', handleTrackMetrics as EventListener);
  }, []);

  const getPageIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case 'track': return '🏃‍♀️';
      case 'sessions': return '📈';
      case 'friends': return '🤝';
      case 'feed': return '📰';
      default: return '💪';
    }
  };

  const getPageDescription = (label: string) => {
    switch (label.toLowerCase()) {
      case 'track': return 'Real-time workout tracking';
      case 'sessions': return 'Your workout history';
      case 'friends': return 'Connect with athletes';
      case 'feed': return 'Activity updates';
      default: return 'Fitness dashboard';
    }
  };

  return (
    <header className="topbar-modern">
      <div className="topbar-content">
        <div className="page-info">
          <div className="page-icon">{getPageIcon(label)}</div>
          <div className="page-details">
            <h1 className="page-title">{label}{guest ? " (Guest)" : ""}</h1>
            <p className="page-description">{getPageDescription(label)}</p>
          </div>
        </div>
        
        <div className="user-section">
          <div className="user-profile">
            <div className="user-avatar-small">
              <span>{guest ? "👤" : "🏃‍♂️"}</span>
            </div>
            <div className="user-info-small">
              <span className="user-name-small">{guest ? "Guest User" : (me?.name ?? "Athlete")}</span>
              <div className="user-status-small">
                <div className={`status-dot ${guest ? "demo" : "online"}`} />
                <span>{guest ? "Demo Mode" : "Online"}</span>
              </div>
            </div>
          </div>
          
          <div className="topbar-actions">
            <button className="action-btn" title="Notifications">
              <span>🔔</span>
            </button>
            <button className="action-btn" title="Settings">
              <span>⚙️</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Sticky Metrics - Only show on Track page when scrolling */}
      {label.toLowerCase() === 'track' && trackMetrics?.showSticky && (
        <div className="sticky-metrics">
          <div className="sticky-metric">
            <span className="sticky-metric-icon">🔢</span>
            <span className="sticky-metric-value">{trackMetrics.metrics.reps}</span>
            <span className="sticky-metric-label">Reps</span>
          </div>
          <div className="sticky-metric">
            <span className="sticky-metric-icon">🎯</span>
            <span className="sticky-metric-value">{Math.round(trackMetrics.metrics.accuracy)}%</span>
            <span className="sticky-metric-label">Accuracy</span>
          </div>
          <div className="sticky-metric">
            <span className="sticky-metric-icon">⚡</span>
            <span className="sticky-metric-value">{Math.round(trackMetrics.metrics.progress)}%</span>
            <span className="sticky-metric-label">Progress</span>
          </div>
        </div>
      )}
    </header>
  );
}
