import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { Building, ChevronDown, FlaskConical, School } from "lucide-react";
import { fetchUserLabs } from "../store/slices/labsSlice";
import { fetchUserExperiments } from "../store/slices/experimentsSlice";
import { Link } from "react-router-dom";
import { SERVER_URL } from "../../constants";

const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { labs } = useSelector((state: RootState) => state.labs);
  const { experiments } = useSelector((state: RootState) => state.experiments);
  const [activeTab, setActiveTab] = useState("experiments");

  useEffect(() => {
    dispatch(fetchUserLabs());
    dispatch(fetchUserExperiments());
  }, [dispatch]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Profile Image */}
          <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200">
            <img
              src={
                user?.avatar ||
                "https://placehold.co/300/4f46e5/ffffff?text=User"
              }
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 text-center md:text-left">
              {user?.name || "User Name"}
            </h1>
            <p className="text-gray-600 mt-1 text-center md:text-left">
              {user?.email || "user@example.com"}
            </p>

            {/* Institution and GitHub Info */}
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="relative">
                <button className="flex items-center justify-between w-full md:w-56 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-gray-500" />
                    <span>{user?.institution || "Institution"}</span>
                  </div>
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Github Username @{user?.githubUsername || "username"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("experiments")}
          className={`py-3 px-6 font-medium ${
            activeTab === "experiments"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Manage Experiments
        </button>
        <button
          onClick={() => setActiveTab("labs")}
          className={`py-3 px-6 font-medium ${
            activeTab === "labs"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Manage Labs
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === "experiments" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {experiments.map((experiment) => (
            <Link
              to={`/experiment/${experiment._id}`}
              key={experiment._id}
              className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              {experiment.thumbnail && (
                <img
                  src={`${SERVER_URL}${experiment.thumbnail}`}
                  alt={experiment.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 text-lg">
                  {experiment.name}
                </h3>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2" dangerouslySetInnerHTML={{ __html: experiment.aim}}>
                </p>
                <div className="flex items-center mt-4">
                  <School className="h-4 w-4 text-indigo-500 mr-2" />
                  <span className="text-sm text-gray-600">
                    {experiment.institution}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {labs.map((lab) => (
            <Link
              to={`/lab/${lab._id}`}
              key={lab._id}
              className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              {lab.thumbnail && (
                <img
                  src={`${SERVER_URL}${lab.thumbnail}`}
                  alt={lab.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 text-lg">
                  {lab.name}
                </h3>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2" dangerouslySetInnerHTML={{__html: lab.description}}>
                </p>
                <div className="flex items-center mt-4">
                  <School className="h-4 w-4 text-indigo-500 mr-2" />
                  <span className="text-sm text-gray-600">
                    {lab.institution}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
