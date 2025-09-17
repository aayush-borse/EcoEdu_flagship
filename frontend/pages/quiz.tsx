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

  return (
    <div>
      <Navbar />
      <div className="p-4">
        {quizzes.map((q) => (
          <QuizCard
            key={q.id}
            {...q}
            selected={answers[q.id]}
            onSelect={(opt) => setAnswers({ ...answers, [q.id]: opt })}
          />
        ))}
        <button onClick={submitQuiz} className="mt-4 bg-blue-500 text-white p-2 rounded-md">
          Submit Quiz
        </button>
      </div>
    </div>
  );
}
