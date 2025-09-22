import '../styles/globals.css';
import { useEffect, useState } from 'react';
import { appWithTranslation } from 'next-i18next';
import 'leaflet/dist/leaflet.css';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const t = localStorage.getItem('ecoedu_theme') || 'light';
    setTheme(t);
    if (t === 'dark') document.documentElement.classList.add('dark');
  }, []);

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('ecoedu_theme', next);
    document.documentElement.classList.toggle('dark');
  };

  return <Component {...pageProps} theme={theme} toggleTheme={toggle} />;
}

export default appWithTranslation(MyApp);
