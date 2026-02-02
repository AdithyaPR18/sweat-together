import { useEffect, useState } from "react";
import { api } from "../api";

type W = { id: number; exercise: string; reps: number; accuracy: number; ts: string };

export default function Sessions({ guest, toast }: { guest: boolean; toast: (m: string, t?: "ok" | "error") => void }) {
  const [rows, setRows] = useState<W[]>([]);
  const [f, setF] = useState("");

  const demoRows: W[] = [
    { id: 101, exercise: "pushups", reps: 24, accuracy: 92, ts: new Date().toISOString() },
    { id: 102, exercise: "bicep", reps: 15, accuracy: 88, ts: new Date(Date.now() - 86400000).toISOString() },
    { id: 103, exercise: "pushups", reps: 30, accuracy: 95, ts: new Date(Date.now() - 172800000).toISOString() },
  ];

  useEffect(() => {
    if (guest) { setRows(demoRows); return; }
    api.get<{ workouts: W[] }>("/api/workouts/my").then(d => setRows(d.workouts || []))
      .catch(() => toast("Failed to load sessions", "error"));
  }, [guest]);

  const filtered = rows.filter(r => !f || r.exercise === f);

  return (
    <div className="page-header">
      <h1 className="page-title">Journal {guest && <span style={{ fontSize: '0.4em', verticalAlign: 'middle', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 4 }}>DEMO</span>}</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Your history in the void.</p>

      <div style={{ marginTop: 24 }}>
        <select
          className="input-minimal"
          value={f}
          onChange={e => setF(e.target.value)}
          style={{ width: 'auto', paddingRight: 24 }}
        >
          <option value="">All Movements</option>
          <option value="pushups">Pushups</option>
          <option value="bicep">Curls</option>
        </select>
      </div>

      <div className="minimal-list" style={{ marginTop: 40, padding: 0, margin: 0 }}>
        {filtered.length === 0 ? (
          <div className="list-item" style={{ justifyContent: 'center', color: 'var(--text-muted)' }}>
            The void is empty. Begin training.
          </div>
        ) : (
          filtered.map(w => (
            <div key={w.id} className="list-item" style={guest ? { opacity: 0.7 } : {}}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>{w.exercise.toUpperCase()}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {new Date(w.ts.replace(" ", "T")).toLocaleDateString()} {guest && "(Demo)"}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>{w.reps}</div>
                <div className="metric-label-soul" style={{ fontSize: '0.7rem' }}>REPS</div>
              </div>
            </div>
          ))
        )}

        {guest && (
          <div style={{ marginTop: 30, textAlign: 'center', color: 'var(--soul-primary)', fontSize: '0.9rem', cursor: 'pointer', padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }} onClick={() => toast("Please sign in to save your own sessions.")}>
            Sign in to save your own progress →
          </div>
        )}
      </div>
    </div>
  );
}
