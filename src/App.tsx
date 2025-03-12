import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateLab from "./pages/CreateLab";
import CreateExperiment from "./pages/CreateExperiment";
import CreateSimulation from "./pages/CreateSimulation";
import SimulationBuilder from "./pages/SimulationBuilder";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";
import ExperimentLibrary from "./pages/ExperimentLibrary";
import LabDetails from "./pages/LabDetails";
import Feedback from "./pages/Feedback";
import ExperimentDetails from "./pages/ExperimentDetails";

// Components
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// function Onboarding() {return(
//   <div>
//     <p>hellow onboard</p>
//   </div>
// )}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create-lab" element={<CreateLab />} />
              <Route path="/create-experiment" element={<CreateExperiment />} />
              <Route path="/create-simulation" element={<CreateSimulation />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              <Route
                path="/experiment-library"
                element={<ExperimentLibrary />}
              />
              <Route path="/lab/:id" element={<LabDetails />} />
              <Route path="/lab/:labId/feedback" element={<Feedback />} />
              <Route path="/experiment/:id" element={<ExperimentDetails />} />
            </Route>
            <Route
              path="/create-simulation/simulation-builder"
              element={<SimulationBuilder />}
            />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
