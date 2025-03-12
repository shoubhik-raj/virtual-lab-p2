import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Settings } from "lucide-react";
import { RootState } from "../store";
import { logoutUser } from "../store/slices/authSlice";

const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <header className="bg-white py-4 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and Initiative Text */}
        <div className="flex items-center space-x-8">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            <img
              src="/assets/img/vlabs-color-small-moe.png"
              alt="Virtual Labs"
              className="h-14 p-1"
            />
          </div>
          <div className="hidden md:block text-gray-600 border-l border-gray-300 pl-8">
            An MoE Govt of India Initiative
          </div>
        </div>

        {/* Center Button */}
        <div className="hidden md:block">
          <p className="bg-blue-500 text-white px-6 py-2 rounded-lg">
            Creator's Platform
          </p>
        </div>

        {/* Right Side Navigation */}
        <div className="flex items-center space-x-8">
          <button className="hidden md:block text-gray-700 hover:text-gray-900">
            Get Support
          </button>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-3 focus:outline-none"
            >
              <span className="hidden md:block">{user?.name || "User"}</span>
              <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-200">
                <img
                  src={
                    user?.avatar ||
                    "https://placehold.co/100/4f46e5/ffffff?text=User"
                  }
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate("/profile");
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate("/settings");
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
