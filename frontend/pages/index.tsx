import { useEffect, useState } from "react";
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
      <section className="relative bg-gradient-to-r from-green-500 via-emerald-600 to-teal-700 text-white py-24 px-6 text-center overflow-hidden">
        {/* Floating eco icons for vibe */}
        <div className="absolute inset-0 opacity-20 bg-[url('/images/leaves-pattern.png')] bg-cover" />

        <h1 className="relative text-4xl md:text-6xl font-extrabold drop-shadow-lg">
          Welcome to <span className="text-yellow-300">EcoEdu 🌱</span>
        </h1>
        <p className="relative mt-4 text-lg md:text-xl text-gray-100 max-w-2xl mx-auto">
          Explore, Learn, and Share Sustainability with a global community.
        </p>
        <div className="relative mt-8 flex justify-center">
          <input
            type="text"
            placeholder="🔍 Search eco posts..."
            className="px-4 py-3 rounded-l-lg w-72 md:w-96 focus:outline-none text-gray-900 shadow-lg"
          />
          <button className="bg-yellow-400 px-6 py-3 rounded-r-lg hover:bg-yellow-500 transition font-semibold text-gray-900 shadow-lg">
            Search
          </button>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8 text-center">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow hover:scale-105 transition">
          <h2 className="text-2xl font-bold text-green-600">🌍 Community</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Join eco-warriors from across the globe
            comming soon...
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow hover:scale-105 transition">
          <h2 className="text-2xl font-bold text-blue-600">📚 Learn</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Gain knowledge with quizzes, posts, and challenges.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow hover:scale-105 transition">
          <h2 className="text-2xl font-bold text-yellow-600">🌱 Act</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Take real actions and inspire others by sharing stories.
          </p>
        </div>
      </section>

      {/* Posts Section */}
      <section className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {posts.length > 0 ? (
          posts.map((p) => (
            <PostCard key={p.id} {...p} onLike={() => like(p.id)} />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-600 dark:text-gray-300">
            🌿 No posts yet. Be the first to share your eco journey!
          </div>
        )}
      </section>
    </div>
  );
}
