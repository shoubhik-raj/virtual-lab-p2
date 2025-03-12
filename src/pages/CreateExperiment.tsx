import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { TestTube, Save, X, Plus, Trash2 } from "lucide-react";
import { fetchLabs } from "../store/slices/labsSlice";
import { createExperiment } from "../store/slices/experimentsSlice";
import { RootState } from "../store";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface Question {
  id: string;
  text: string;
  options: { id: string; text: string; isCorrect: boolean }[];
}

interface FAQ {
  question: string;
  answer: string;
}

const CreateExperiment: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { labs } = useSelector((state: RootState) => state.labs);
  const { loading } = useSelector((state: RootState) => state.experiments);
  const { user } = useSelector((state: RootState) => state.auth);

  console.log("LABS : ", labs);

  const [formData, setFormData] = useState({
    name: "",
    labId: "",
    aim: "",
    theory: "",
    procedure: "",
    posttest: "",
    references: "",
    contributors: "",
    faqs: [] as FAQ[],
    thumbnail: null,
    institution: user?.institution || "",
  });

  const [pretest, setPretest] = useState<Question[]>([]);
  const [posttest, setPosttest] = useState<Question[]>([]);

  useEffect(() => {
    dispatch(fetchLabs());
  }, [dispatch]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addQuestion = (testType: "pre" | "post") => {
    const newQuestion = {
      id: Date.now().toString(),
      text: "",
      options: [
        { id: Date.now().toString() + "1", text: "", isCorrect: false },
        { id: Date.now().toString() + "2", text: "", isCorrect: false },
        { id: Date.now().toString() + "3", text: "", isCorrect: false },
        { id: Date.now().toString() + "4", text: "", isCorrect: false },
      ],
    };

    if (testType === "pre") {
      setPretest([...pretest, newQuestion]);
    } else {
      setPosttest([...posttest, newQuestion]);
    }
  };

  const handleQuestionChange = (
    testType: "pre" | "post",
    questionId: string,
    field: string,
    value: string
  ) => {
    if (testType === "pre") {
      setPretest(
        pretest.map((q) => (q.id === questionId ? { ...q, [field]: value } : q))
      );
    } else {
      setPosttest(
        posttest.map((q) =>
          q.id === questionId ? { ...q, [field]: value } : q
        )
      );
    }
  };

  const handleOptionChange = (
    testType: "pre" | "post",
    questionId: string,
    optionId: string,
    field: string,
    value: string | boolean
  ) => {
    if (testType === "pre") {
      setPretest((prev) =>
        prev.map((q) => {
          if (q.id === questionId) {
            return {
              ...q,
              options: q.options.map((opt) =>
                opt.id === optionId ? { ...opt, [field]: value } : opt
              ),
            };
          }
          return q;
        })
      );
    } else {
      setPosttest((prev) =>
        prev.map((q) => {
          if (q.id === questionId) {
            return {
              ...q,
              options: q.options.map((opt) =>
                opt.id === optionId ? { ...opt, [field]: value } : opt
              ),
            };
          }
          return q;
        })
      );
    }
  };

  const removeQuestion = (testType: "pre" | "post", questionId: string) => {
    if (testType === "pre") {
      setPretest(pretest.filter((q) => q.id !== questionId));
    } else {
      setPosttest(posttest.filter((q) => q.id !== questionId));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, thumbnail: e.target.files[0] }));
    }
  };

  const addFAQ = () => {
    setFormData((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { question: "", answer: "" }],
    }));
  };

  const handleFAQChange = (index: number, field: string, value: string) => {
    const updatedFAQs = [...formData.faqs];
    updatedFAQs[index][field] = value;
    setFormData((prev) => ({ ...prev, faqs: updatedFAQs }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.labId) {
      return;
    }

    try {
      const experimentData = {
        ...formData,
        pretest,
        posttest,
      };

      console.log("Submitting experiment with labId:", formData.labId);
      console.log("FORM DATAAAAAAA:", formData);

      const formDataToSubmit = new FormData();
      Object.entries(experimentData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formDataToSubmit.append(key, JSON.stringify(value));
        } else {
          formDataToSubmit.append(key, value);
        }
      });

      await dispatch(createExperiment(formDataToSubmit));
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to create experiment:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <TestTube className="h-6 w-6 text-green-500 mr-2" />
            <h1 className="text-2xl font-bold text-gray-800">
              Create New Experiment
            </h1>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Experiment Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g., Pendulum Motion"
              />
            </div>

            <div>
              <label
                htmlFor="labId"
                className="block text-sm font-medium text-gray-700"
              >
                Select Lab *
              </label>
              <select
                id="labId"
                name="labId"
                value={formData.labId}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select a lab</option>
                {labs.map((lab) => {
                  return (
                    <option key={lab._id} value={lab._id}>
                      {lab.name}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="aim"
              className="block text-sm font-medium text-gray-700"
            >
              Aim *
            </label>
            <ReactQuill
              value={formData.aim}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, aim: value }))
              }
              placeholder="State the aim of this experiment"
            />
          </div>

          <div>
            <label
              htmlFor="theory"
              className="block text-sm font-medium text-gray-700"
            >
              Theory *
            </label>
            <ReactQuill
              value={formData.theory}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, theory: value }))
              }
              placeholder="Explain the theoretical background of this experiment"
            />
          </div>

          <div>
            <label
              htmlFor="procedure"
              className="block text-sm font-medium text-gray-700"
            >
              Procedure *
            </label>
            <ReactQuill
              value={formData.procedure}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, procedure: value }))
              }
              placeholder="Describe the step-by-step procedure for this experiment"
            />
          </div>

          <div>
            <label
              htmlFor="references"
              className="block text-sm font-medium text-gray-700"
            >
              References *
            </label>
            <ReactQuill
              value={formData.references}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, references: value }))
              }
              placeholder="List references for this experiment"
            />
          </div>

          <div>
            <label
              htmlFor="contributors"
              className="block text-sm font-medium text-gray-700"
            >
              Contributors *
            </label>
            <ReactQuill
              value={formData.contributors}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, contributors: value }))
              }
              placeholder="List contributors for this experiment"
            />
          </div>

          {/* Pre-test Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Pre-test Questions
              </h2>
              <button
                type="button"
                onClick={() => addQuestion("pre")}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Question
              </button>
            </div>

            {pretest.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                No pre-test questions added yet.
              </p>
            ) : (
              <div className="space-y-6">
                {pretest.map((question, qIndex) => (
                  <div key={question.id} className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-sm font-medium">
                        Question {qIndex + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => removeQuestion("pre", question.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mb-3">
                      <input
                        type="text"
                        value={question.text}
                        onChange={(e) =>
                          handleQuestionChange(
                            "pre",
                            question.id,
                            "text",
                            e.target.value
                          )
                        }
                        placeholder="Enter question text"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      {question.options.map((option, oIndex) => (
                        <div
                          key={option.id}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) =>
                              handleOptionChange(
                                "pre",
                                question.id,
                                option.id,
                                "text",
                                e.target.value
                              )
                            }
                            placeholder={`Option ${oIndex + 1}`}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                          <label className="ml-2">
                            <input
                              type="checkbox"
                              checked={option.isCorrect}
                              onChange={() =>
                                handleOptionChange(
                                  "pre",
                                  question.id,
                                  option.id,
                                  "isCorrect",
                                  !option.isCorrect
                                )
                              }
                            />
                            Correct Answer
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Post-test Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Post-test Questions
              </h2>
              <button
                type="button"
                onClick={() => addQuestion("post")}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Question
              </button>
            </div>

            {posttest.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                No post-test questions added yet.
              </p>
            ) : (
              <div className="space-y-6">
                {posttest.map((question, qIndex) => (
                  <div key={question.id} className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-sm font-medium">
                        Question {qIndex + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => removeQuestion("post", question.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mb-3">
                      <input
                        type="text"
                        value={question.text}
                        onChange={(e) =>
                          handleQuestionChange(
                            "post",
                            question.id,
                            "text",
                            e.target.value
                          )
                        }
                        placeholder="Enter question text"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      {question.options.map((option, oIndex) => (
                        <div
                          key={option.id}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) =>
                              handleOptionChange(
                                "post",
                                question.id,
                                option.id,
                                "text",
                                e.target.value
                              )
                            }
                            placeholder={`Option ${oIndex + 1}`}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                          <label className="ml-2">
                            <input
                              type="checkbox"
                              checked={option.isCorrect}
                              onChange={() =>
                                handleOptionChange(
                                  "post",
                                  question.id,
                                  option.id,
                                  "isCorrect",
                                  !option.isCorrect
                                )
                              }
                            />
                            Correct Answer
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FAQs Section */}
          <div>
            <h2 className="text-lg font-medium">FAQs</h2>
            {formData.faqs.map((faq, index) => (
              <div key={index} className="mb-4">
                <input
                  type="text"
                  placeholder="Question"
                  value={faq.question}
                  onChange={(e) =>
                    handleFAQChange(index, "question", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <textarea
                  placeholder="Answer"
                  value={faq.answer}
                  onChange={(e) =>
                    handleFAQChange(index, "answer", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addFAQ}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Add FAQ
            </button>
          </div>

          <div>
            <label
              htmlFor="thumbnail"
              className="block text-sm font-medium text-gray-700"
            >
              Thumbnail
            </label>
            <input
              type="file"
              id="thumbnail"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 block w-full"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? (
                <div className="mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Create Experiment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExperiment;
