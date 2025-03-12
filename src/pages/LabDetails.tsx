import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchLabDetails } from "../store/slices/labsSlice";
import { RootState } from "../store";
import { Building, Search, FlaskConical, MessageSquare } from "lucide-react";
import { SERVER_URL } from "../../constants";

const LabDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const { lab, experiments } = useSelector(
    (state: RootState) => state.labs.labDetails
  );
  const loading = useSelector((state: RootState) => state.labs.loading);
  const error = useSelector((state: RootState) => state.labs.error);
  const [activeSection, setActiveSection] = useState("overview");
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isDescriptionLong, setIsDescriptionLong] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Create refs for each section
  const overviewRef = useRef<HTMLDivElement>(null);
  const experimentsRef = useRef<HTMLDivElement>(null);
  const audienceRef = useRef<HTMLDivElement>(null);
  const alignmentRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchLabDetails(id));
    }
    console.log("EXPO : ", experiments);
  }, [dispatch, id]);

  useEffect(() => {
    if (descriptionRef.current) {
      setIsDescriptionLong(descriptionRef.current.scrollHeight > 200);
    }
  }, [lab?.description]);

  // Function to scroll to a section
  const scrollToSection = (
    ref: React.RefObject<HTMLDivElement>,
    section: string
  ) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
      setActiveSection(section);
    }
  };

  // Set up intersection observer to detect which section is in view
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "-100px 0px -70% 0px", // Adjust these values to control when the active state changes
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          setActiveSection(id);
        }
      });
    }, options);

    // Observe all section refs
    if (overviewRef.current) {
      overviewRef.current.id = "overview";
      observer.observe(overviewRef.current);
    }
    if (experimentsRef.current) {
      experimentsRef.current.id = "experiments";
      observer.observe(experimentsRef.current);
    }
    if (audienceRef.current) {
      audienceRef.current.id = "audience";
      observer.observe(audienceRef.current);
    }
    if (alignmentRef.current) {
      alignmentRef.current.id = "alignment";
      observer.observe(alignmentRef.current);
    }
    if (feedbackRef.current) {
      feedbackRef.current.id = "feedback";
      observer.observe(feedbackRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

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
  if (!lab)
    return (
      <div className="flex justify-center items-center h-screen">
        Lab not found
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header Section */}
      <div className="mb-8">
        <div className="text-sm text-gray-500 mb-2">
          {lab.discipline || "Electronics & Communications"}
        </div>
        <div className="flex items-baseline">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 mr-6">
            {lab.name || "Analog and Digital Electronics I"}
          </h1>

          <div className="flex items-center mb-8 p-4 px-5 border-2 border-gray-300 rounded-2xl">
            <Building className="h-5 w-5 text-blue-400 mr-2" />
            <span className="text-gray-700 font-medium">
              {lab.institution || "IIT Roorkee"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Bar - Fixed at the top when scrolling */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 mb-8">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => scrollToSection(overviewRef, "overview")}
            className={`py-3 px-6 font-medium whitespace-nowrap ${
              activeSection === "overview"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => scrollToSection(experimentsRef, "experiments")}
            className={`py-3 px-6 font-medium whitespace-nowrap ${
              activeSection === "experiments"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            List of Experiments
          </button>
          <button
            onClick={() => scrollToSection(audienceRef, "audience")}
            className={`py-3 px-6 font-medium whitespace-nowrap ${
              activeSection === "audience"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Target Audience
          </button>
          <button
            onClick={() => scrollToSection(alignmentRef, "alignment")}
            className={`py-3 px-6 font-medium whitespace-nowrap ${
              activeSection === "alignment"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Course Alignment
          </button>
          <button
            onClick={() => scrollToSection(feedbackRef, "feedback")}
            className={`py-3 px-6 font-medium whitespace-nowrap ${
              activeSection === "feedback"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Feedback
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

      {/* Overview Section */}
      <div ref={overviewRef} className="mb-12 scroll-mt-16">
        <div className="mb-6">
          <div className="inline-flex items-center bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
            <div className="p-5 flex items-center justify-center border-r-2 border-gray-200">
              <FlaskConical className="h-5 w-5 text-gray-700" />
            </div>
            <div className="px-6 py-5 pr-24">
              <h2 className="text-md font-medium text-gray-800">
                Lab Overview
              </h2>
            </div>
          </div>
        </div>

        <div className="bg-white py-4">
          <div
            ref={descriptionRef}
            className={`prose max-w-none text-gray-600 ${
              !showFullDescription && isDescriptionLong
                ? "max-h-[200px] overflow-hidden relative"
                : ""
            }`}
            dangerouslySetInnerHTML={{ __html: lab.description || "" }}
          />

          {isDescriptionLong && (
            <div className={!showFullDescription ? "mt-4 relative" : "mt-4"}>
              {!showFullDescription && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"
                  style={{ bottom: "20px" }}
                ></div>
              )}
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-blue-500 hover:text-blue-700 font-medium flex items-center relative z-10"
              >
                {showFullDescription ? "Show Less" : "Read More"}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 ml-1 transition-transform ${
                    showFullDescription ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Experiments Section */}
      <div ref={experimentsRef} className="mb-16 scroll-mt-16">
        <div className="mb-6">
          <div className="inline-flex items-center bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
            <div className="p-5 flex items-center justify-center border-r-2 border-gray-200">
              <FlaskConical className="h-5 w-5 text-gray-700" />
            </div>
            <div className="px-6 py-5 pr-24">
              <h2 className="text-md font-medium text-gray-800">
                List of Experiments
              </h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {experiments && experiments.length > 0 ? (
            experiments.map((experiment) => (
              <Link
                key={experiment._id}
                className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200"
                to={`/experiment/${experiment._id}`}
              >
                {experiment.thumbnail && (
                  <img
                    src={`${SERVER_URL}${experiment.thumbnail}`}
                    alt={experiment.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 text-lg">
                    {experiment.name}
                  </h3>
                  <p
                    className="text-sm text-gray-600 mt-2 line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: experiment.theory }}
                  ></p>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 text-gray-500">
              No experiments found for this lab.
            </div>
          )}
        </div>
      </div>

      {/* Target Audience Section */}
      <div ref={audienceRef} className="mb-16 scroll-mt-16">
        <div className="mb-0">
          <div className="inline-flex items-center bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
            <div className="p-5 flex items-center justify-center border-r-2 border-gray-200">
              <FlaskConical className="h-5 w-5 text-gray-700" />
            </div>
            <div className="px-6 py-5 pr-24">
              <h2 className="text-md font-medium text-gray-800">
                Target Audience
              </h2>
            </div>
          </div>
        </div>

        <div className="bg-white py-4">
          <div
            className="prose max-w-none text-gray-500"
            dangerouslySetInnerHTML={{
              __html:
                lab.targetAudience ||
                "Information about target audience not available.",
            }}
          ></div>
        </div>
      </div>

      {/* Course Alignment Section */}
      <div ref={alignmentRef} className="mb-16 scroll-mt-16">
        <div className="mb-0">
          <div className="inline-flex items-center bg-white rounded-lg border-2 border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 flex items-center justify-center border-r-2 border-gray-200">
              <FlaskConical className="h-5 w-5 text-gray-700" />
            </div>
            <div className="px-6 py-5 pr-24">
              <h2 className="text-md font-medium text-gray-800">
                Course Alignment
              </h2>
            </div>
          </div>
        </div>

        <div className="bg-white py-4">
          {/* <div className="prose max-w-none text-gray-500">
            {lab.courseAlignment ||
              "Information about course alignment not available."}
          </div> */}
          <div
            className="prose max-w-none text-gray-500"
            dangerouslySetInnerHTML={{
              __html:
                lab.courseAlignment ||
                "Information about course alignment not available.",
            }}
          ></div>
        </div>
      </div>

      {/* Feedback Section */}
      <div ref={feedbackRef} className="scroll-mt-16">
        <div className="mb-0">
          <div className="inline-flex items-center bg-white rounded-lg border-2 border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 flex items-center justify-center border-r-2 border-gray-200">
              <FlaskConical className="h-5 w-5 text-gray-700" />
            </div>
            <div className="px-6 py-5 pr-24">
              <h2 className="text-md font-medium text-gray-800">Feedback</h2>
            </div>
          </div>
        </div>

        <div className="bg-white py-4">
          <p className="text-gray-600 mb-4">
            Dear User, Thanks for using Virtual Labs. Your opinion is valuable
            to us. To help us improve, we'd like to ask you a few questions
            about your experience. It will only take 3 minutes and your answers
            will help us make Virtual Labs better for you and other users.
          </p>

          <Link
            to={`/lab/${id}/feedback`}
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Provide Feedback
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LabDetails;
