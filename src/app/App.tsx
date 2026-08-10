import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { AppTab, ChatMessage, DailyContract, Profile, RunSnapshot } from "./types";
import GameCanvas from "../components/GameCanvas";
import { LowWaterGameController } from "../game/LowWaterGame";
import { RoomTransport, type RemotePlayer } from "../lib/multiplayer";
import { loadChat, loadProfile, saveChat, saveProfile } from "../lib/storage";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

const initialSnapshot: RunSnapshot = {
  phase: "running",
  elapsed: 0,
  remaining: 90,
  collected: 0,
  target: 24,
  carriedValue: 0,
  bankedValue: 0,
  combo: 1,
  wave: 3,
  risk: 38,
  totalFinds: 0,
  lastFind: null,
};

const crew = [
  { name: "Moss", role: "YOU", color: "#C6A642", status: "carrying a crate" },
  { name: "Nora", role: "SCOUT", color: "#6C8B91", status: "near the south gate" },
  { name: "Kip", role: "SORTER", color: "#A24E32", status: "watching the table" },
  { name: "Boomer", role: "LOOKOUT", color: "#4C6255", status: "crow trouble, east side" },
];

const defaultContract: DailyContract = {
  title: "RUSTY RELICS",
  detail: "Bank 8 valuable finds before the last window.",
  progress: 6,
  target: 8,
  reward: 350,
};

function formatClock(seconds: number): string {
  const whole = Math.ceil(Math.max(0, seconds));
  return `${Math.floor(whole / 60).toString().padStart(2, "0")}:${(whole % 60).toString().padStart(2, "0")}`;
}

