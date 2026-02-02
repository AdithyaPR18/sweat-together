import { useState } from "react";
import Dock from "./components/Dock";
import Toasts from "./components/Toasts";
import Auth from "./views/Auth";
import Track from "./views/Track";
import Sessions from "./views/Sessions";
import Friends from "./views/Friends";
import Feed from "./views/Feed";
import { tokenStore } from "./api";
import { useToasts } from "./hooks";

export default function App() {
  const [view, setView] = useState<"track" | "sessions" | "friends" | "feed">("track");
  const [authed, setAuthed] = useState(!!tokenStore.get());
  const [guest, setGuest] = useState(false);
  const { list, add } = useToasts();

  const onDoneAuth = () => { setAuthed(true); setGuest(false); };
  const onGuest = () => { setGuest(true); setAuthed(false); add("Guest mode active."); };

  return (
    <div className="app-soul">
      <div className="bg-mesh" /> {/* Immersive background */}

      {!authed && !guest ? (
        <Auth onDone={onDoneAuth} onGuest={onGuest} toast={add} />
      ) : (
        <>
          <main className="main-content">
            {view === "track" && <Track toast={add} />}
            {view === "sessions" && <Sessions guest={guest} toast={add} />}
            {view === "friends" && <Friends guest={guest} toast={add} />}
            {view === "feed" && <Feed guest={guest} toast={add} />}
          </main>

          <Dock view={view} setView={setView} />
        </>
      )}
      <Toasts items={list} />

      {/* Persistent Credits */}
      <div style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 900,
        fontFamily: 'Outfit, sans-serif',
        fontSize: '0.75rem',
        color: 'var(--text-faint)',
        textAlign: 'right',
        pointerEvents: 'auto'
      }}>
        <div style={{ opacity: 0.5, marginBottom: 4 }}>Built by Adithya</div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', opacity: 0.8 }}>
          <a href="https://github.com/AdithyaPR18" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--soul-primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'inherit'}>GitHub</a>
          <a href="https://linkedin.com/in/adithyapramesh" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--soul-secondary)'} onMouseOut={(e) => e.currentTarget.style.color = 'inherit'}>LinkedIn</a>
        </div>
      </div>

      {/* Branding Watermark (Top Left) */}
      <div style={{
        position: 'fixed',
        top: 24,
        left: 24,
        zIndex: 900,
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 700,
        fontSize: '1rem',
        letterSpacing: -0.5,
        color: 'rgba(255,255,255,0.15)',
        pointerEvents: 'none'
      }}>
        Sweat Together
      </div>
    </div>
  );
}
