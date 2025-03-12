import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { generateSimulationCode } from "../store/slices/simulationsSlice";
import { RootState } from "../store";
import { ArrowRight, Send, Maximize, RefreshCw } from "lucide-react";
import Editor from "@monaco-editor/react";
import { API_URL } from "../../constants";
import ReactMarkdown from "react-markdown";

const SimulationBuilder: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const initialPrompt = location.state?.response || "";

  const [code, setCode] = useState<string>("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [inputMessage, setInputMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
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

  const handleInitialCodeGeneration = async (prompt: string) => {
    setLoading(true);
    try {
      const generatedCode = await dispatch(
        generateSimulationCode(prompt)
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
    const iframe = document.getElementById("preview-iframe") as HTMLIFrameElement;
    if (iframe) {
      if (!document.fullscreenElement) {
        iframe.requestFullscreen().catch((err) => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
          alert(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Top nav bar */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-bold">Fire Alarm Simulation</h1>
        <button className="text-blue-500 hover:text-blue-700">MODIFY</button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Chat */}
        <div className="w-1/4 border-r flex flex-col bg-gray-100">
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
                    : "bg-blue-100 mr-4"
                }`}
              >
                {message.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                ) : (
                  message.content
                )}
              </div>
            ))}
            {loading && (
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t">
            <div className="flex items-center bg-slate-50 px-4 py-2 rounded-2xl">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Chat here..."
                className="flex-1 p-2 bg-transparent border-0 focus:outline-none resize-none overflow-hidden text-sm"
                rows={2}
              />
              <button
                onClick={handleSendMessage}
                disabled={loading}
                className="bg-gray-800 text-white p-2 px-3 rounded-lg hover:bg-gray-900 flex items-center gap-2 text-sm"
              >
                <Send size={12} />
                SEND
              </button>
            </div>
          </div>
        </div>

        {/* Main content - Editor and Preview */}
        <div className="flex-1 flex flex-col">
          {/* Code Editor */}
          <div className="flex-1 border-b">
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
              }}
            />
          </div>

          {/* Output Window */}
          <div className="flex-1">
            <div className="flex justify-between items-center p-2 bg-gray-100">
              <h3 className="font-medium">Output Window</h3>
              <div className="flex space-x-2">
                <button
                  onClick={refreshPreview}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <RefreshCw size={18} />
                </button>
                <button 
                  onClick={toggleFullScreen}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <Maximize size={18} />
                </button>
              </div>
            </div>
            <div className="h-full bg-white">
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
    </div>
  );
};

export default SimulationBuilder;
