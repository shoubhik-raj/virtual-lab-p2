import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchExperimentDetails } from "../store/slices/experimentsSlice";
import { fetchSimulationsByExperiment } from "../store/slices/simulationsSlice";
import { RootState } from "../store";
import { FlaskConical, Search, Building, Maximize2, Code } from "lucide-react";
import { SERVER_URL } from "../../constants";

const ExperimentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch: any = useDispatch();
  const { currentExperiment, loading, error } = useSelector(
    (state: RootState) => state.experiments
  );
  const { simulations, loading: simulationsLoading } = useSelector(
    (state: RootState) => state.simulations
  );
  const [activeTab, setActiveTab] = useState("aim");
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: string]: string;
  }>({});
  const [feedback, setFeedback] = useState<{ [key: string]: string }>({});
  const [pretestQuestions, setPretestQuestions] = useState<any[]>([]);
  const [posttestQuestions, setPosttestQuestions] = useState<any[]>([]);
  const [activeSimulation, setActiveSimulation] = useState(0);

  useEffect(() => {
    if (id) {
      dispatch(fetchExperimentDetails(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (id && activeTab === "simulation") {
      // Fetch simulations for this experiment
      dispatch(fetchSimulationsByExperiment(id));
    }
  }, [dispatch, id, activeTab]);

  useEffect(() => {
    if (currentExperiment) {
      // Parse pretest data if it's a string
      if (typeof currentExperiment.pretest === "string") {
        setPretestQuestions(JSON.parse(currentExperiment.pretest));
      } else {
        setPretestQuestions(currentExperiment.pretest);
      }

      if (typeof currentExperiment.posttest === "string") {
        setPosttestQuestions(JSON.parse(currentExperiment.posttest));
      } else {
        setPosttestQuestions(currentExperiment.posttest);
      }
    }
  }, [currentExperiment]);

  // Function to handle fullscreen
  const toggleFullScreen = () => {
    const iframe = document.getElementById("simulation-frame");
    if (iframe) {
      if (!document.fullscreenElement) {
        iframe.requestFullscreen().catch((err) => {
          alert(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error: {error}
      </div>
    );

  if (!currentExperiment)
    return (
      <div className="flex justify-center items-center h-screen">
        No experiment found
      </div>
    );

  const renderTabContent = () => {
    switch (activeTab) {
      case "aim":
        return (
          <div className="bg-white py-4">
            <div
              className="prose max-w-none text-gray-600"
              dangerouslySetInnerHTML={{
                __html: currentExperiment?.aim || "No aim provided for this experiment.",
              }}
            ></div>
          </div>
        );
      case "theory":
        return (
          <div className="bg-white py-4">
            <div
              className="prose max-w-none text-gray-600"
              dangerouslySetInnerHTML={{
                __html:
                  currentExperiment?.theory ||
                  "No theory provided for this experiment.",
              }}
            ></div>
          </div>
        );
      case "procedure":
        return (
          <div className="bg-white py-4">
            <div
              className="prose max-w-none text-gray-600"
              dangerouslySetInnerHTML={{
                __html:
                  currentExperiment?.procedure ||
                  "No procedure provided for this experiment.",
              }}
            ></div>
          </div>
        );
      case "simulation":
        return (
          <div className="bg-white py-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2">
                {simulations && simulations.length > 0 ? (
                  simulations.map((simulation, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveSimulation(index)}
                      className={`px-4 py-2 rounded-md font-medium ${
                        activeSimulation === index
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      <div className="flex items-center">
                        <Code className="h-4 w-4 mr-2" />
                        {simulation.name || `Simulation ${index + 1}`}
                      </div>
                    </button>
                  ))
                ) : (
                  <span></span>
                )}
              </div>
              <button
                onClick={toggleFullScreen}
                className="p-2 rounded-md bg-gray-200 hover:bg-gray-300"
                aria-label="Toggle fullscreen"
              >
                <Maximize2 className="h-5 w-5" />
              </button>
            </div>
            
            {simulationsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : simulations && simulations.length > 0 ? (
              <div className="bg-white border border-gray-300 rounded-lg p-4">
                <iframe
                  id="simulation-frame"
                  srcDoc={simulations[activeSimulation]?.code || ""}
                  title={`${currentExperiment?.name || "Experiment"} - Simulation ${activeSimulation + 1}`}
                  className="w-full h-[600px] border-0"
                  sandbox="allow-scripts allow-same-origin"
                ></iframe>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No simulations available for this experiment. 
                
              </div>
            )}
          </div>
        );
      case "pretest":
        return (
          <div className="bg-white py-4">
            <div className="space-y-6">
              {pretestQuestions && pretestQuestions.length > 0 ? (
                pretestQuestions.map((question, index) => (
                  <div key={index} className="border p-4 rounded-md">
                    <p className="font-medium mb-4">{question.text}</p>
                    <div className="space-y-2">
                      {question.options.map((option: string, optIdx: number) => (
                        <div key={optIdx} className="flex items-center">
                          <input
                            type="radio"
                            id={`pretest-${index}-${optIdx}`}
                            name={`pretest-${index}`}
                            value={option}
                            checked={selectedAnswers[`pretest-${index}`] === option}
                            onChange={() => {
                              setSelectedAnswers({
                                ...selectedAnswers,
                                [`pretest-${index}`]: option,
                              });
                            }}
                            className="mr-2"
                          />
                          <label htmlFor={`pretest-${index}-${optIdx}`}>
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                    {feedback[`pretest-${index}`] && (
                      <p
                        className={`mt-4 p-2 rounded ${
                          feedback[`pretest-${index}`] === "Correct!"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {feedback[`pretest-${index}`]}
                      </p>
                    )}
                    <button
                      onClick={() => {
                        if (
                          selectedAnswers[`pretest-${index}`] ===
                          question.correct
                        ) {
                          setFeedback({
                            ...feedback,
                            [`pretest-${index}`]: "Correct!",
                          });
                        } else {
                          setFeedback({
                            ...feedback,
                            [`pretest-${index}`]: "Incorrect. Try again.",
                          });
                        }
                      }}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Check Answer
                    </button>
                  </div>
                ))
              ) : (
                <p>No pretest questions available.</p>
              )}
            </div>
          </div>
        );
      case "posttest":
        return (
          <div className="bg-white py-4">
            <div className="space-y-6">
              {posttestQuestions && posttestQuestions.length > 0 ? (
                posttestQuestions.map((question, index) => (
                  <div key={index} className="border p-4 rounded-md">
                    <p className="font-medium mb-4">{question.text}</p>
                    <div className="space-y-2">
                      {question.options.map((option: string, optIdx: number) => (
                        <div key={optIdx} className="flex items-center">
                          <input
                            type="radio"
                            id={`posttest-${index}-${optIdx}`}
                            name={`posttest-${index}`}
                            value={option}
                            checked={selectedAnswers[`posttest-${index}`] === option}
                            onChange={() => {
                              setSelectedAnswers({
                                ...selectedAnswers,
                                [`posttest-${index}`]: option,
                              });
                            }}
                            className="mr-2"
                          />
                          <label htmlFor={`posttest-${index}-${optIdx}`}>
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                    {feedback[`posttest-${index}`] && (
                      <p
                        className={`mt-4 p-2 rounded ${
                          feedback[`posttest-${index}`] === "Correct!"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {feedback[`posttest-${index}`]}
                      </p>
                    )}
                    <button
                      onClick={() => {
                        if (
                          selectedAnswers[`posttest-${index}`] ===
                          question.correct
                        ) {
                          setFeedback({
                            ...feedback,
                            [`posttest-${index}`]: "Correct!",
                          });
                        } else {
                          setFeedback({
                            ...feedback,
                            [`posttest-${index}`]: "Incorrect. Try again.",
                          });
                        }
                      }}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Check Answer
                    </button>
                  </div>
                ))
              ) : (
                <p>No posttest questions available.</p>
              )}
            </div>
          </div>
        );
      case "references":
        return (
          <div className="bg-white py-4">
            <div
              className="prose max-w-none text-gray-600"
              dangerouslySetInnerHTML={{
                __html:
                  currentExperiment?.references ||
                  "No references provided for this experiment.",
              }}
            ></div>
          </div>
        );
      case "contributors":
        return (
          <div className="bg-white py-4">
            <div
              className="prose max-w-none text-gray-600"
              dangerouslySetInnerHTML={{
                __html:
                  currentExperiment?.contributors ||
                  "No contributors listed for this experiment.",
              }}
            ></div>
          </div>
        );
      case "faq":
        return (
          <div className="bg-white py-4">
            {currentExperiment?.faqs?.length > 0 ? (
              <div className="space-y-4">
                {currentExperiment?.faqs?.map((faq, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-300 rounded-md shadow-sm"
                  >
                    <h3 className="font-semibold text-gray-800">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 mt-1">{faq.answer}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">
                No FAQs available for this experiment.
              </p>
            )}
          </div>
        );
      default:
        return (
          <div className="bg-white py-4">
            <div className="prose max-w-none text-gray-600">
              Select a tab to view content.
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header Section */}
      <div className="mb-8">
        {/* <div className="text-sm text-gray-500 mb-2">
          {currentExperiment.name}
        </div> */}
        <div className="flex items-baseline">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 mr-6">
            {currentExperiment?.name}
          </h1>
          <div className="flex items-center mb-8 p-4 px-5 border-2 border-gray-300 rounded-2xl">
            <Building className="h-5 w-5 text-blue-400 mr-2" />
            <span className="text-gray-700 font-medium">
              {currentExperiment?.institution}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Bar - Fixed at the top when scrolling */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 mb-8">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setActiveTab("aim")}
            className={`py-3 px-6 font-medium whitespace-nowrap ${
              activeTab === "aim"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Aim
          </button>
          <button
            onClick={() => setActiveTab("theory")}
            className={`py-3 px-6 font-medium whitespace-nowrap ${
              activeTab === "theory"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Theory
          </button>
          <button
            onClick={() => setActiveTab("procedure")}
            className={`py-3 px-6 font-medium whitespace-nowrap ${
              activeTab === "procedure"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Procedure
          </button>
          <button
            onClick={() => setActiveTab("simulation")}
            className={`py-3 px-6 font-medium whitespace-nowrap ${
              activeTab === "simulation"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Simulation
          </button>
          <button
            onClick={() => setActiveTab("pretest")}
            className={`py-3 px-6 font-medium whitespace-nowrap ${
              activeTab === "pretest"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Pre-test
          </button>
          <button
            onClick={() => setActiveTab("posttest")}
            className={`py-3 px-6 font-medium whitespace-nowrap ${
              activeTab === "posttest"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Post-test
          </button>
          <button
            onClick={() => setActiveTab("references")}
            className={`py-3 px-6 font-medium whitespace-nowrap ${
              activeTab === "references"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            References
          </button>
          <button
            onClick={() => setActiveTab("contributors")}
            className={`py-3 px-6 font-medium whitespace-nowrap ${
              activeTab === "contributors"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Contributors
          </button>
          <button
            onClick={() => setActiveTab("faq")}
            className={`py-3 px-6 font-medium whitespace-nowrap ${
              activeTab === "faq"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            FAQ
          </button>

          {/* Search Box */}
          <div className="ml-auto relative">
            <div className="h-[40px] absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 focus:outline-none focus:border-b-2 focus:border-blue-300"
              style={{ height: "40px" }}
            />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="mb-12">
        <div className="mb-6">
          <div className="inline-flex items-center bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
            <div className="p-5 flex items-center justify-center border-r-2 border-gray-200">
              <FlaskConical className="h-5 w-5 text-gray-700" />
            </div>
            <div className="px-6 py-5 pr-24">
              <h2 className="text-md font-medium text-gray-800">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h2>
            </div>
          </div>
        </div>

        {/* Render content based on active tab */}
        {renderTabContent()}
      </div>

      {/* Experiment Thumbnail */}
      {/* {currentExperiment.thumbnail && (
        <div className="mt-8">
          <img
            src={`${SERVER_URL}${currentExperiment.thumbnail}`}
            alt={currentExperiment.name}
            className="w-full max-h-64 object-cover rounded-lg"
          />
        </div>
      )} */}
    </div>
  );
};

export default ExperimentDetails;
