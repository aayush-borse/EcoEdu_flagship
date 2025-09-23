import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  points: number;
  level: number;
  quizzesTaken: number;
}

export default function Profile() {
  const router = useRouter();
  const { t } = useTranslation("common");

  const [user, setUser] = useState<UserProfile>({
    name: "Aayush Borse",
    email: "aayush@example.com",
    avatar: "/images/avatar.png",
    points: 1240,
    level: 5,
    quizzesTaken: 18,
  });

  const achievements = [
    { title: t("eco_warrior"), desc: t("completed_eco_challenges") },
    { title: t("recycler"), desc: t("recycled_items") },
    { title: t("green_streak"), desc: t("logged_in_days") },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-8">
        <button
          onClick={() => router.push("/")}
          className="mb-6 px-4 py-2 bg-teal-500 text-white rounded-lg shadow hover:bg-green-700 transition"
        >
          {t("back_to_home")}
        </button>

        <div className="flex items-center gap-6 border-b pb-6 mb-6">
          <Image
            src={user.avatar}
            alt="User Avatar"
            width={100}
            height={100}
            className="rounded-full border-4 border-green-400"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-green-500 dark:bg-green-500 rounded-xl p-4 text-center">
            <h2 className="text-2xl font-bold text-green-900 dark:text-green-300">{user.points}</h2>
            <p className="text-white dark:text-white">{t("points")}</p>
          </div>
          <div className="bg-blue-300 dark:bg-blue-800 rounded-xl p-4 text-center">
            <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300">{user.level}</h2>
            <p className="text-white dark:text-white">{t("level")}</p>
          </div>
          <div className="bg-purple-300 dark:bg-purple-800 rounded-xl p-4 text-center">
            <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-300">{user.quizzesTaken}</h2>
            <p className="text-gray-600 dark:text-gray-300">{t("quizzes")}</p>
          </div>
        </div>

        {/* Achievements Section */}
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{t("achievements")}</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {achievements.map((a, i) => (
            <div key={i} className="bg-teal-100 dark:bg-green-800 p-5 rounded-xl shadow hover:scale-[1.02] transition">
              <h3 className="text-lg font-semibold">{a.title}</h3>
              <p className="text-gray-700 dark:text-gray-300">{a.desc}</p>
            </div>
          ))}
        </div>

        {/* Editable Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{t("edit_profile")}</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("name")}</label>
              <input
                type="text"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("email")}</label>
              <input
                type="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2 bg-teal-500 text-white rounded-lg shadow hover:bg-green-700 transition"
            >
              {t("save_changes")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };

}
