import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import QuizCard from "../components/QuizCard";
import API from "../src/api";

interface Quiz {
  id: number;
  question: string;
  options: string[];
}

export default function Quiz() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchQuizzes = async () => {
    try {
      const res = await API.get("/quiz/");
      setQuizzes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const submitQuiz = async () => {
    const payload = { answers: Object.values(answers).map((a) => ({ answer: a, correct: true })) };
    try {
      const res = await API.post("/quiz/submit", payload);
      alert(`Score: ${res.data.score}`);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const currentQuiz = quizzes[currentIndex];

  const handleNext = () => {
    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // For skipping to submit when done
  const isLastQuestion = currentIndex === quizzes.length - 1;

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1470&q=80')" }}
    >
      <div className="min-h-screen bg-black bg-opacity-40 flex flex-col">
        <Navbar />
        <div className="max-w-4xl mx-auto p-6 flex flex-col gap-6 flex-grow">
          {quizzes.length > 0 && currentQuiz && (
            <>
              <div className="text-white text-lg font-semibold mb-2 select-none">
                Question {currentIndex + 1} of {quizzes.length}
              </div>
              <div
                className="
                  bg-white bg-opacity-70 
                  rounded-none
                  shadow-lg
                  p-6
                  select-none
                  cursor-pointer
                  transition 
                  duration-300 
                  ease-in-out
                  hover:bg-opacity-90
                  hover:shadow-xl
                  hover:scale-[1.02]
                  hover:brightness-110
                  "
              >
                <QuizCard
                  {...currentQuiz}
                  selected={answers[currentQuiz.id]}
                  onSelect={(opt) => setAnswers({ ...answers, [currentQuiz.id]: opt })}
                  className="text-gray-900"
                />
              </div>

              <div className="flex justify-between mt-4">
                <button
                  onClick={() => setCurrentIndex(i => Math.max(i - 1, 0))}
                  disabled={currentIndex === 0}
                  className={`
                    bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded 
                    ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-400'}
                    transition
                  `}
                >
                  Previous
                </button>

                {!isLastQuestion ? (
                  <button
                    onClick={handleNext}
                    className="
                      bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded 
                      shadow-md transition focus:outline-none focus:ring-2 focus:ring-blue-500
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                    disabled={!answers[currentQuiz.id]}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={submitQuiz}
                    className="
                      bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded 
                      shadow-md transition focus:outline-none focus:ring-2 focus:ring-green-500
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                    disabled={Object.keys(answers).length !== quizzes.length}
                  >
                    Submit Quiz
                  </button>
                )}
              </div>
            </>
          )}

          {quizzes.length === 0 && (
            <div className="text-white text-center text-xl mt-12">Loading quizzes...</div>
          )}
        </div>
      </div>
    </div>
  );
}