function formatTime(value: string): string {
  return value.includes(":") ? value : "10:23";
}

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>("run");
  const [profile, setProfile] = useState<Profile>(() => loadProfile());
  const [snapshot, setSnapshot] = useState<RunSnapshot>(initialSnapshot);
  const [chat, setChat] = useState<ChatMessage[]>(() => loadChat());
  const [chatDraft, setChatDraft] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [showFoundBook, setShowFoundBook] = useState(false);
  const [showCrew, setShowCrew] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [connectionMode, setConnectionMode] = useState<"local" | "live">("local");
  const [notice, setNotice] = useState("");
  const controllerRef = useRef<LowWaterGameController | null>(null);
  const roomRef = useRef<RoomTransport | null>(null);
  const localPlayerIdRef = useRef(crypto.randomUUID());
  const completedRunRef = useRef(false);

  const contract = useMemo(() => ({
    ...defaultContract,
    progress: Math.min(defaultContract.target, defaultContract.progress + Math.min(snapshot.collected, 2)),
  }), [snapshot.collected]);

  const showNotice = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  }, []);

  const onSnapshot = useCallback((next: RunSnapshot) => {
    setSnapshot(next);
  }, []);

  const onReady = useCallback((controller: LowWaterGameController) => {
    controllerRef.current = controller;
  }, []);

  const onPlayerState = useCallback((position: Pick<RemotePlayer, "x" | "y">) => {
    roomRef.current?.publishPlayer({
      id: localPlayerIdRef.current,
      name: profile.displayName,
      color: "#C6A642",
      ...position,
    });
  }, [profile.displayName]);

  useEffect(() => {
    const room = new RoomTransport("yard-window-03", {
      onPlayer: (player) => {
        if (player.id !== localPlayerIdRef.current) controllerRef.current?.setRemotePlayer(player);
      },
      onChat: (message) => {
        setChat((current) => {
          if (current.some((item) => item.id === message.id)) return current;
          const next = [...current, message].slice(-40);
          saveChat(next);
          return next;
        });
      },
    });
    roomRef.current = room;
    let active = true;
    void room.connect().then((mode) => {
      if (active) setConnectionMode(mode);
    }).catch(() => {
      if (active) {
        setConnectionMode("local");
        showNotice("Live crew is unavailable. Offline-safe mode is still active.");
      }
    });
    return () => {
      active = false;
      room.dispose();
      roomRef.current = null;
    };
  }, [showNotice]);

  useEffect(() => {
    if (snapshot.phase === "extracted" && !completedRunRef.current) {
      completedRunRef.current = true;
      const nextProfile: Profile = {
        ...profile,
        xp: profile.xp + Math.round(snapshot.bankedValue * 1.25 + snapshot.combo * 16),
        bankedFinds: profile.bankedFinds + snapshot.collected,
        completedRuns: profile.completedRuns + 1,
        bestCombo: Math.max(profile.bestCombo, snapshot.combo),
        lastPlayedAt: new Date().toISOString(),
      };
      nextProfile.rank = Math.floor(nextProfile.xp / 400) + 4;
      setProfile(nextProfile);
      saveProfile(nextProfile);
      showNotice("Haul banked. The ledger has been updated.");
    }
  }, [profile, showNotice, snapshot]);

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user.email) {
        setProfile((current) => ({ ...current, id: data.session.user.id, displayName: data.session.user.email!.split("@")[0] }));
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user.email) {
        setProfile((current) => ({ ...current, id: session.user.id, displayName: session.user.email!.split("@")[0] }));
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const submitChat = useCallback(() => {
    const body = chatDraft.trim();
    if (!body) return;
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      author: profile.displayName,
      color: "#C6A642",
      body,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      local: true,
    };
    const next = [...chat, message].slice(-40);
    setChat(next);
    saveChat(next);
    roomRef.current?.sendChat(message);
    setChatDraft("");
  }, [chat, chatDraft, profile.displayName]);

  const handleAuth = useCallback(async () => {
    if (!authEmail.trim()) return;
    if (!supabase) {
      setShowAuth(false);
      showNotice("Guest progress is active here. Add Supabase keys to enable account sync.");
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({ email: authEmail.trim(), options: { emailRedirectTo: window.location.origin } });
    if (error) {
      showNotice(error.message);
      return;
    }
    setShowAuth(false);
    showNotice("Check your inbox for the sign-in link.");
  }, [authEmail, showNotice]);

  const restartRun = useCallback(() => {
    completedRunRef.current = false;
    setSnapshot(initialSnapshot);
    controllerRef.current?.restart();
    showNotice("New window opened. Find the good stuff.");
  }, [showNotice]);

  const bankHaul = useCallback(() => {
    controllerRef.current?.bank();
    showNotice("Haul secured. Combo reset, risk eased.");
  }, [showNotice]);

  const pushTide = useCallback(() => {
    controllerRef.current?.pushTide();
    showNotice("Tide pushed. Better finds, less room for mistakes.");
  }, [showNotice]);

  const extract = useCallback(() => {
    controllerRef.current?.extract();
  }, []);

  const copyInvite = useCallback(async () => {
    const invite = `${window.location.origin}/?room=yard-window-03`;
    try {
      await navigator.clipboard.writeText(invite);
      showNotice("Invite note copied to the clipboard.");
    } catch {
      showNotice("Room window: yard-window-03");
    }
  }, [showNotice]);

  return (
    <div className="app-shell">
      <header className="top-rail">
        <button className="wordmark" onClick={() => setActiveTab("run")} aria-label="Open Low Water run">
          <span className="wordmark-mark" aria-hidden="true">⚓</span>
          <span>LOW WATER</span>
        </button>
        <nav className="primary-nav" aria-label="Primary navigation">
          <button className={activeTab === "run" ? "nav-item active" : "nav-item"} onClick={() => setActiveTab("run")}>RUN</button>
          <button className={activeTab === "crew" ? "nav-item active" : "nav-item"} onClick={() => setShowCrew(true)}>CREW <span className="nav-count">4</span></button>
          <button className={activeTab === "found-book" ? "nav-item active" : "nav-item"} onClick={() => setShowFoundBook(true)}>FOUND BOOK</button>
        </nav>
        <div className="top-status">
          <div className="window-readout"><span>WINDOW</span><strong>03</strong></div>
          <div className="timer-readout"><span>TIME LEFT</span><strong>{formatClock(snapshot.remaining)}</strong></div>
          <div className="rank-readout"><span>RANK {profile.rank}</span><div className="rank-bar"><i style={{ width: `${Math.min(100, (profile.xp % 400) / 4)}%` }} /></div><small>{profile.xp.toLocaleString()} XP</small></div>
          <button className="profile-button" onClick={() => setShowAuth(true)}><span className="profile-stamp">{profile.displayName.slice(0, 1).toUpperCase()}</span><span>{profile.displayName}</span><small>{isSupabaseConfigured ? "SYNCED" : "GUEST"}</small></button>
        </div>
      </header>

      <main className="run-layout">
        <aside className="left-rail">
          <section className="route-card paper-panel">
            <div className="panel-kicker">ROUTE CARD <span>01</span></div>
            <h1>SORT<br /><strong>{Math.max(0, snapshot.target - snapshot.collected)}</strong><em> FINDS</em></h1>
            <p className="route-copy">Chain unlike finds before banking to grow the haul. The yard keeps what you leave behind.</p>
            <div className="rule-dots" />
            <div className="combo-block"><span>COMBO</span><strong>{snapshot.combo.toFixed(1)}</strong><small>{snapshot.collected} picked up / {snapshot.bankedValue} value banked</small></div>
          </section>
          <section className="legend-panel">
            <LegendRow mark="▱" label="SORTING TABLE" />
            <LegendRow mark="≈" label="TIDE GATE" />
            <LegendRow mark="→" label="RETURN ROUTE" />
            <LegendRow mark="×" label="CROW NEST" />
          </section>
          <div className="controls-note"><span>MOVE</span><strong>W A S D</strong><span>COLLECT</span><strong>WALK OVER IT</strong><span>ACTIONS</span><strong>E / Q / X</strong></div>
        </aside>

        <section className="playfield-column">
          <div className="playfield-frame">
            <div className="playfield-label"><span>CANAL YARD / NORTH LOCK</span><strong>LIVE {connectionMode === "live" ? "ROOM" : "LOCAL CREW"}</strong></div>
            <GameCanvas onSnapshot={onSnapshot} onReady={onReady} onPlayerState={onPlayerState} />
            <div className="playfield-footnote">Finds are physical. The timer is not.</div>
          </div>
          <section className="run-footer">
            <div className="haul-readout"><span>HAUL VALUE</span><strong>{(snapshot.carriedValue + snapshot.bankedValue).toString().padStart(3, "0")}</strong><small>◉</small></div>
            <button className="action-button bank" onClick={bankHaul}><span className="action-icon">▱</span><span><strong>BANK HAUL</strong><small>SECURE IT / RESET COMBO</small></span></button>
            <div className="risk-strip"><div className="risk-top"><span>SAFER TIDE</span><span>HIGHER RISK</span></div><div className="risk-line"><i style={{ left: `${snapshot.risk}%` }} /></div><div className="risk-bottom"><small>WINDOW {snapshot.wave.toString().padStart(2, "0")}</small><strong>{snapshot.risk}% EXPOSURE</strong></div></div>
            <button className="action-button push" onClick={pushTide}><span><strong>PUSH TIDE</strong><small>SPEND 50s / BET ON BETTER FINDS</small></span><span className="action-icon">≈</span></button>
            <button className="extract-button" onClick={extract}>EXTRACT <span>↗</span></button>
          </section>
        </section>

        <aside className="right-rail">
          <section className="paper-panel notes-panel">
            <div className="panel-kicker">CREW NOTES <span>FIELD COPY</span></div>
            <p>Keep the parcels dry.<br />Keys turn up where the mud is darkest.<br />Do not chase the crows into the water.</p>
            <div className="note-stamp">LOW WATER<br />MUDLARKS UNION</div>
          </section>
          <section className="paper-panel rota-panel">
            <div className="panel-kicker">DAILY ROTA <span>16:45:51</span></div>
            <h2>{contract.title}</h2>
            <p>{contract.detail}</p>
            <div className="contract-progress"><i style={{ width: `${(contract.progress / contract.target) * 100}%` }} /></div>
            <div className="contract-meta"><strong>{contract.progress} / {contract.target}</strong><span>+{contract.reward} XP</span></div>
          </section>
          <section className="chat-panel">
            <div className="chat-tabs"><span className="selected">CREW</span><span>LOCAL</span><i>{connectionMode === "live" ? "LIVE" : "OFFLINE-SAFE"}</i></div>
            <div className="chat-log" aria-live="polite">
              {chat.slice(-6).map((message) => <div className="chat-message" key={message.id}><span className="chat-author" style={{ color: message.color }}>{message.author}</span><small>{formatTime(message.createdAt)}</small><p>{message.body}</p></div>)}
            </div>
            <form className="chat-form" onSubmit={(event) => { event.preventDefault(); submitChat(); }}><input value={chatDraft} onChange={(event) => setChatDraft(event.target.value)} placeholder="Leave a crew note…" maxLength={120} aria-label="Crew chat message" /><button aria-label="Send crew note">↗</button></form>
          </section>
        </aside>
      </main>

      <div className="crew-strip" aria-label="Crew status">
        <div className="crew-strip-label">CREW / WINDOW 03</div>
        {crew.map((member) => <button className="crew-member" key={member.name} onClick={() => setShowCrew(true)}><span className="crew-avatar" style={{ backgroundColor: member.color }}>{member.name.slice(0, 1)}</span><span><strong>{member.name}</strong><small>{member.role} · {member.status}</small></span></button>)}
        <button className="restart-button" onClick={restartRun}>OPEN NEW WINDOW ↻</button>
      </div>

      {notice && <div className="toast" role="status">{notice}</div>}
      {showAuth && <Modal title={profile.id === "guest-local" ? "KEEP YOUR FINDS" : "ACCOUNT"} onClose={() => setShowAuth(false)}><p className="modal-copy">Guest mode keeps this run on this device. Add an email to sync your rank, collection book, and crew across sessions.</p>{profile.id === "guest-local" && <><label className="field-label" htmlFor="auth-email">EMAIL</label><input className="modal-input" id="auth-email" type="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="you@example.com" /><button className="modal-action" onClick={() => void handleAuth()}>{isSupabaseConfigured ? "SEND MAGIC LINK" : "KEEP PLAYING AS GUEST"}</button></>}{profile.id !== "guest-local" && <button className="modal-action" onClick={() => void supabase?.auth.signOut()}>SIGN OUT</button>}<small className="modal-footnote">No password to remember. Supabase Auth is optional and free-tier ready.</small></Modal>}
      {showFoundBook && <Modal title="FOUND BOOK" onClose={() => setShowFoundBook(false)}><div className="found-summary"><span className="found-number">{profile.bankedFinds}</span><span>objects banked</span></div><div className="found-grid"><FoundEntry label="BRASS KEYS" value="12 / 20" mark="⌘" /><FoundEntry label="GLASS FINDS" value="24 / 40" mark="◌" /><FoundEntry label="STAMPED PARCELS" value="18 / 30" mark="▱" /><FoundEntry label="RUSTY RELICS" value="09 / 16" mark="✶" /></div><p className="modal-copy">Complete the book to unlock workwear dyes, new yard routes, and the right to name a crew window.</p></Modal>}
      {showCrew && <Modal title="CREW ROOM" onClose={() => setShowCrew(false)}><div className="crew-room-list">{crew.map((member) => <div className="crew-room-row" key={member.name}><span className="crew-avatar" style={{ backgroundColor: member.color }}>{member.name.slice(0, 1)}</span><span><strong>{member.name}</strong><small>{member.role}</small></span><em>{member.status}</em></div>)}</div><button className="modal-action" onClick={() => { setShowCrew(false); void copyInvite(); }}>COPY INVITE NOTE</button></Modal>}
    </div>
  );
}

function LegendRow({ mark, label }: { mark: string; label: string }) {
  return <div className="legend-row"><span>{mark}</span><small>{label}</small></div>;
}

function FoundEntry({ label, value, mark }: { label: string; value: string; mark: string }) {
  return <div className="found-entry"><span>{mark}</span><div><strong>{label}</strong><small>{value}</small></div></div>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="modal" role="dialog" aria-modal="true" aria-label={title}><button className="modal-close" onClick={onClose} aria-label="Close">×</button><div className="panel-kicker">LOW WATER / LEDGER</div><h2>{title}</h2>{children}</section></div>;
}
