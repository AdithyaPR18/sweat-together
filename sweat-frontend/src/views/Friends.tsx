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
    <div className="friends-modern">
      <section className="friends-header">
        <h1 className="sessions-title">Friends</h1>
        <p className="sessions-subtitle">Connect with athletes and stay motivated together</p>
        
        <div className="search-section">
          <input 
            className="search-input" 
            placeholder="Search by name or email..." 
            value={q} 
            onChange={e=>setQ(e.target.value)} 
            disabled={guest}
          />
          <button className="search-btn" onClick={search} disabled={guest}>
            <span className="btn-icon">🔍</span>
            Search
          </button>
        </div>
      </section>

      {guest ? (
        <section className="card" style={{textAlign: 'center', padding: '40px'}}>
          <div style={{fontSize: '3rem', marginBottom: '16px'}}>👥</div>
          <h3 style={{color: 'var(--text)', marginBottom: '8px'}}>Login Required</h3>
          <p className="muted">Guest mode: friends and feed are available after login.</p>
        </section>
      ) : (
        <div className="friends-content">
          <div className="friends-section">
            <h3 className="section-title">
              <span className="section-icon">🔍</span>
              Search Results
            </h3>
            {results.length === 0 ? (
              <div style={{textAlign: 'center', padding: '20px', color: 'var(--muted)'}}>
                {q ? 'No users found' : 'Search for friends to connect with'}
              </div>
            ) : (
              results.map(u => (
                <div key={u.id} className="friend-item">
                  <div className="friend-info">
                    <div className="friend-name">{u.name}</div>
                    <div className="friend-email">{u.email}</div>
                  </div>
                  <button 
                    className="friend-btn accept" 
                    onClick={async()=>{ 
                      await api.post("/api/friends/request",{to_user_id:u.id}); 
                      toast("Request sent"); 
                      refresh(); 
                    }}
                  >
                    Add Friend
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="friends-section">
            <h3 className="section-title">
              <span className="section-icon">⏳</span>
              Pending Requests
            </h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
              <div>
                <h4 style={{color: 'var(--text)', marginBottom: '12px', fontSize: '1rem'}}>Incoming</h4>
                {inbound.length === 0 ? (
                  <div style={{color: 'var(--muted)', fontSize: '.9rem'}}>No incoming requests</div>
                ) : (
                  inbound.map(r =>
                    <div key={r.request_id} className="friend-item">
                      <div className="friend-info">
                        <div className="friend-name">{r.name}</div>
                        <div className="friend-email">{r.email}</div>
                      </div>
                      <div className="friend-actions">
                        <button 
                          className="friend-btn accept" 
                          onClick={async()=>{ 
                            await api.post("/api/friends/respond",{request_id:r.request_id, action:"accept"}); 
                            toast("Friend added"); 
                            refresh(); 
                          }}
                        >
                          Accept
                        </button>
                        <button 
                          className="friend-btn decline" 
                          onClick={async()=>{ 
                            await api.post("/api/friends/respond",{request_id:r.request_id, action:"decline"}); 
                            refresh(); 
                          }}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
              
              <div>
                <h4 style={{color: 'var(--text)', marginBottom: '12px', fontSize: '1rem'}}>Outgoing</h4>
                {outbound.length === 0 ? (
                  <div style={{color: 'var(--muted)', fontSize: '.9rem'}}>No pending requests</div>
                ) : (
                  outbound.map(r =>
                    <div key={r.request_id} className="friend-item" style={{opacity: 0.7}}>
                      <div className="friend-info">
                        <div className="friend-name">Pending → {r.name}</div>
                        <div className="friend-email">{r.email}</div>
                      </div>
                      <div style={{color: 'var(--muted)', fontSize: '.8rem'}}>Waiting...</div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="friends-section">
            <h3 className="section-title">
              <span className="section-icon">🤝</span>
              All Friends
            </h3>
            {friends.length === 0 ? (
              <div style={{textAlign: 'center', padding: '20px', color: 'var(--muted)'}}>
                No friends yet. Start connecting!
              </div>
            ) : (
              friends.map(f => 
                <div key={f.id} className="friend-item">
                  <div className="friend-info">
                    <div className="friend-name">{f.name}</div>
                    <div className="friend-email">{f.email}</div>
                  </div>
                  <div style={{color: 'var(--accent)', fontSize: '.8rem', fontWeight: '600'}}>Connected</div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
