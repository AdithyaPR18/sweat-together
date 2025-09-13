import { useEffect, useState } from "react";
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
    <div className="feed-modern">
      <section className="feed-header">
        <h1 className="feed-title">Friends Feed</h1>
        <p className="feed-subtitle">Stay updated with your friends' fitness activities</p>
      </section>

      {guest ? (
        <section className="card" style={{textAlign: 'center', padding: '40px'}}>
          <div style={{fontSize: '3rem', marginBottom: '16px'}}>📰</div>
          <h3 style={{color: 'var(--text)', marginBottom: '8px'}}>Login Required</h3>
          <p className="muted">Guest mode: feed is available after login.</p>
        </section>
      ) : (
        <div>
          {items.length === 0 ? (
            <section className="card" style={{textAlign: 'center', padding: '40px'}}>
              <div style={{fontSize: '3rem', marginBottom: '16px'}}>📊</div>
              <h3 style={{color: 'var(--text)', marginBottom: '8px'}}>No Activity Yet</h3>
              <p className="muted">Connect with friends to see their workout activities here!</p>
            </section>
          ) : (
            items.map(it => {
              const d = new Date(it.ts.replace(" ","T"));
              return (
                <div key={it.id} className="feed-item">
                  <div className="feed-header-item">
                    <div className="feed-avatar">
                      {it.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="feed-user-info">
                      <div className="feed-username">{it.name}</div>
                      <div className="feed-timestamp">{d.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div className="feed-content">
                    <div className="feed-exercise">
                      Completed {it.exercise.charAt(0).toUpperCase() + it.exercise.slice(1)}
                    </div>
                    <div className="feed-stats">
                      <div className="feed-stat">
                        <span>🔢</span>
                        <span>{it.reps} reps</span>
                      </div>
                      <div className="feed-stat">
                        <span>🎯</span>
                        <span>{Math.round(it.accuracy)}% accuracy</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
