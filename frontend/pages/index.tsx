import { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";
import API from "../src/api";

interface Post {
  id: number;
  caption: string;
  image_url?: string;
  likes: number;
}

export default function Home() {
  const { t } = useTranslation("common");
  const [posts, setPosts] = useState<Post[]>([]);

  const fetchPosts = async () => {
    try {
      const res = await API.get("/posts/");
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const like = async (id: number) => {
    try {
      await API.post(`/posts/${id}/like`);
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-green-500 via-emerald-600 to-teal-700 text-white py-24 px-6 text-center">
        {/* Floating eco icons for vibe */}
        <div className="absolute inset-0 opacity-20 bg-[url('/images/leaves-pattern.png')] bg-cover" />

        <h1 className="relative text-4xl md:text-6xl font-extrabold drop-shadow-lg max-w-4xl mx-auto">
          {t("welcome_message")} <span className="text-yellow-300">EcoXP 🌱</span>
        </h1>
        <p className="relative mt-4 text-lg md:text-xl text-gray-100 max-w-3xl mx-auto">
          {t("hero_description")}
        </p>
        <div className="relative mt-8 flex justify-center hover:cursor-pointer">
          <input
            type="text"
            placeholder={t("search_placeholder")}
            className="px-4 py-3 rounded-l-lg w-72 md:w-96 focus:outline-none text-gray-900 shadow-lg"
          />
          <button className="bg-yellow-400 px-6 py-3 rounded-r-lg hover:bg-yellow-500 transition font-semibold text-gray-900 shadow-lg">
            {t("search")}
          </button>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-10 text-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg hover:scale-105 transition-transform duration-300">
          <img
            src="https://cdn-icons-png.freepik.com/512/3588/3588578.png"
            className="mx-auto mb-4 w-20 h-20"
          />
          <h2 className="text-2xl font-bold text-green-600">🌍 {t("community")}</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {t("community_desc")}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg hover:scale-105 transition-transform duration-300">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkVXI6MZ68PF7k4GDDYNBi-PAUIsgfWKS3UQ&s"
            alt="Learning Icon"
            className="mx-auto mb-4 w-20 object-cover rounded"
          />
          <h2 className="text-2xl font-bold text-blue-600">📚 {t("learn")}</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">{t("learn_desc")}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg hover:scale-105 transition-transform duration-300">
          <img
            src="https://cdn-icons-png.freepik.com/256/17378/17378216.png?semt=ais_white_label"
            alt="Act Icon"
            className="mx-auto mb-4 w-20 h-20"
          />
          <h2 className="text-2xl font-bold text-yellow-600">🌱 {t("act")}</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">{t("act_desc")}</p>
        </div>
      </section>

      {/* Posts Section */}
      <section className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.length > 0 ? (
          posts.map((p) => <PostCard key={p.id} {...p} onLike={() => like(p.id)} />)
        ) : (
          <div className="col-span-full text-center text-gray-600 dark:text-gray-300">
            {t("empty_posts_message")}
          </div>
        )}
      </section>
    </div>
  );
}

// Static props to load translations during build for SSR and SSG
export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
