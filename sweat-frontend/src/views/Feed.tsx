import React, { useEffect, useState } from "react";
import { api } from "../api";

type Item = { id:number; name:string; exercise:string; reps:number; accuracy:number; ts:string };

export default function Feed({ guest, toast }: { guest: boolean; toast: (m:string,t?:"ok"|"error")=>void }) {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(()=> {
    if (guest) { toast("Login to see your friends feed","error"); return; }
    api.get<{feed:Item[]}>("/api/feed").then(d=>setItems(d.feed||[]))
      .catch(()=> toast("Failed to load feed","error"));
  }, []);
  return (
    <section className="card" style={{marginTop:16}}>
      <div className="view-head"><h2>Friends Feed</h2></div>
      {guest ? (
        <div className="muted">Guest mode: feed is available after login.</div>
      ) : (
        items.map(it => {
          const d = new Date(it.ts.replace(" ","T"));
          return (
            <div key={it.id} className="card" style={{marginTop:8}}>
              <strong>{it.name}</strong> • {it.exercise} • {it.reps} reps • {Math.round(it.accuracy)}% <span className="muted">({d.toLocaleString()})</span>
            </div>
          );
        })
      )}
    </section>
  );
}
