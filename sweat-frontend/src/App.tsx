import { useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Toasts from "./components/Toasts";
import Auth from "./views/Auth";
import Onboarding from "./views/Onboarding";
import Track from "./views/Track";
import Sessions from "./views/Sessions";
import Friends from "./views/Friends";
import Feed from "./views/Feed";
import { meStore, tokenStore } from "./api";
import { useToasts } from "./hooks";

export default function App() {
  const [view, setView] = useState<"track"|"sessions"|"friends"|"feed">("track");
  const [authed, setAuthed] = useState(!!tokenStore.get());
  const [guest, setGuest] = useState(false);
  const [first, setFirst] = useState(false);
  const me = useMemo(()=> meStore.get(), [authed]);
  const { list, add } = useToasts();

  const onDoneAuth = () => { setAuthed(true); setGuest(false); setFirst(true); };
  const onGuest = () => { setGuest(true); setAuthed(false); setFirst(true); add("Guest demo — features limited"); };
  const logout = () => { tokenStore.clear(); meStore.clear(); setGuest(false); location.reload(); };

  return (
    <>
      <div className="bg-gradient"></div><div className="bg-glow"></div>
      {!authed && !guest ? (
        <main className="main"><Auth onDone={onDoneAuth} onGuest={onGuest} toast={add} /></main>
      ) : (
        <div className="app">
          <Sidebar view={view} setView={setView} onLogout={logout} guest={guest} />
          <main className="main">
            <Topbar label={view[0].toUpperCase()+view.slice(1)} me={me} guest={guest} />
            {first ? (
              <Onboarding start={()=>{ setFirst(false); setView("track"); }} />
            ) : (
              <>
                {view==="track" && <Track toast={add} guest={guest} />}
                {view==="sessions" && <Sessions guest={guest} toast={add} />}
                {view==="friends" && <Friends guest={guest} toast={add} />}
                {view==="feed" && <Feed guest={guest} toast={add} />}
              </>
            )}
          </main>
        </div>
      )}
      <Toasts items={list} />
    </>
  );
}
