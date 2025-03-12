import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchInstitutions } from "../store/slices/institutionsSlice";
import { completeOnboarding } from "../store/slices/authSlice";
import { RootState } from "../store";
import { ChevronDown } from "lucide-react";

const Onboarding: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { institutions, loading } = useSelector(
    (state: RootState) => state.institutions
  );

  const [formData, setFormData] = useState({
    email: user?.email || "",
    institution: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch institutions when component mounts
  useEffect(() => {
    console.log("ONBOARD")

    dispatch(fetchInstitutions());
  }, [dispatch]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await dispatch(completeOnboarding(formData)).unwrap();
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
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

            {/* GitHub Info */}
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Github Username @{user?.githubUsername || "username"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Email Address */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Your Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
            placeholder="email@example.com"
            disabled
            required
          />
        </div>

        {/* Institution Name */}
        <div>
          <label
            htmlFor="institution"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Institution Name
          </label>
          <div className="relative">
            {loading ? (
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                Loading institutions...
              </div>
            ) : (
              <>
                <select
                  id="institution"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="" disabled>
                    Select Institute
                  </option>
                  {institutions.map((inst) => (
                    <option key={inst._id} value={inst.name}>
                      {inst.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5 pointer-events-none" />
              </>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2 disabled:bg-blue-300"
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>Save Profile</span>
                <span className="ml-1">→</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Onboarding;
