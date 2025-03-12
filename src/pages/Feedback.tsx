import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { MessageSquare, Star, Send } from "lucide-react";

const Feedback: React.FC = () => {
  const { labId } = useParams<{ labId: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Here you would typically send the feedback to your backend
      // const response = await axios.post(`${API_URL}/feedback`, {
      //   labId,
      //   userId: user?.id,
      //   rating,
      //   comment
      // });

      // For now, we'll just simulate a successful submission
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess(true);
      setTimeout(() => {
        navigate(`/lab/${labId}`);
      }, 2000);
    } catch (err) {
      setError("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center mb-6">
          <MessageSquare className="h-6 w-6 text-blue-500 mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">Lab Feedback</h1>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <p className="text-green-700">
              Thank you for your feedback! Redirecting you back to the lab
              page...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <label className="block text-gray-700 font-medium mb-2">
                How would you rate your experience with this lab?
              </label>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none mr-2"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        rating >= star
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-gray-600">
                  {rating > 0 ? `${rating} out of 5` : "Select a rating"}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="comment"
                className="block text-gray-700 font-medium mb-2"
              >
                Do you have any additional comments or suggestions?
              </label>
              <textarea
                id="comment"
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your feedback helps us improve..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              ></textarea>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate(`/lab/${labId}`)}
                className="px-4 py-2 mr-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
              >
                {submitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Feedback
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Feedback;
