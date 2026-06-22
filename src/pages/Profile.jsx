import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { User, Settings, LogOut, Star, Briefcase, ChevronRight, Shield } from 'lucide-react'

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [editorProfile, setEditorProfile] = useState(null)

  useEffect(() => { fetchUser() }, [])

  async function fetchUser() {
    const { data: { user: u } } = await supabase.auth.getUser()
    if (u) {
      setUser(u)
      const { data: p } = await supabase.from('profiles').select('*').eq('user_id', u.id).single()
      setProfile(p)
      if (p?.role === 'editor') {
        const { data: ep } = await supabase.from('editor_profiles').select('*').eq('profile_id', p.id).single()
        setEditorProfile(ep)
      }
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    navigate('/')
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6">
        <span className="text-6xl mb-4">🎬</span>
        <h2 className="text-xl font-bold text-gray-800 mb-2">欢迎来到校园剪辑</h2>
        <p className="text-gray-500 text-center mb-6">登录后即可发布需求或接单赚钱</p>
        <button onClick={() => navigate('/login')} className="btn-primary">登录 / 注册</button>
      </div>
    )
  }

  return (
    <div className="px-4 py-4">
      {/* 用户信息卡片 */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {profile?.display_name?.[0] || user.email?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800">{profile?.display_name || '用户'}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
              profile?.role === 'editor' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
            }`}>
              {profile?.role === 'editor' ? '剪辑师' : '客户'}
            </span>
          </div>
        </div>

        {/* 剪辑师数据 */}
        {profile?.role === 'editor' && editorProfile && (
          <div className="flex justify-around mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star size={14} fill="#f59e0b" />{editorProfile.avg_rating?.toFixed(1)}
              </div>
              <div className="text-xs text-gray-400">评分</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-800">{editorProfile.total_orders}</div>
              <div className="text-xs text-gray-400">订单数</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-emerald-500">{(editorProfile.completion_rate * 100).toFixed(0)}%</div>
              <div className="text-xs text-gray-400">完成率</div>
            </div>
          </div>
        )}
      </div>

      {/* 功能菜单 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4">
        <MenuItem icon={Briefcase} label="我的订单" onClick={() => navigate('/my-orders')} />
        {profile?.role !== 'editor' && (
          <MenuItem icon={Star} label="成为剪辑师" onClick={() => navigate('/become-editor')} />
        )}
        {profile?.role === 'editor' && (
          <MenuItem icon={Settings} label="编辑剪辑师资料" onClick={() => navigate('/become-editor')} />
        )}
        <MenuItem icon={Shield} label="资金安全说明" onClick={() => alert('平台采用资金托管模式：\n1. 客户下单后将费用支付给平台\n2. 剪辑师交付成品\n3. 客户验收后平台放款\n\n目前为内测阶段，请通过微信转账给平台管理员')} />
      </div>

      {/* 关于 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <h4 className="font-medium text-gray-800 mb-2">关于校园剪辑</h4>
        <p className="text-xs text-gray-400 leading-relaxed">
          校园剪辑是一个学生剪辑接单平台，连接需要剪辑的同学和有剪辑技能的同学。
          我们采用资金托管模式保障双方权益，让每一单都安心交易。
        </p>
      </div>

      {/* 退出登录 */}
      <button onClick={handleLogout}
        className="w-full py-3 text-red-500 text-sm font-medium flex items-center justify-center gap-2">
        <LogOut size={16} />退出登录
      </button>
    </div>
  )
}

function MenuItem({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <Icon size={18} className="text-gray-400" />
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <ChevronRight size={16} className="text-gray-300" />
    </button>
  )
}
