import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Navbar from "../components/Navbar";
import API from "../src/api";

interface Reel {
  id: number;
  video_url: string;
  likes: number;
  category: string;
}

export default function Reels() {
  const { t } = useTranslation("common");
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likes, setLikes] = useState<{ [key: number]: number }>({});
  const [comments, setComments] = useState<{ [key: number]: string[] }>({});
  const router = useRouter();

  const fetchReels = async () => {
    try {
      const res = await API.get("/reels/");
      setReels(res.data);

      const initialLikes: { [key: number]: number } = {};
      const initialComments: { [key: number]: string[] } = {};
      res.data.forEach((reel) => {
        initialLikes[reel.id] = reel.likes;
        initialComments[reel.id] = [
          "🔥 Amazing!",
          "So cool 😍",
          "Love this!",
          "Eco vibes 🌱",
        ];
      });
      setLikes(initialLikes);
      setComments(initialComments);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  if (!reels.length)
    return (
      <div>
        <Navbar />
        <div className="flex items-center justify-center h-screen text-white bg-black">
          {t("loading_reels")}
        </div>
      </div>
    );

  const currentReel = reels[currentIndex];

  const nextReel = () => {
    if (currentIndex === reels.length - 1) {
      router.push("/quiz"); // redirect to quiz after last reel
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const likeReel = (id: number) => {
    setLikes((prev) => ({ ...prev, [id]: prev[id] + 1 }));
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      <Navbar />
      <div className="flex flex-col items-center justify-center h-screen">
        {/* Reel Video */}
        <div className="relative w-full max-w-md h-[80vh] rounded-2xl overflow-hidden shadow-lg">
          <video
            src={currentReel.video_url}
            autoPlay
            loop
            controls={false}
            className="w-full h-full object-cover"
          />

          {/* Overlay: Like + Comments */}
          <div className="absolute bottom-6 left-4 right-4 flex justify-between items-end">
            <div>
              <p className="text-lg font-bold">{currentReel.category}</p>
              <div className="mt-2 space-y-1 text-sm text-gray-200">
                {comments[currentReel.id]?.slice(0, 3).map((c, i) => (
                  <p key={i}>💬 {c}</p>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <button
                onClick={() => likeReel(currentReel.id)}
                className="p-3 bg-pink-600 rounded-full shadow-lg hover:bg-pink-700 transition"
              >
                🤍
              </button>
              <p className="text-sm">
                {likes[currentReel.id]} {t("likes")}
              </p>
            </div>
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={nextReel}
          className="mt-6 px-6 py-2 bg-green-600 rounded-full hover:bg-green-700 transition"
        >
          {currentIndex === reels.length - 1 ? t("go_to_quiz") : t("next_reel")}
        </button>
      </div>
    </div>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
