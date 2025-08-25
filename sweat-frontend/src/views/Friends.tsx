import { useEffect, useState } from "react";
import { api } from "../api";

export default function Friends({ guest, toast }: { guest: boolean; toast: (m:string,t?:"ok"|"error")=>void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [inbound, setInbound] = useState<any[]>([]);
  const [outbound, setOutbound] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);

  const search = async () => {
    if (guest) return toast("Login to search and add friends","error");
    if (!q) return;
    const d = await api.get<{results:any[]}>("/api/users/search?q=" + encodeURIComponent(q));
    setResults(d.results||[]);
  };
  const refresh = async () => {
    if (guest) return;
    const reqs = await api.get<{inbound:any[];outbound:any[]}>("/api/friends/requests");
    setInbound(reqs.inbound||[]); setOutbound(reqs.outbound||[]);
    const fl = await api.get<{friends:any[]}>("/api/friends");
    setFriends(fl.friends||[]);
  };
  useEffect(()=> { refresh(); }, []);

  return (
    <section className="card" style={{marginTop:16}}>
      <div className="view-head"><h2>Friends</h2></div>

      {guest ? (
        <div className="muted">Guest mode: friends and feed are available after login.</div>
      ) : (
        <>
          <div className="row">
            <input placeholder="Search by name or email" value={q} onChange={e=>setQ(e.target.value)} />
            <button className="btn" onClick={search}>Search</button>
          </div>

          <div className="grid-2" style={{marginTop:12}}>
            <div className="card"><h3>Results</h3>
              {results.map(u => (
                <div key={u.id} className="row" style={{justifyContent:"space-between", marginTop:6}}>
                  <div>{u.name} <span className="muted">&lt;{u.email}&gt;</span></div>
                  <button className="btn" onClick={async()=>{ await api.post("/api/friends/request",{to_user_id:u.id}); toast("Request sent"); refresh(); }}>Add</button>
                </div>
              ))}
            </div>
            <div className="card">
              <h3>Pending</h3>
              <div className="grid-2">
                <div>
                  <h4>Inbound</h4>
                  {inbound.map(r =>
                    <div key={r.request_id} className="row" style={{justifyContent:"space-between", marginTop:6}}>
                      <div>{r.name} <span className="muted">&lt;{r.email}&gt;</span></div>
                      <div className="row">
                        <button className="btn" onClick={async()=>{ await api.post("/api/friends/respond",{request_id:r.request_id, action:"accept"}); toast("Friend added"); refresh(); }}>Accept</button>
                        <button className="btn danger" onClick={async()=>{ await api.post("/api/friends/respond",{request_id:r.request_id, action:"decline"}); refresh(); }}>Decline</button>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <h4>Outbound</h4>
                  {outbound.map(r =>
                    <div key={r.request_id} style={{marginTop:6}}>Pending → {r.name} &lt;{r.email}&gt;</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{marginTop:12}}>
            <h3>All Friends</h3>
            {friends.map(f => <div key={f.id} style={{marginTop:6}}>{f.name} &lt;{f.email}&gt;</div>)}
          </div>
        </>
      )}
    </section>
  );
}
