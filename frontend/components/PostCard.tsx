import { Heart } from "lucide-react";

interface PostCardProps {
  id: number;
  caption: string;
  image_url?: string;
  likes: number;
  onLike: () => void;
}

export default function PostCard({ caption, image_url, likes, onLike }: PostCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden transition hover:shadow-xl">
      <img
        src={image_url || "/placeholder.jpg"}
        alt={caption}
        className="w-full h-56 object-cover"
      />
      <div className="p-4">
        <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{caption}</p>
        <div className="flex items-center justify-between mt-3">
          <button
            onClick={onLike}
            className="flex items-center gap-2 text-pink-600 hover:text-pink-700 transition"
          >
            <Heart size={20} /> {likes}
          </button>
        </div>
      </div>
    </div>
  );
}
