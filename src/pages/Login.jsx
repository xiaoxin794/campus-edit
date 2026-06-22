import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setError(err.message === 'Invalid login credentials'
        ? '邮箱或密码错误'
        : '登录失败，请重试')
    } else {
      navigate('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col justify-center px-6">
      <div className="text-center mb-8">
        <span className="text-5xl block mb-4">🎬</span>
        <h1 className="text-2xl font-bold text-gray-800">校园剪辑</h1>
        <p className="text-gray-500 mt-2">学生剪辑接单平台 · 登录</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email" className="input-box" placeholder="邮箱地址" required
          value={email} onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password" className="input-box" placeholder="密码" required
          value={password} onChange={e => setPassword(e.target.value)}
        />

        {error && (
          <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg text-center">{error}</div>
        )}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? '登录中...' : '登录'}
        </button>
      </form>

      <div className="text-center mt-6">
        <span className="text-gray-400 text-sm">还没有账号？</span>
        <Link to="/register" className="text-indigo-500 text-sm font-medium ml-1">立即注册</Link>
      </div>
    </div>
  )
}
