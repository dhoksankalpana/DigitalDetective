import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  FileSearch,
  Users,
  Bell,
  UserCircle,
  Shield,
  Lightbulb,
  CalendarDays,
  FileText,
  Search,
  X,
  ListChecks,
  BarChart3,
  GitBranch,
  MapPinned,
} from "lucide-react";

import "./Sidebar.css";

function Sidebar({ isOpen, onClose }) {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Cases",
      path: "/cases",
      icon: Briefcase,
    },
    {
      name: "Evidence",
      path: "/evidence",
      icon: FileSearch,
    },
    {
      name: "Suspects",
      path: "/suspects",
      icon: Users,
    },
    {
      name: "Investigations",
      path: "/investigations",
      icon: Shield,
    },
    {
      name: "Tasks",
      path: "/tasks",
      icon: ListChecks,
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: BarChart3,
    },
    {
  name: "Evidence Graph",
  path: "/evidence-graph",
  icon: GitBranch,
},
{
  name: "Crime Scene",
  path: "/crime-scene",
  icon: MapPinned,
},
    {
      name: "Global Search",
      path: "/search",
      icon: Search,
    },
    {
      name: "Clues",
      path: "/clues",
      icon: Lightbulb,
    },
    {
      name: "Timeline",
      path: "/timeline",
      icon: CalendarDays,
    },
    {
      name: "Case Notes",
      path: "/notes",
      icon: FileText,
    },
    {
      name: "Notifications",
      path: "/notifications",
      icon: Bell,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: UserCircle,
    },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        ></div>
      )}

      <aside
        className={`sidebar ${
          isOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="sidebar-header">
          <NavLink
            to="/"
            className="sidebar-brand-link"
            onClick={onClose}
          >
            <div className="sidebar-brand">
              <div className="sidebar-logo">
                <Shield size={22} />
              </div>

              <div>
                <h2>DigitalDetective</h2>
                <span>COMMAND CENTER</span>
              </div>
            </div>
          </NavLink>

          <button
            className="sidebar-close"
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-title">
            MAIN MENU
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-link ${
                    isActive ? "active" : ""
                  }`
                }
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-status">
            <span className="status-dot"></span>

            <div>
              <strong>System Online</strong>
              <small>All systems operational</small>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;