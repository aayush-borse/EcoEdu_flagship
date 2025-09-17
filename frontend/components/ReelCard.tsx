interface ReelCardProps {
  video_url: string;
  likes: number;
}

const ReelCard = ({ video_url, likes }: ReelCardProps) => (
  <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-md my-4">
    <video src={video_url} controls className="w-full rounded-xl" />
    <p className="mt-2">Likes: {likes}</p>
  </div>
);

export default ReelCard;
