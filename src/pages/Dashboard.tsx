import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  FlaskConical as Flask,
  TestTube,
  Atom,
  ArrowRight,
  Plus,
  Building,
} from "lucide-react";
import { RootState } from "../store";
import { fetchLabs } from "../store/slices/labsSlice";
import { fetchSimulations } from "../store/slices/simulationsSlice";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { labs, loading: labsLoading } = useSelector(
    (state: RootState) => state.labs
  );
  const { simulations, loading: simulationsLoading } = useSelector(
    (state: RootState) => state.simulations
  );

  useEffect(() => {
    dispatch(fetchLabs());
    dispatch(fetchSimulations());
  }, [dispatch]);

  const createOptions = [
    {
      title: "Create Lab",
      description: "Set up a new virtual lab with experiments",
      icon: <Flask className="h-6 w-6 text-gray-800" />,
      path: "/create-lab",
    },
    {
      title: "Create Experiment",
      description: "Add a new experiment to an existing lab",
      icon: <TestTube className="h-6 w-6 text-gray-800" />,
      path: "/create-experiment",
    },
    {
      title: "Create Simulation",
      description: "Build an interactive simulation with AI",
      icon: <Atom className="h-6 w-6 text-gray-800" />,
      path: "/create-simulation",
    },
  ];

  // Sample experiment data for the library section
  const experimentLibrary = [
    {
      id: 1,
      title: "Familiarization with general bread board",
      image:
        "https://www.swamivivekanandauniversity.ac.in/resource/assets/img/electronic-eng.png",
      institution: "IIT Bombay",
    },
    {
      id: 2,
      title: "Familiarisation of ICs.",
      image:
        "https://www.swamivivekanandauniversity.ac.in/resource/assets/img/electronic-eng.png",
      institution: "IIT Bombay",
    },
    {
      id: 3,
      title: "Generation of clock using NAND and NOR gate",
      image:
        "https://www.swamivivekanandauniversity.ac.in/resource/assets/img/electronic-eng.png",
      institution: "IIT Bombay",
    },
  ];

  return (
    <div className="space-y-12 max-w-7xl mx-auto ">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-800">
          Welcome, {user?.name || "User"}!
        </h1>
        <p className="text-gray-600 mt-6">
          Create and manage your virtual labs, experiments, and simulations.
        </p>
      </div>

      {/* Creation Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {createOptions.map((option, index) => (
          <div
            key={index}
            className="bg-blue-50 rounded-xl p-10 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(option.path)}
          >
            <div className="flex items-center justify-between">
              <div className="bg-blue-100 p-3 rounded-lg shadow-sm">
                {option.icon}
              </div>
              <ArrowRight className="h-5 w-5 text-gray-500" />
            </div>
            <h2 className="text-lg font-semibold mt-6">{option.title}</h2>
            <p className="text-gray-600 mt-2">{option.description}</p>
          </div>
        ))}
      </div>

      {/* Experiment Library Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Experiment Library</h2>
          <button
            onClick={() => navigate("/experiment-library")}
            className="flex items-center font-semibold text-blue-600 hover:text-blue-700"
          >
            SEE ALL EXPERIMENTS <ArrowRight className="ml-1 h-5 w-5" />
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          Archive of all the experiments published previously on the platform
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {experimentLibrary.map((experiment) => (
            <div
              key={experiment.id}
              className="bg-gray-50 p-3 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            >
              <img
                src={experiment.image}
                alt={experiment.title}
                className="w-full h-48 object-cover rounded-lg"
                onClick={() => navigate(experiment.title)}
              />
              <div className="p-5">
                <h3 className="font-medium text-lg text-gray-900">
                  {experiment.title}
                </h3>
                <div className="flex items-center mt-4">
                  <Building className="h-4 w-4 text-gray-500 mr-2" />
                  <span
                    className="text-sm text-gray-600 hover:text-gray-700 transition-colors"
                    onClick={() =>
                      navigate(`/institution/${experiment.institution}`)
                    }
                  >
                    {experiment.institution}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
