import Navbar from '../components/Navbar'
import { useState } from 'react'
import { register } from '../src/api'
import { useRouter } from 'next/router'

export default function Register({theme, toggleTheme}){
  const [u,setU]=useState(''), [p,setP]=useState('')
  const r = useRouter()
  const submit = async (e)=>{ e.preventDefault(); try{ await register(u,p); r.push('/'); }catch(e){ alert('Register failed') } }
  return (<div>
    <Navbar theme={theme} toggleTheme={toggleTheme} />
    <div className="container mt-8 max-w-md">
      <h2 className="text-2xl font-bold mb-4">Sign up</h2>
      <form onSubmit={submit} className="space-y-3">
        <input value={u} onChange={e=>setU(e.target.value)} className="w-full p-3 border rounded" placeholder="username" />
        <input value={p} onChange={e=>setP(e.target.value)} className="w-full p-3 border rounded" placeholder="password" type="password" />
        <button className="w-full p-3 bg-violet-600 text-white rounded">Create account</button>
      </form>
    </div>
  </div>)
}
