import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Github, Atom } from "lucide-react";
import { RootState } from "../store";
import { API_URL } from "../../constants";
import { checkAuthStatus } from "../store/slices/authSlice";

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    console.log(isAuthenticated);
    if (isAuthenticated) {
      dispatch(checkAuthStatus());
    }
  }, [isAuthenticated, dispatch]);

  if (isAuthenticated && !loading) {
    console.log("AUTHENTICATED ", isAuthenticated);
    return <Navigate to="/dashboard" replace />;
  }

  const handleGithubLogin = () => {
    window.location.href = `${API_URL}/auth/github`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            {/* <Atom className="h-16 w-16 text-indigo-600" /> */}
            <img src="/assets/img/vlabs-color-small-moe.png" alt="logo" className="h-24" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Virtual Labs Creator Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create labs, experiments, and simulations without coding
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm">
            <button
              onClick={handleGithubLogin}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <Github className="h-5 w-5 text-gray-500 group-hover:text-gray-400" />
              </span>
              Sign in with GitHub
            </button>
          </div>

          <div className="text-center text-sm">
            <p className="text-gray-600">
              By signing in, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
