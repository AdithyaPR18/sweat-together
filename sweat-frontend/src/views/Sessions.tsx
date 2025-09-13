import { useEffect, useState } from "react";

import { api } from "../api";

type W = { id:number; exercise:string; reps:number; accuracy:number; ts:string };

export default function Sessions({ guest, toast }: { guest: boolean; toast: (m:string,t?:"ok"|"error")=>void }) {
  const [rows, setRows] = useState<W[]>([]);
  const [f, setF] = useState("");

  useEffect(()=> {
    if (guest) { toast("Login to view saved sessions", "error"); return; }
    api.get<{workouts:W[]}>("/api/workouts/my").then(d=>setRows(d.workouts||[]))
      .catch(()=> toast("Failed to load sessions","error"));
  }, []);

  const filtered = rows.filter(r => !f || r.exercise===f);
  return (
    <div className="sessions-modern">
      <section className="sessions-header">
        <h1 className="sessions-title">Your Sessions</h1>
        <p className="sessions-subtitle">Track your fitness journey and monitor progress</p>
        
        <div className="filter-controls">
          <label className="filter-label">Filter by exercise:</label>
          <select className="filter-select" value={f} onChange={e=>setF(e.target.value)} disabled={guest}>
            <option value="">All Exercises</option>
            <option value="pushups">Pushups</option>
            <option value="bicep">Bicep Curls</option>
            <option value="thumbs">Thumb Touch</option>
          </select>
        </div>
      </section>

      {guest ? (
        <section className="card" style={{textAlign: 'center', padding: '40px'}}>
          <div style={{fontSize: '3rem', marginBottom: '16px'}}>🔒</div>
          <h3 style={{color: 'var(--text)', marginBottom: '8px'}}>Login Required</h3>
          <p className="muted">Guest mode: sessions are only available after login.</p>
        </section>
      ) : (
        <section className="sessions-grid">
          {filtered.length === 0 ? (
            <div className="card" style={{textAlign: 'center', padding: '40px', gridColumn: '1 / -1'}}>
              <div style={{fontSize: '3rem', marginBottom: '16px'}}>📊</div>
              <h3 style={{color: 'var(--text)', marginBottom: '8px'}}>No Sessions Yet</h3>
              <p className="muted">Start tracking your workouts to see them here!</p>
            </div>
          ) : (
            filtered.map(w => {
              const d = new Date(w.ts.replace(" ","T"));
              return (
                <div key={w.id} className="session-card">
                  <div className="session-header">
                    <div className="session-exercise">{w.exercise.charAt(0).toUpperCase() + w.exercise.slice(1)}</div>
                    <div className="session-date">{d.toLocaleDateString()}</div>
                  </div>
                  <div className="session-metrics">
                    <div className="session-metric">
                      <span className="session-metric-value">{w.reps}</span>
                      <span className="session-metric-label">Reps</span>
                    </div>
                    <div className="session-metric">
                      <span className="session-metric-value">{Math.round(w.accuracy)}%</span>
                      <span className="session-metric-label">Accuracy</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>
      )}
    </div>
  );
}
