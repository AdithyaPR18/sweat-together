import { useEffect, useState } from "react";
import { api } from "../api";

export default function Friends({ guest, toast }: { guest: boolean; toast: (m: string, t?: "ok" | "error") => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [inbound, setInbound] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);

  const search = async () => {
    if (!q || guest) return;
    const d = await api.get<{ results: any[] }>("/api/users/search?q=" + encodeURIComponent(q));
    setResults(d.results || []);
  };

  const refresh = async () => {
    if (guest) return;
    const reqs = await api.get<{ inbound: any[] }>("/api/friends/requests");
    setInbound(reqs.inbound || []);
    const fl = await api.get<{ friends: any[] }>("/api/friends");
    setFriends(fl.friends || []);
  };
  useEffect(() => { refresh(); }, []);

  return (
    <div className="page-header">
      <h1 className="page-title">Tribe</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Connect with others in the void.</p>

      {!guest && (
        <div style={{ marginTop: 32, display: 'flex', gap: 10 }}>
          <input
            className="input-minimal"
            placeholder="Find souls..."
            value={q}
            onChange={e => setQ(e.target.value)}
            style={{ flex: 1 }}
          />
          <button className="btn-ghost" onClick={search}>Search</button>
        </div>
      )}

      <div className="minimal-list" style={{ marginTop: 40, padding: 0, margin: 0 }}>
        {guest ? (
          <div className="list-item" style={{ justifyContent: 'center', color: 'var(--text-muted)' }}>
            Sign in to build your tribe.
          </div>
        ) : (
          <>
            {/* INBOUND */}
            {inbound.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ marginBottom: 10, color: 'var(--soul-primary)' }}>Awaiting Response</h4>
                {inbound.map(r => (
                  <div key={r.request_id} className="list-item">
                    <span>{r.name}</span>
                    <div>
                      <button className="btn-ghost" onClick={async () => { await api.post("/api/friends/respond", { request_id: r.request_id, action: "accept" }); refresh(); }}>Accept</button>
                      <button className="btn-ghost" style={{ color: 'var(--error)' }} onClick={async () => { await api.post("/api/friends/respond", { request_id: r.request_id, action: "decline" }); refresh(); }}>Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SEARCH RESULTS */}
            {results.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ marginBottom: 10, color: 'var(--soul-secondary)' }}>Found</h4>
                {results.map(u => (
                  <div key={u.id} className="list-item">
                    <span>{u.name}</span>
                    <button className="btn-ghost" onClick={async () => { await api.post("/api/friends/request", { to_user_id: u.id }); toast("Request sent"); }}>Add</button>
                  </div>
                ))}
              </div>
            )}

            {/* FRIENDS */}
            <h4 style={{ marginBottom: 10, color: 'var(--text-muted)' }}>Allies</h4>
            {friends.length === 0 ? (
              <div style={{ padding: 20, color: 'var(--text-muted)', fontStyle: 'italic' }}>No connections yet.</div>
            ) : (
              friends.map(f => (
                <div key={f.id} className="list-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--void-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {f.name[0]}
                    </div>
                    <span>{f.name}</span>
                  </div>
                  <span style={{ color: 'var(--soul-primary)', fontSize: '0.8rem' }}>CONNECTED</span>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
