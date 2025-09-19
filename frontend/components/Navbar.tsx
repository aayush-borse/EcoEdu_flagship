import Link from "next/link";
import { useRouter } from "next/router";

export default function Navbar() {
  const router = useRouter();

  const links = [
    { href: "/", label: "Home" },
    { href: "/reels", label: "Reels" },
    { href: "/quiz", label: "Quiz" },
    { href: "/leaderboard", label: "Leaderboard" },
  ];

  return (
    <nav className="bg-zinc-800 shadow p-4 flex items-center sticky top-0 z-50">
      {/* Brand on left */}
      <div className="text-2xl font-bold text-violet-600 cursor-default select-none">
        EcoEdu
      </div>

      {/* Push links and icon to the far right */}
      <div className="flex-grow" />

      <div className="flex items-center space-x-6">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={`whitespace-nowrap ${router.pathname === link.href ? "text-yellow-400 font-semibold" : "hover:text-yellow-200 text-white"}`}>
            {link.label}
          </Link>
        ))}

        {/* Profile Icon (now clickable and routed) */}
        <Link href="/profile" className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center cursor-pointer" title="Profile">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5.121 17.804A9 9 0 1118.365 6.466M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </Link>
      </div>
    </nav>
  );
}
