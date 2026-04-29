import useStore from '../stores/useStore';

export default function Header() {
  const { darkMode, reducedMotion, toggleDarkMode, toggleReducedMotion } = useStore();

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="#00E5FF" strokeWidth="2" />
            <circle cx="10" cy="12" r="3" fill="#00E5FF" />
            <circle cx="22" cy="12" r="3" fill="#A259FF" />
            <circle cx="16" cy="22" r="3" fill="#00E5FF" />
            <line x1="10" y1="12" x2="16" y2="22" stroke="#00E5FF" strokeWidth="1" opacity="0.5" />
            <line x1="22" y1="12" x2="16" y2="22" stroke="#A259FF" strokeWidth="1" opacity="0.5" />
            <line x1="10" y1="12" x2="22" y2="12" stroke="#00E5FF" strokeWidth="1" opacity="0.5" />
          </svg>
          <span className="logo-text">ThankYou<span className="accent">Network</span></span>
        </div>
      </div>

      <div className="header-right">
        <div className="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input type="text" placeholder="Search people..." aria-label="Search people" />
        </div>

        <button
          className="icon-btn"
          onClick={toggleDarkMode}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        <button
          className={`icon-btn ${reducedMotion ? 'active' : ''}`}
          onClick={toggleReducedMotion}
          aria-label={reducedMotion ? 'Enable animations' : 'Disable animations'}
          title="Reduce motion"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12h8" />
            <path d="M12 8v8" />
          </svg>
        </button>
      </div>
    </header>
  );
}