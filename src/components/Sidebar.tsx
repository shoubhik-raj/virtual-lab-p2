import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  FlaskConical as Flask,
  TestTube,
  Atom,
  Settings,
  Users,
  BookOpen,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  return (
    <aside
      className={`bg-indigo-700 text-white w-64 min-h-screen flex flex-col transition-all duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 fixed md:relative z-30`}
    >
      <div className="p-4 border-b border-indigo-600">
        <div className="flex items-center justify-center">
          <Atom className="h-8 w-8 mr-2" />
          <h2 className="text-xl font-bold">Virtual Labs</h2>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm ${
                  isActive
                    ? "bg-indigo-800 text-white"
                    : "text-indigo-100 hover:bg-indigo-600"
                }`
              }
            >
              <Home className="h-5 w-5 mr-3" />
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/create-lab"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm ${
                  isActive
                    ? "bg-indigo-800 text-white"
                    : "text-indigo-100 hover:bg-indigo-600"
                }`
              }
            >
              <Flask className="h-5 w-5 mr-3" />
              Create Lab
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/create-experiment"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm ${
                  isActive
                    ? "bg-indigo-800 text-white"
                    : "text-indigo-100 hover:bg-indigo-600"
                }`
              }
            >
              <TestTube className="h-5 w-5 mr-3" />
              Create Experiment
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/create-simulation"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm ${
                  isActive
                    ? "bg-indigo-800 text-white"
                    : "text-indigo-100 hover:bg-indigo-600"
                }`
              }
            >
              <Atom className="h-5 w-5 mr-3" />
              Create Simulation
            </NavLink>
          </li>
        </ul>

        <div className="pt-4 mt-6 border-t border-indigo-600">
          <ul className="space-y-1">
            <li>
              <a
                href="#"
                className="flex items-center px-4 py-3 text-sm text-indigo-100 hover:bg-indigo-600"
              >
                <Users className="h-5 w-5 mr-3" />
                My Team
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center px-4 py-3 text-sm text-indigo-100 hover:bg-indigo-600"
              >
                <BookOpen className="h-5 w-5 mr-3" />
                Documentation
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center px-4 py-3 text-sm text-indigo-100 hover:bg-indigo-600"
              >
                <Settings className="h-5 w-5 mr-3" />
                Settings
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
