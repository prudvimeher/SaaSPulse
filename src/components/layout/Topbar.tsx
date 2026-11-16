
import { Search, Bell, ChevronDown } from "lucide-react";

export default function Topbar() {
  return (
    <header className="topbar">
      <div className="search-container">
        <Search size={19} />

        <input
          type="text"
          placeholder="Search for customers, plans, or metrics..."
        />

        <span className="search-shortcut">⌘ K</span>
      </div>

      <div className="topbar-actions">
        <button className="icon-button" aria-label="Notifications">
          <Bell size={21} />
        </button>

        <div className="profile">
          <div className="avatar">A</div>

          <div className="profile-info">
            <strong>Alex Carter</strong>
            <span>Founder & CEO</span>
          </div>

          <ChevronDown size={17} />
        </div>
      </div>
    </header>
  );
}
