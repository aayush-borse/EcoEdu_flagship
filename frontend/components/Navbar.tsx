// components/Navbar.tsx
import Link from "next/link";
import { useRouter } from "next/router";

export default function Navbar() {
  const router = useRouter();

  const links = [
    { href: "/", label: "Home" },
    { href: "/reels", label: "Reels" },
    { href: "/quiz", label: "Quiz" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <nav className="bg-white dark:bg-zinc-900 shadow p-4 flex justify-between items-center sticky top-0 z-50">
      <div className="text-2xl font-bold text-violet-600">EcoEdu</div>
      <div className="space-x-6 flex items-center">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${
              router.pathname === link.href
                ? "text-violet-600 font-semibold"
                : "text-gray-600 dark:text-gray-300"
            } hover:text-violet-500`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
