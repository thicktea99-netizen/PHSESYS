// src/components/TopBar.tsx
import '../styles/TopBar.css';

export default function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <h2>ThickConsult </h2>
      </div>
      <div className="topbar-right">
        <span className="user-profile">Welcome, Thick</span>
      </div>
    </header>
  );
}