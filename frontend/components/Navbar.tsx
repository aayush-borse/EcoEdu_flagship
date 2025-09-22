import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

export default function Navbar() {
  const router = useRouter();
  const { t } = useTranslation();

  // Add Hunt page to links
  const links = [
    { href: "/", label: t("home") },
    { href: "/reels", label: t("reels") },
    { href: "/quiz", label: t("quiz") },
    { href: "/leaderboard", label: t("leaderboard") },
    { href: "/hunt", label: t("hunt") }, // NEW Hunt link
  ];

  const changeLanguage = (lng: string) => {
    router.push(router.pathname, router.asPath, { locale: lng });
  };

  return (
    <nav className="bg-zinc-800 shadow p-4 flex items-center sticky top-0 z-50">
      {/* Brand on left with logo image */}
      <div className="cursor-default select-none">
        <Link href="/">
          <img
            src="/newlogo.png"
            alt="EcoXP Logo"
            className="h-8"
            loading="lazy"
          />
        </Link>
      </div>

      {/* Push links and icon to the far right */}
      <div className="flex-grow" />

      <div className="flex items-center space-x-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`whitespace-nowrap ${
              router.pathname === link.href
                ? "text-yellow-400 font-semibold"
                : "hover:text-yellow-200 text-white"
            }`}
          >
            {link.label}
          </Link>
        ))}

        {/* Language Switcher */}
        <select
          value={router.locale}
          onChange={(e) => changeLanguage(e.target.value)}
          className="bg-zinc-700 text-white px-2 py-1 rounded cursor-pointer"
          aria-label="Select language"
        >
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
        </select>

        {/* Profile Icon (clickable and routed) */}
        <Link
          href="/profile"
          className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center cursor-pointer"
          title="Profile"
        >
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
