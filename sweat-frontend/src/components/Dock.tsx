import { clsx } from "clsx";

type View = "track" | "sessions" | "friends" | "feed";

type Props = {
    view: View;
    setView: (v: View) => void;
};

const items = [
    { key: "track", icon: "◉", label: "Focus" },
    { key: "sessions", icon: "◎", label: "Journal" },
    { key: "friends", icon: "○", label: "Tribe" },
    { key: "feed", icon: "◈", label: "Pulse" },
];

export default function Dock({ view, setView }: Omit<Props, 'guest'>) {
    return (
        <div className="dock-container glass-panel">
            {items.map((item) => {
                // Unlock all tabs for guests (Demo Mode)
                const isActive = view === item.key;
                return (
                    <button
                        key={item.key}
                        className={clsx("dock-item", isActive && "active")}
                        onClick={() => setView(item.key as View)}
                        style={{ flexDirection: 'column', gap: 4 }}
                    >
                        <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                        {isActive && <span style={{ fontSize: '0.6rem', letterSpacing: 1, textTransform: 'uppercase' }}>{item.label}</span>}
                    </button>
                );
            })}
        </div>
    );
}
