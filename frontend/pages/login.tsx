import Navbar from '../components/Navbar'
import { useState } from 'react'
import { login } from '../src/api'
import { useRouter } from 'next/router'

export default function Login({theme, toggleTheme}){
  const [u,setU]=useState('demo'), [p,setP]=useState('pass')
  const r = useRouter()
  const submit = async (e)=>{ e.preventDefault(); try{ await login(u,p); r.push('/'); }catch(e){ alert('Login failed') } }
  return (<div>
    <Navbar theme={theme} toggleTheme={toggleTheme} />
    <div className="container mt-8 max-w-md">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form onSubmit={submit} className="space-y-3">
        <input value={u} onChange={e=>setU(e.target.value)} className="w-full p-3 border rounded" placeholder="username" />
        <input value={p} onChange={e=>setP(e.target.value)} className="w-full p-3 border rounded" placeholder="password" type="password" />
        <button className="w-full p-3 bg-violet-600 text-white rounded">Login</button>
      </form>
    </div>
  </div>)
}
