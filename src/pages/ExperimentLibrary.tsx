import React, { useState } from "react";
import { Building, Search } from "lucide-react";

const ExperimentLibrary: React.FC = () => {
  const [department, setDepartment] = useState("");
  const [institute, setInstitute] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Sample experiment data - replace with actual data from your API
  const experiments = [
    {
      id: 1,
      title: "Familiarization with general bread board",
      image: "https://source.unsplash.com/random/300x200/?electronics",
      institution: "IIT Roorkee",
    },
    {
      id: 2,
      title: "Familiarisation of ICs.",
      image: "https://source.unsplash.com/random/300x200/?microchip",
      institution: "IIT Kanpur",
    },
    {
      id: 3,
      title: "Generation of clock using NAND and NOR gate",
      image: "https://source.unsplash.com/random/300x200/?circuit",
      institution: "IIT Bombay",
    },
  ];

  const filteredExperiments = experiments.filter((experiment) => {
    const matchesDepartment = department
      ? experiment.department === department
      : true;
    const matchesInstitute = institute
      ? experiment.institution === institute
      : true;
    const matchesSearch = experiment.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesDepartment && matchesInstitute && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Experiment Library</h1>
        <p className="text-gray-600">
          Archive of all the experiments published previously on the platform
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-4">
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="border border-gray-300 rounded-md p-2"
          >
            <option value="">Choose Department</option>
            <option value="Electronics">Electronics</option>
            <option value="Computer Science">Computer Science</option>
            {/* Add more departments as needed */}
          </select>

          <select
            value={institute}
            onChange={(e) => setInstitute(e.target.value)}
            className="border border-gray-300 rounded-md p-2"
          >
            <option value="">Choose Institute</option>
            <option value="IIT Bombay">IIT Bombay</option>
            <option value="IIT Roorkee">IIT Roorkee</option>
            <option value="IIT Kanpur">IIT Kanpur</option>
            {/* Add more institutes as needed */}
          </select>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-md p-2 pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
        </div>
      </div>

      {/* Tab Switch */}
      <div className="flex mb-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("all")}
          className={`py-3 px-6 font-medium ${
            activeTab === "all"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          All Experiments
        </button>
        <button
          onClick={() => setActiveTab("published")}
          className={`py-3 px-6 font-medium ${
            activeTab === "published"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Published by You
        </button>
      </div>

      {/* Experiment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredExperiments.map((experiment) => (
          <div
            key={experiment.id}
            className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200"
          >
            <img
              src={experiment.image}
              alt={experiment.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-medium text-gray-900">{experiment.title}</h3>
              <div className="flex items-center mt-4">
                <Building className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-600">
                  {experiment.institution}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExperimentLibrary;
