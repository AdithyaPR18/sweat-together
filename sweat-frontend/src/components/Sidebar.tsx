import { clsx } from "clsx";

type View = "track" | "sessions" | "friends" | "feed";

type Props = {
  view: View;
  setView: React.Dispatch<React.SetStateAction<View>>;
  onLogout: () => void;
  guest: boolean;
};

export default function Sidebar({ view, setView, onLogout, guest }: Props) {
  const disabled = (k: View) => guest && (k === "sessions" || k === "friends" || k === "feed");
  return (
    <aside className="sidebar">
      <div className="logo">
        <svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" stroke="currentColor" fill="none"/></svg>
        <span>Sweat Together</span>
      </div>
      <nav className="nav">
        {(["track","sessions","friends","feed"] as View[]).map(k => (
          <button
            key={k}
            className={clsx(view===k && "active")}
            onClick={()=>!disabled(k)&&setView(k)}
            title={disabled(k) ? "Login to use this" : ""}
            style={{opacity: disabled(k)?0.5:1, cursor: disabled(k) ? "not-allowed" : "pointer"}}
          >
            <span style={{width:20,display:"inline-block"}}>{k==="track"?"🏃‍♀️":k==="sessions"?"📈":k==="friends"?"🤝":"📰"}</span>
            <span style={{textTransform:"capitalize"}}>{k}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="btn" onClick={()=>setView("track")}>Settings</button>
        <button className="btn danger" onClick={onLogout}>{guest ? "Exit Guest" : "Logout"}</button>
      </div>
    </aside>
  );
}
