import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Atom, Save, X, Upload, Wand2, Code, Play } from "lucide-react";
import { Editor } from "@monaco-editor/react";
import {
  generateAIPrompt,
  generateSimulationCode,
  saveSimulation,
  updateGeneratedCode,
  updateGeneratedPrompt,
} from "../store/slices/simulationsSlice";
import { RootState } from "../store";

const CreateSimulation: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, generatedPrompt, generatedCode } = useSelector(
    (state: RootState) => state.simulations
  );

  const [activeTab, setActiveTab] = useState<
    "planner" | "prompt" | "code" | "preview"
  >("planner");
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    department: "",
    topic: "",
    details: "",
    complexity: "medium",
    interactivity: "medium",
  });

  const [files, setFiles] = useState<File[]>([]);
  const [localPrompt, setLocalPrompt] = useState("");
  const [localCode, setLocalCode] = useState("");

  useEffect(() => {
    if (generatedPrompt) {
      setLocalPrompt(generatedPrompt);
    }
  }, [generatedPrompt]);

  useEffect(() => {
    if (generatedCode) {
      setLocalCode(generatedCode);
    }
  }, [generatedCode]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setFiles([...files, ...fileArray]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleGeneratePrompt = async () => {
    try {
      await dispatch(generateAIPrompt(formData));
      setActiveTab("prompt");
    } catch (error) {
      console.error("Failed to generate AI prompt:", error);
    }
  };

  const handleGenerateCode = async () => {
    try {
      await dispatch(generateSimulationCode(localPrompt));
      setActiveTab("code");
    } catch (error) {
      console.error("Failed to generate simulation code:", error);
    }
  };

  const handleSaveSimulation = async () => {
    try {
      const simulationData = {
        ...formData,
        prompt: localPrompt,
        code: localCode,
      };

      await dispatch(saveSimulation(simulationData));

      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to save simulation:", error);
    }
  };

  const handlePromptChange = (value: string | undefined) => {
    if (value !== undefined) {
      setLocalPrompt(value);
      dispatch(updateGeneratedPrompt(value));
    }
  };

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setLocalCode(value);
      dispatch(updateGeneratedCode(value));
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Atom className="h-6 w-6 text-purple-500 mr-2" />
            <h1 className="text-2xl font-bold text-gray-800">
              Create New Simulation
            </h1>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-3 px-4 text-center font-medium text-sm ${
              activeTab === "planner"
                ? "text-indigo-600 border-b-2 border-indigo-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("planner")}
          >
            Simulation Planner
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center font-medium text-sm ${
              activeTab === "prompt"
                ? "text-indigo-600 border-b-2 border-indigo-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("prompt")}
          >
            AI Prompt
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center font-medium text-sm ${
              activeTab === "code"
                ? "text-indigo-600 border-b-2 border-indigo-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("code")}
          >
            Code Editor
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center font-medium text-sm ${
              activeTab === "preview"
                ? "text-indigo-600 border-b-2 border-indigo-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("preview")}
          >
            Simulation Preview
          </button>
        </div>

        <div className="p-6">
          {activeTab === "planner" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Simulation Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="e.g., Pendulum Motion Simulation"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="e.g., Physics"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="department"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Department *
                  </label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="e.g., Mechanical Engineering"
                  />
                </div>

                <div>
                  <label
                    htmlFor="topic"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Topic *
                  </label>
                  <input
                    type="text"
                    id="topic"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="e.g., Simple Harmonic Motion"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="details"
                  className="block text-sm font-medium text-gray-700"
                >
                  Simulation Details *
                </label>
                <textarea
                  id="details"
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Describe what this simulation should demonstrate, what parameters should be adjustable, and what outputs should be displayed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="complexity"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Complexity Level
                  </label>
                  <select
                    id="complexity"
                    name="complexity"
                    value={formData.complexity}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="low">Low - Basic visualization</option>
                    <option value="medium">
                      Medium - Interactive elements
                    </option>
                    <option value="high">
                      High - Complex interactions and calculations
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="interactivity"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Interactivity Level
                  </label>
                  <select
                    id="interactivity"
                    name="interactivity"
                    value={formData.interactivity}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="low">Low - Few adjustable parameters</option>
                    <option value="medium">
                      Medium - Multiple interactive elements
                    </option>
                    <option value="high">
                      High - Fully interactive with real-time feedback
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Attach Reference Files (optional)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                      >
                        <span>Upload files</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          multiple
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      Images, PDFs, or any reference materials
                    </p>
                  </div>
                </div>

                {files.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700">
                      Attached Files:
                    </h4>
                    <ul className="mt-2 divide-y divide-gray-200 border border-gray-200 rounded-md">
                      {files.map((file, index) => (
                        <li
                          key={index}
                          className="pl-3 pr-4 py-3 flex items-center justify-between text-sm"
                        >
                          <div className="w-0 flex-1 flex items-center">
                            <span className="ml-2 flex-1 w-0 truncate">
                              {file.name}
                            </span>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="font-medium text-red-600 hover:text-red-500"
                            >
                              Remove
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleGeneratePrompt}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {loading ? (
                    <div className="mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  Generate AI Prompt
                </button>
              </div>
            </div>
          )}

          {activeTab === "prompt" && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  AI Prompt for Simulation Generation
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  This prompt will be sent to the AI to generate your simulation
                  code. You can edit it to refine the results.
                </p>

                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <Editor
                    height="400px"
                    language="markdown"
                    value={localPrompt}
                    onChange={handlePromptChange}
                    options={{
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      wordWrap: "on",
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  disabled={loading || !localPrompt}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {loading ? (
                    <div className="mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                  ) : (
                    <Code className="mr-2 h-4 w-4" />
                  )}
                  Generate Simulation Code
                </button>
              </div>
            </div>
          )}

          {activeTab === "code" && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Generated Simulation Code
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  You can edit this code to customize your simulation further.
                </p>

                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <Editor
                    height="500px"
                    language="html"
                    value={localCode}
                    onChange={handleCodeChange}
                    options={{
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Preview Simulation
                </button>

                <button
                  type="button"
                  onClick={handleSaveSimulation}
                  disabled={loading || !localCode}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {loading ? (
                    <div className="mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Simulation
                </button>
              </div>
            </div>
          )}

          {activeTab === "preview" && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Simulation Preview
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  This is how your simulation will look and function.
                </p>

                <div className="border border-gray-300 rounded-md bg-white p-4 h-[600px] overflow-auto">
                  {localCode ? (
                    <iframe
                      title="Simulation Preview"
                      srcDoc={localCode}
                      className="w-full h-full border-none"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>No simulation code generated yet.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveSimulation}
                  disabled={loading || !localCode}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {loading ? (
                    <div className="mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Simulation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateSimulation;
