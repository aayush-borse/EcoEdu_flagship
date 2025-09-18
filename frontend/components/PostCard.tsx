import React from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";

interface PostCardProps {
  id: number;
  caption: string;
  image_url?: string;
  likes: number;
  comments_count?: number;
  shares_count?: number;
  onLike: () => void;
  onComment?: () => void;
  onShare?: () => void;
  link?: string;
}

export default function PostCard({
  caption,
  image_url,
  likes,
  comments_count = 0,
  shares_count = 0,
  onLike,
  onComment,
  onShare,
  link,
}: PostCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden transition hover:shadow-xl w-64 mx-auto">
      {/* Make the image clickable if link is provided */}
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="block">
          <img
            src={image_url || "/placeholder.jpg"}
            alt={caption}
            className="w-full h-56 object-cover"
          />
        </a>
      ) : (
        <img
          src={image_url || "/placeholder.jpg"}
          alt={caption}
          className="w-full h-56 object-cover"
        />
      )}

      <div className="p-4">
        <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{caption}</p>

        {/* Like button */}
        <div className="flex items-center justify-start mt-3 space-x-4">
          <button
            onClick={onLike}
            className="flex items-center gap-2 text-pink-600 hover:text-pink-700 transition"
            aria-label="Like"
          >
            <Heart size={20} /> {likes}
          </button>
        </div>

        {/* Comment and Share buttons */}
        <div className="flex items-center justify-start mt-2 space-x-6 text-gray-600 dark:text-gray-300">
          <button
            onClick={onComment}
            className="flex items-center gap-2 hover:text-gray-900 dark:hover:text-white transition"
            aria-label="Comment"
          >
            <MessageCircle size={18} /> {comments_count}
          </button>

          <button
            onClick={onShare}
            className="flex items-center gap-2 hover:text-gray-900 dark:hover:text-white transition"
            aria-label="Share"
          >
            <Share2 size={18} /> {shares_count}
          </button>
        </div>
      </div>
    </div>
  );
}
