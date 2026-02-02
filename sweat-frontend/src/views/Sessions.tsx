import { useEffect, useState } from "react";
import { api } from "../api";

type W = { id: number; exercise: string; reps: number; accuracy: number; ts: string };

export default function Sessions({ guest, toast }: { guest: boolean; toast: (m: string, t?: "ok" | "error") => void }) {
  const [rows, setRows] = useState<W[]>([]);
  const [f, setF] = useState("");

  useEffect(() => {
    if (guest) { return; }
    api.get<{ workouts: W[] }>("/api/workouts/my").then(d => setRows(d.workouts || []))
      .catch(() => toast("Failed to load sessions", "error"));
  }, []);

  const filtered = rows.filter(r => !f || r.exercise === f);

  return (
    <div className="page-header">
      <h1 className="page-title">Journal</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Your history in the void.</p>

      {!guest && (
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
      )}

      <div className="minimal-list" style={{ marginTop: 40, padding: 0, margin: 0 }}>
        {guest ? (
          <div className="list-item" style={{ justifyContent: 'center', color: 'var(--text-muted)' }}>
            Sign in to access your journal.
          </div>
        ) : filtered.length === 0 ? (
          <div className="list-item" style={{ justifyContent: 'center', color: 'var(--text-muted)' }}>
            The void is empty. Begin training.
          </div>
        ) : (
          filtered.map(w => (
            <div key={w.id} className="list-item">
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>{w.exercise.toUpperCase()}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(w.ts.replace(" ", "T")).toLocaleDateString()}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>{w.reps}</div>
                <div className="metric-label-soul" style={{ fontSize: '0.7rem' }}>REPS</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
