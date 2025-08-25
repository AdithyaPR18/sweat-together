import React, { useEffect, useState } from "react";
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
    <section className="card" style={{marginTop:16}}>
      <div className="view-head">
        <h2>Your Sessions</h2>
        <select value={f} onChange={e=>setF(e.target.value)} disabled={guest}>
          <option value="">All</option>
          <option value="pushups">Pushups</option>
          <option value="bicep">Bicep Curls</option>
          <option value="thumbs">Thumb Touch</option>
        </select>
      </div>
      {guest ? (
        <div className="muted">Guest mode: sessions are only available after login.</div>
      ) : (
        <div className="table">
          <table>
            <thead><tr><th>Date</th><th>Exercise</th><th>Reps</th><th>Accuracy</th></tr></thead>
            <tbody>
              {filtered.map(w=>{
                const d = new Date(w.ts.replace(" ","T"));
                return <tr key={w.id}><td>{d.toLocaleString()}</td><td>{w.exercise}</td><td>{w.reps}</td><td>{Math.round(w.accuracy)}%</td></tr>;
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
