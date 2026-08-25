interface TopBarProps {
  userEmail: string;
  onLogout: () => void;
}

export default function TopBar({ userEmail, onLogout }: TopBarProps) {
  return (
    <header className="topbar">
      <div className="topbar__brand">
        <span className="topbar__mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="20" height="20">
            <rect width="32" height="32" rx="8" fill="var(--brand-deep)" />
            <path d="M9 23V9h14v3.4H12.6v5.2H21v3.4h-8.4V23H9z" fill="var(--brand-glow)" />
          </svg>
        </span>
        <span className="topbar__name">fineto</span>
        <span className="topbar__divider" />
        <span className="topbar__product">Feedback Intelligence</span>
      </div>

      <div className="topbar__right">
        <div className="topbar__status">
          <span className="topbar__pulse" aria-hidden="true" />
          Live
        </div>
        <span className="topbar__divider" />
        <div className="topbar__user">
          <span className="topbar__user-email">{userEmail}</span>
          <button type="button" className="topbar__logout" onClick={onLogout}>
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}