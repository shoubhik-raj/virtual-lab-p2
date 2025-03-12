import React, { useEffect, useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { checkAuthStatus } from "../store/slices/authSlice";

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading, user } = useSelector(
    (state: RootState) => state.auth
  );
  const dispatch = useDispatch();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      setIsChecking(true);
      try {
        // Dispatch the checkAuthStatus action and wait for it to complete
        await dispatch(checkAuthStatus()).unwrap();
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsChecking(false);
      }
    };

    verifyAuth();
  }, [dispatch]);

  // Show loading state while checking authentication
  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is authenticated but not onboarded, redirect to onboarding
  if (isAuthenticated && user && !user.isOnboarded) {
    console.log("NOT ONB");
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
