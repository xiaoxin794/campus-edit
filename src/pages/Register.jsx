import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('customer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('密码至少6位')
      return
    }
    setLoading(true)

    const { data, error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } }
    })
    if (signUpErr) {
      setError(signUpErr.message.includes('already')
        ? '该邮箱已注册'
        : '注册失败，请重试')
      setLoading(false)
      return
    }

    // 等 profile 自动创建后更新角色
    if (role === 'editor' && data.user) {
      // 等触发器创建 profile
      await new Promise(r => setTimeout(r, 1000))
      const { data: profile } = await supabase.from('profiles')
        .select('id').eq('user_id', data.user.id).single()
      if (profile) {
        await supabase.from('profiles').update({ role: 'editor' }).eq('id', profile.id)
      }
    }

    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col justify-center px-6">
      <div className="text-center mb-8">
        <span className="text-5xl block mb-4">🎬</span>
        <h1 className="text-2xl font-bold text-gray-800">注册账号</h1>
        <p className="text-gray-500 mt-2">加入校园剪辑，找剪辑师或接单赚钱</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="text" className="input-box" placeholder="你的名字" required
          value={name} onChange={e => setName(e.target.value)}
        />
        <input
          type="email" className="input-box" placeholder="邮箱地址" required
          value={email} onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password" className="input-box" placeholder="密码（至少6位）" required
          value={password} onChange={e => setPassword(e.target.value)}
        />

        {/* 角色选择 */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`p-3 rounded-xl border-2 text-center transition-all ${
              role === 'customer'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 text-gray-500'
            }`}
          >
            <div className="text-lg mb-1">📹</div>
            <div className="text-sm font-medium">我找剪辑师</div>
          </button>
          <button
            type="button"
            onClick={() => setRole('editor')}
            className={`p-3 rounded-xl border-2 text-center transition-all ${
              role === 'editor'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 text-gray-500'
            }`}
          >
            <div className="text-lg mb-1">✂️</div>
            <div className="text-sm font-medium">我是剪辑师</div>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg text-center">{error}</div>
        )}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? '注册中...' : '注册'}
        </button>
      </form>

      <div className="text-center mt-6">
        <span className="text-gray-400 text-sm">已有账号？</span>
        <Link to="/login" className="text-indigo-500 text-sm font-medium ml-1">去登录</Link>
      </div>

      <p className="text-center text-gray-400 text-xs mt-4">
        注册即表示同意用户协议和隐私政策
      </p>
    </div>
  )
}
