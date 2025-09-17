import '../styles/globals.css'
import { useEffect, useState } from 'react'

export default function App({ Component, pageProps}){
  const [theme, setTheme] = useState('light')
  useEffect(()=>{
    const t = localStorage.getItem('ecoedu_theme') || 'light'
    setTheme(t)
    if (t === 'dark') document.documentElement.classList.add('dark')
  },[])
  const toggle = ()=>{
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('ecoedu_theme', next)
    document.documentElement.classList.toggle('dark')
  }
  return <Component {...pageProps} theme={theme} toggleTheme={toggle} />
}
