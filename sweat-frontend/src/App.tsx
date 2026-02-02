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

          <Dock view={view} setView={setView} guest={guest} />
        </>
      )}
      <Toasts items={list} />
    </div>
  );
}
