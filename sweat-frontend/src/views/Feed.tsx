import { useEffect, useState } from "react";
import { api } from "../api";

type Item = { id: number; name: string; exercise: string; reps: number; accuracy: number; ts: string };

export default function Feed({ guest, toast }: { guest: boolean; toast: (m: string, t?: "ok" | "error") => void }) {
  const [items, setItems] = useState<Item[]>([]);

  const demoItems: Item[] = [
    { id: 801, name: "Maria K.", exercise: "pushups", reps: 42, accuracy: 96, ts: new Date().toISOString() },
    { id: 802, name: "Davide", exercise: "bicep", reps: 18, accuracy: 89, ts: new Date(Date.now() - 3600000).toISOString() },
    { id: 803, name: "System", exercise: "pushups", reps: 100, accuracy: 100, ts: new Date(Date.now() - 7200000).toISOString() },
  ];

  useEffect(() => {
    if (guest) { setItems(demoItems); return; }
    api.get<{ feed: Item[] }>("/api/feed").then(d => setItems(d.feed || []))
      .catch(() => toast("Failed to load feed", "error"));
  }, [guest]);

  return (
    <div className="page-header">
      <h1 className="page-title">Pulse {guest && <span style={{ fontSize: '0.4em', verticalAlign: 'middle', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 4 }}>DEMO</span>}</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Echoes from the collective.</p>

      <div className="minimal-list" style={{ marginTop: 40, padding: 0, margin: 0 }}>
        {items.length === 0 ? (
          <div className="list-item" style={{ justifyContent: 'center', color: 'var(--text-muted)' }}>
            Silence in the void.
          </div>
        ) : (
          items.map(it => (
            <div key={it.id} className="list-item" style={guest ? { opacity: 0.75 } : {}}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '12px',
                  background: 'linear-gradient(135deg, var(--soul-primary), var(--soul-secondary))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#000', fontWeight: 'bold'
                }}>
                  {it.name[0]}
                </div>
                <div>
                  <div style={{ fontSize: '1rem' }}>{it.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {it.exercise} • {new Date(it.ts.replace(" ", "T")).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.2rem', color: 'var(--soul-secondary)' }}>{it.reps}</div>
                <div className="metric-label-soul">REPS</div>
              </div>
            </div>
          ))
        )}

        {guest && (
          <div style={{ marginTop: 30, textAlign: 'center', color: 'var(--soul-primary)', fontSize: '0.9rem', cursor: 'pointer', padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }} onClick={() => toast("Please sign in to join the pulse.")}>
            Sign in to join the global feed →
          </div>
        )}
      </div>
    </div>
  );
}
