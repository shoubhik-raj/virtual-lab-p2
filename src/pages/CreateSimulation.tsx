import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { generateAIPrompt } from "../store/slices/simulationsSlice";
import { fetchUserExperiments } from "../store/slices/experimentsSlice";
import { RootState } from "../store";
import { ArrowRight, Upload, Loader2 } from "lucide-react";

const CreateSimulation: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { experiments } = useSelector((state: RootState) => state.experiments);

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    department: "",
    course: "",
    description: "",
    complexity: "Low. Basic visualisation. Few adjustable parameters", // Default to low complexity
    file: null,
    experimentId: "",
  });

  // Add loading state
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchUserExperiments());
    console.log("EXPOJREJ : ", experiments);
  }, [dispatch]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({ ...prev, file: e.target.files[0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Set loading state to true
    setIsLoading(true);

    try {
      const { file, ...data } = formData;

      const response = await dispatch(generateAIPrompt(data)).unwrap();
      console.log("Full response:", response);

      // Ensure we use the original form data as fallback when response data is empty
      const navigationData = {
        response: response.prompt, // The AI-generated prompt
        name: formData.name, // Always use the original name from the form
        subject: formData.subject, // Always use the original subject from the form
        department: formData.department, // Always use the original department from the form
        details: formData.description, // Use the original description as details
        experimentId: formData.experimentId, // The ID of the selected experiment
        course: formData.course, // The selected course
      };

      console.log("Navigating with data:", navigationData);
      navigate("/create-simulation/simulation-builder", {
        state: navigationData,
      });
    } catch (error) {
      console.error("Error generating simulation:", error);
      alert("Failed to generate simulation. Please try again.");
    } finally {
      // Reset loading state even if there was an error
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Main Content */}
      <h1 className="text-2xl font-semibold text-gray-800 mb-8">
        Create new simulation
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Name of Simulation */}
          <div>
            <label className="block font-semibold text-gray-700 mb-4">
              Name of Simulation
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter name here"
              className="w-full text-sm px-6 py-4 rounded-md border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Simulation Experiment(Experiment) */}
          <div>
            <label className="block font-semibold text-gray-700 mb-4">
              Experiment
            </label>
            <select
              name="experimentId"
              value={formData.experimentId}
              onChange={handleChange}
              required
              className="w-full text-sm px-6 py-4 rounded-md border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="">Select Experiment</option>
              {experiments.map((experiment) => (
                <option key={experiment._id} value={experiment._id}>
                  {experiment.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Subject and Department Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Subject Field */}
          <div>
            <label className="block font-semibold text-gray-700 mb-4">
              Simulation Subject
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              placeholder="Enter subject (e.g., Optics, Thermodynamics, Mechanics)"
              className="w-full text-sm px-6 py-4 rounded-md border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Simulation Department */}
          <div>
            <label className="block font-semibold text-gray-700 mb-4">
              Simulation Department
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="w-full text-sm px-6 py-4 rounded-md border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="">Select Department</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electronics">Electronics</option>
            </select>
          </div>
        </div>

        {/* Course Field - Full Width */}

        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold text-gray-700 mb-4">
              Course
            </label>
            <select
              name="course"
              value={formData.course}
              onChange={handleChange}
              required
              className="w-full text-sm px-6 py-4 rounded-md border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="">Select Course</option>
              <option value="Engineeering">Engineering</option>
              <option value="Undergraduate - Second Year">
                Undergraduate - Second Year
              </option>
              <option value="Undergraduate - Third Year">
                Undergraduate - Third Year
              </option>
              <option value="Undergraduate - Fourth Year">
                Undergraduate - Fourth Year
              </option>
              <option value="Postgraduate - First Year">
                Postgraduate - First Year
              </option>
              <option value="Postgraduate - Second Year">
                Postgraduate - Second Year
              </option>
              <option value="PhD Program">PhD Program</option>
              <option value="High School">High School</option>
            </select>
          </div>
        </div>

        {/* Simulation Description */}
        <div className="mb-6">
          <label className="block font-semibold text-gray-700 mb-4">
            Simulation Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Describe your simulation in as simple words as you can"
            className="w-full text-sm px-4 py-3 rounded-md border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Simulation Complexity Level */}
          <div>
            <label className="block font-semibold text-gray-700 mb-6">
              Simulation Complexity Level
            </label>
            <div className="space-y-0">
              <label className="flex text-sm font-semibold items-center p-5 border-2 rounded-tr-md rounded-tl-md cursor-pointer">
                <input
                  type="radio"
                  name="complexity"
                  value="Low. Basic visualisation. Few adjustable parameters"
                  checked={
                    formData.complexity ===
                    "Low. Basic visualisation. Few adjustable parameters"
                  }
                  onChange={handleChange}
                  className="form-radio h-5 w-5 text-blue-500 mr-3"
                />
                <span className="text-gray-700">
                  Low. Basic visualisation. Few adjustable parameters
                </span>
              </label>

              <label className="flex text-sm font-semibold items-center p-5 border-2 border-y-0 cursor-pointer">
                <input
                  type="radio"
                  name="complexity"
                  value="Medium. Multiple interactive elements"
                  checked={
                    formData.complexity ===
                    "Medium. Multiple interactive elements"
                  }
                  onChange={handleChange}
                  className="form-radio h-5 w-5 text-blue-500 mr-3"
                />
                <span className="text-gray-700">
                  Medium. Multiple interactive elements
                </span>
              </label>

              <label className="flex text-sm font-semibold items-center p-5 border-2 rounded-br-md rounded-bl-md cursor-pointer">
                <input
                  type="radio"
                  name="complexity"
                  value="High. Complex interactions and calculations. Real time feedback"
                  checked={
                    formData.complexity ===
                    "High. Complex interactions and calculations. Real time feedback"
                  }
                  onChange={handleChange}
                  className="form-radio h-5 w-5 text-blue-500 mr-3"
                />
                <span className="text-gray-700">
                  High. Complex interactions and calculations. Real time
                  feedback
                </span>
              </label>
            </div>
          </div>

          {/* Attach File */}
          {!user?.settings?.deepSeek && (
            <div>
              <label className="block font-semibold text-gray-700 mb-6">
                Attach File
              </label>
              <div className="border-2 border-gray-300 rounded-md p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 bg-white">
                <Upload className="h-6 w-6 text-gray-500 mb-3" />
                <p className="text-sm text-gray-600 mb-2 text-center">
                  Upload from computer (image, PDF or document)
                </p>
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-blue-500 text-sm font-medium"
                >
                  Browse files
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Generate Simulation Button */}
        <div className="flex justify-end mt-8">
          <button
            type="submit"
            disabled={isLoading}
            className={`bg-blue-500 ${
              isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-600"
            } text-white font-medium py-4 px-10 rounded-md flex items-center justify-between min-w-[250px]`}
          >
            <span>{isLoading ? "Generating..." : "Generate Simulation"}</span>
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ArrowRight className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSimulation;
