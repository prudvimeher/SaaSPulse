
import { NavLink } from "react-router-dom";
import {
  House,
  ChartNoAxesColumn,
  Users,
  TrendingUp,
  UserRound,
  Star,
  Settings,
  CircleHelp,
} from "lucide-react";

const navigation = [
  { label: "Executive Overview", path: "/", icon: House },
  { label: "Revenue Intelligence", path: "/revenue", icon: ChartNoAxesColumn },
  { label: "Customer Retention", path: "/retention", icon: Users },
  { label: "Customer Growth", path: "/growth", icon: TrendingUp },
  { label: "Customer 360", path: "/customers", icon: UserRound },
];

const favorites = [
  { label: "Revenue Trends", path: "/revenue" },
  { label: "Churn Analysis", path: "/retention" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <ChartNoAxesColumn size={28} />
        <span>SaaSPulse</span>
      </div>

      <nav className="sidebar-navigation">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-section">
        <p className="sidebar-heading">Favorites</p>

        {favorites.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="nav-link favorite-link"
          >
            <Star size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="sidebar-bottom">
        <div className="nav-link">
          <Settings size={19} />
          <span>Settings</span>
        </div>

        <div className="nav-link">
          <CircleHelp size={19} />
          <span>Help & Support</span>
        </div>
      </div>
    </aside>
  );
}
