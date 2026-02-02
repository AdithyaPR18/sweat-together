import { clsx } from "clsx";

type View = "track" | "sessions" | "friends" | "feed";

type Props = {
    view: View;
    setView: (v: View) => void;
    guest: boolean;
};

const items = [
    { key: "track", icon: "◉", label: "Focus" },
    { key: "sessions", icon: "◎", label: "Journal" },
    { key: "friends", icon: "○", label: "Tribe" },
    { key: "feed", icon: "◈", label: "Pulse" },
];

export default function Dock({ view, setView, guest }: Props) {
    return (
        <div className="dock-container glass-panel">
            {items.map((item) => {
                const disabled = guest && item.key !== "track";
                return (
                    <button
                        key={item.key}
                        className={clsx("dock-item", view === item.key && "active")}
                        onClick={() => !disabled && setView(item.key as View)}
                        style={{ opacity: disabled ? 0.3 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
                    >
                        {item.icon}
                        <div className="dock-tooltip">
                            {disabled ? "Sign in to access" : item.label}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
