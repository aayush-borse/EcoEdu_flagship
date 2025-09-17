interface QuizCardProps {
  question: string;
  options: string[];
  selected?: string;
  onSelect?: (option: string) => void;
}

const QuizCard = ({ question, options, selected, onSelect }: QuizCardProps) => (
  <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-md my-4">
    <p className="font-semibold">{question}</p>
    <div className="mt-2 space-y-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect?.(opt)}
          className={`block w-full text-left p-2 border rounded-md ${
            selected === opt ? "border-blue-500" : "border-gray-300 dark:border-zinc-700"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

export default QuizCard;
