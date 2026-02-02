import { useEffect, useState } from "react";
import { api } from "../api";

type Item = { id: number; name: string; exercise: string; reps: number; accuracy: number; ts: string };

export default function Feed({ guest, toast }: { guest: boolean; toast: (m: string, t?: "ok" | "error") => void }) {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => {
    if (guest) return;
    api.get<{ feed: Item[] }>("/api/feed").then(d => setItems(d.feed || []))
      .catch(() => toast("Failed to load feed", "error"));
  }, []);

  return (
    <div className="page-header">
      <h1 className="page-title">Pulse</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Echoes from the collective.</p>

      <div className="minimal-list" style={{ marginTop: 40, padding: 0, margin: 0 }}>
        {guest ? (
          <div className="list-item" style={{ justifyContent: 'center', color: 'var(--text-muted)' }}>
            Sign in to feel the pulse.
          </div>
        ) : items.length === 0 ? (
          <div className="list-item" style={{ justifyContent: 'center', color: 'var(--text-muted)' }}>
            Silence in the void.
          </div>
        ) : (
          items.map(it => (
            <div key={it.id} className="list-item">
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
      </div>
    </div>
  );
}
