import { clsx } from "clsx";

type View = "track" | "sessions" | "friends" | "feed";

type Props = {
  view: View;
  setView: React.Dispatch<React.SetStateAction<View>>;
  onLogout: () => void;
  guest: boolean;
};

const navigationItems = [
  { key: "track" as View, label: "Workout", icon: "🏃‍♀️", description: "Start tracking" },
  { key: "sessions" as View, label: "Sessions", icon: "📈", description: "View history" },
  { key: "friends" as View, label: "Friends", icon: "🤝", description: "Connect & compete" },
  { key: "feed" as View, label: "Feed", icon: "📰", description: "Activity updates" }
];

export default function Sidebar({ view, setView, onLogout, guest }: Props) {
  const disabled = (k: View) => guest && (k === "sessions" || k === "friends" || k === "feed");
  
  return (
    <aside className="sidebar-modern">
      <div className="sidebar-header">
        <div className="logo-modern">
          <div className="logo-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" stroke="currentColor" strokeWidth="2" fill="none"/>
              <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.3"/>
            </svg>
          </div>
          <div className="logo-text">
            <span className="logo-title">Sweat</span>
            <span className="logo-subtitle">Together</span>
          </div>
        </div>
      </div>
      
      <nav className="nav-modern">
        {navigationItems.map(item => (
          <button
            key={item.key}
            className={clsx("nav-item-modern", view === item.key && "active", disabled(item.key) && "disabled")}
            onClick={() => !disabled(item.key) && setView(item.key)}
            title={disabled(item.key) ? "Login to use this feature" : item.description}
          >
            <div className="nav-icon">{item.icon}</div>
            <div className="nav-content">
              <span className="nav-label">{item.label}</span>
              <span className="nav-description">{item.description}</span>
            </div>
            {view === item.key && <div className="nav-indicator" />}
          </button>
        ))}
      </nav>
      
      <div className="sidebar-footer-modern">
        <div className="user-info">
          <div className="user-avatar">
            <span>{guest ? "👤" : "🏃‍♂️"}</span>
          </div>
          <div className="user-details">
            <span className="user-name">{guest ? "Guest User" : "Athlete"}</span>
            <span className="user-status">{guest ? "Demo Mode" : "Online"}</span>
          </div>
        </div>
        
        <div className="footer-actions">
          <button className="btn-modern secondary" onClick={() => setView("track")} title="Settings">
            <span className="btn-icon">⚙️</span>
            Settings
          </button>
          <button className="btn-modern danger" onClick={onLogout}>
            <span className="btn-icon">{guest ? "🚪" : "👋"}</span>
            {guest ? "Exit Guest" : "Logout"}
          </button>
        </div>
      </div>
    </aside>
  );
}
