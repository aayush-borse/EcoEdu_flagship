import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../src/api";
import { Crown } from "lucide-react";

interface User {
  id: number;
  username: string;
  points: number;
}

export default function Leaderboard() {
  const [users, setUsers] = useState<User[]>([]);

  const fetchLeaderboard = async () => {
    try {
      const res = await API.get("/leaderboard/");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <section className="py-12 px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-100 mb-8">
          🏆 Leaderboard
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          {users.map((u, i) => (
            <div
              key={u.id}
              className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 last:border-none hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <div className="flex items-center gap-3">
                {i < 3 && <Crown className="text-yellow-500" size={20} />}
                <span className="font-semibold text-gray-800 dark:text-gray-100">
                  {i + 1}. {u.username}
                </span>
              </div>
              <span className="text-pink-600 font-bold">{u.points} pts</span>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-gray-600 dark:text-gray-300 text-lg italic px-4 max-w-lg mx-auto">
          Want to wear the crown next time? <br />
          Embrace every challenge with passion and persistence, and rise to the top! Your journey to greatness starts with that first step—keep pushing, keep growing, and the throne will be yours.
        </div>
      </section>
    </div>
  );
}
