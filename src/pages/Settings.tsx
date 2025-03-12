import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Settings as SettingsIcon, Save, X } from "lucide-react";
import { RootState } from "../store";
import { updateUserSettings } from "../store/slices/authSlice";

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  const [settings, setSettings] = useState({
    preferredLLM: "deepseek", // Default to deepseek
  });

  useEffect(() => {
    // Initialize settings from user data if available
    if (user?.settings) {
      setSettings(user.settings);
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await dispatch(updateUserSettings(settings));
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <SettingsIcon className="h-6 w-6 text-indigo-500 mr-2" />
            <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="preferredLLM"
              className="block text-sm font-medium text-gray-700"
            >
              Preferred AI Model
            </label>
            <select
              id="preferredLLM"
              name="preferredLLM"
              value={settings.preferredLLM}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="deepseek">Deepseek (Default)</option>
              <option value="openai">OpenAI GPT</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Select which AI model to use for generating simulations and other
              AI features.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? (
                <div className="mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
