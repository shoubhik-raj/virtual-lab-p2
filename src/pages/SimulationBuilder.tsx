import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  generateSimulationCode,
  saveSimulation,
} from "../store/slices/simulationsSlice";
import { RootState } from "../store";
import { ArrowRight, Send, Maximize, RefreshCw } from "lucide-react";
import Editor from "@monaco-editor/react";
import { API_URL } from "../../constants";
import ReactMarkdown from "react-markdown";

const SimulationBuilder: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get data from navigation state with empty string fallbacks
  const initialPrompt = location.state?.response || "";
  const name = location.state?.name || "";
  const subject = location.state?.subject || "";
  const department = location.state?.department || "";
  const details = location.state?.details || "";
  const experimentId = location.state?.experimentId || "";
  const course = location.state?.course || "";

  console.log("Received navigation state:", {
    name,
    subject,
    department,
    details,
    experimentId,
    course,
    prompt: initialPrompt,
  });

  const [code, setCode] = useState<string>("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [inputMessage, setInputMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [simulationName, setSimulationName] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // On initial load, if there's a prompt from the previous page, send it to generate code
  useEffect(() => {
    if (initialPrompt && messages.length === 0) {
      setMessages([{ role: "user", content: initialPrompt }]);
      handleInitialCodeGeneration(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    if (name && simulationName === "") {
      setSimulationName(name);
    }
  }, [name, simulationName]);

  const handleInitialCodeGeneration = async (prompt: string) => {
    setLoading(true);
    try {
      const generatedCode = await dispatch(
        generateSimulationCode(prompt) as any
      ).unwrap();
      setCode(generatedCode);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I've generated the simulation code based on your requirements. You can see it in the editor and preview it in the output window. Feel free to ask for any modifications!",
        },
      ]);
    } catch (error) {
      console.error("Failed to generate code:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an error while generating the code. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message to chat
    const userMessage = inputMessage;
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInputMessage("");
    setLoading(true);

    try {
      // Send to backend with current code context
      const response = await fetch(`${API_URL}/simulations/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          code: code,
          history: messages,
        }),
        credentials: "include",
      });

      const data = await response.json();

      // Update code if AI modified it
      if (data.updatedCode) {
        setCode(data.updatedCode);
      }

      // Process the response to remove code blocks before adding to chat
      let cleanResponse = data.response;
      // Remove all code blocks (```code```) from the response
      cleanResponse = cleanResponse.replace(/```[\s\S]*?```/g, "");
      // Remove any markdown code block syntax that might be leftover
      cleanResponse = cleanResponse.replace(/```/g, "");
      // Trim any extra whitespace resulting from removals
      cleanResponse = cleanResponse.trim();

      // If after removing code blocks we have no content, add a default message
      if (!cleanResponse) {
        cleanResponse =
          "I've updated the code based on your request! Check the editor for changes.";
      }

      // Add AI response to chat
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: cleanResponse },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const refreshPreview = () => {
    // Force refresh the preview iframe
    const iframe = document.getElementById(
      "preview-iframe"
    ) as HTMLIFrameElement;
    if (iframe) {
      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(code);
        iframeDoc.close();
      }
    }
  };

  const toggleFullScreen = () => {
    const iframe = document.getElementById(
      "preview-iframe"
    ) as HTMLIFrameElement;
    if (iframe) {
      if (!document.fullscreenElement) {
        iframe.requestFullscreen().catch((err) => {
          console.error(
            `Error attempting to enable fullscreen: ${err.message}`
          );
          alert(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  const handlePublishSimulation = async () => {
    if (code.trim() === "") {
      alert("Cannot publish an empty simulation. Please generate code first.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      // Extract first message as prompt if available
      const prompt =
        messages.length > 0 && messages[0].role === "user"
          ? messages[0].content
          : "No initial prompt available";

      // Ensure all required fields are included
      if (!experimentId || !course || !details) {
        console.error("Missing required fields:", {
          experimentId,
          course,
          details,
        });
        setSaveError(
          `Missing required fields: ${!experimentId ? "Experiment ID, " : ""}${
            !course ? "Course, " : ""
          }${!details ? "Details" : ""}`
        );
        return;
      }

      // Log values for debugging
      console.log("DEBUG - Values before publishing:", {
        experimentId,
        course,
        details,
        name: simulationName,
        subject,
        department,
      });

      // Create simulation data object with all required fields
      const simulationData = {
        name: simulationName || "Untitled Simulation",
        subject: subject || "Physics", // Provide default if missing
        department: department || "Science", // Provide default if missing
        details: details, // Required field
        prompt: prompt,
        code: code,
        experimentId: experimentId, // This must be a valid MongoDB ObjectId
        course: course, // Required field
      };

      console.log("Publishing simulation with data:", simulationData);

      // Use the saveSimulation thunk to send the data to the backend with type assertion
      const result = await dispatch(
        saveSimulation(simulationData) as any
      ).unwrap();

      // Show success notification
      alert("Simulation published successfully!");

      // Navigate to simulations list
      navigate("/");
    } catch (error) {
      console.error("Failed to publish simulation:", error);
      setSaveError(
        "Failed to publish simulation. Please check console for details."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Left panel - Chat */}
      <div className="w-1/4 flex flex-col bg-gray-50 border-r">
        {/* Top nav bar - Moved to left panel */}
        <div className="p-4 border-b">
          {/* <input
            type="text"
            value={simulationName}
            onChange={(e) => setSimulationName(e.target.value)}
            className="text-xl font-bold w-full bg-transparent border-none focus:outline-none"
            placeholder="Simulation Name"
          /> */}
          <h2 className="text-lg font-semibold w-full bg-transparent border-none focus:outline-none">
            {simulationName}
          </h2>
        </div>

        {/* Chat section */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                message.role === "user"
                  ? "bg-gray-200 ml-4"
                  : "bg-gray-100 mr-4"
              }`}
            >
              {message.role === "assistant" ? (
                <div className="prose prose-sm max-w-none text-gray-800">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              ) : (
                <div className="text-gray-700 text-sm">{message.content}</div>
              )}
            </div>
          ))}
          {loading && (
            <div className="bg-gray-100 p-3 rounded-lg mr-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Chat input */}
        <div className="p-4 border-t">
          <div className="flex items-center bg-gray-100 px-4 py-2 rounded-2xl">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Chat here..."
              className="flex-1 p-2 bg-transparent border-0 focus:outline-none resize-none overflow-hidden text-sm"
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading}
              className="bg-black text-white p-2 px-3 rounded-lg hover:bg-gray-800 flex items-center gap-2 text-xs"
            >
              <Send size={12} />
              SEND
            </button>
          </div>
        </div>

        {/* Publish Simulation button */}
        <div className="p-4 mt-auto">
          <button
            onClick={handlePublishSimulation}
            disabled={isSaving || code.trim() === ""}
            className={`w-full ${
              isSaving ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
            } text-white py-3 px-4 rounded-md flex items-center justify-between transition-colors`}
          >
            <span>{isSaving ? "Publishing..." : "Publish Simulation"}</span>
            <ArrowRight size={18} />
          </button>
          {saveError && (
            <p className="text-red-500 text-xs mt-2">{saveError}</p>
          )}
        </div>
      </div>

      {/* Right panel - Editor and Preview */}
      <div className="flex-1 flex flex-col p-4">
        {/* Code Editor - 50% height */}
        <div className="h-1/2 border-2 rounded-lg px-2">
          <Editor
            height="100%"
            defaultLanguage="html"
            value={code}
            onChange={(value) => setCode(value || "")}
            theme="vs-light"
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              wordWrap: "on", // Enable word wrapping to prevent horizontal scrolling
            }}
          />
        </div>

        {/* Output Window - 50% height */}
        <div className="h-1/2">
          <div className="flex justify-between items-center p-3 bg-white border-b">
            <h3 className="font-medium text-gray-800">Output Window</h3>
            <button
              onClick={toggleFullScreen}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2 text-sm bg-blue-50 px-3 py-1 rounded-md"
            >
              <span>Open in fullscreen</span>
              <Maximize size={14} />
            </button>
          </div>
          <div className="h-[calc(100%-44px)] bg-white">
            <iframe
              id="preview-iframe"
              title="Simulation Preview"
              className="w-full h-full border-none"
              srcDoc={code}
              sandbox="allow-scripts"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationBuilder;
