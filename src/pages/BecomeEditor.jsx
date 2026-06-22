import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function BecomeEditor() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    display_name: '', school: '', bio: '', skills: '', price_range: '', portfolio_urls: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/login'); return }

    setLoading(true)

    // 更新 profile
    const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', user.id).single()
    if (profile) {
      await supabase.from('profiles').update({
        display_name: form.display_name, school: form.school, role: 'editor'
      }).eq('id', profile.id)

      // 创建/更新 editor_profile
      const { data: existing } = await supabase.from('editor_profiles').select('id').eq('profile_id', profile.id).single()
      const editorData = {
        profile_id: profile.id,
        bio: form.bio,
        skills: form.skills.split(/[,，]/).map(s => s.trim()).filter(Boolean),
        price_range: form.price_range || '面议',
        portfolio_urls: form.portfolio_urls.split(/[,，\n]/).map(s => s.trim()).filter(Boolean),
      }
      if (existing) {
        await supabase.from('editor_profiles').update(editorData).eq('id', existing.id)
      } else {
        await supabase.from('editor_profiles').insert(editorData)
      }
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <span className="text-6xl mb-4">🎉</span>
        <h2 className="text-xl font-bold text-gray-800 mb-2">入驻申请已提交！</h2>
        <p className="text-gray-500 mb-6">现在你可以接单赚钱了</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          返回首页
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 py-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">成为剪辑师</h2>
      <p className="text-sm text-gray-500 mb-4">填写以下信息，开始接单赚钱</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">展示名称 *</label>
          <input type="text" className="input-box" placeholder="如：小明剪辑工作室" required
            value={form.display_name} onChange={e => update('display_name', e.target.value)} />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">学校</label>
          <input type="text" className="input-box" placeholder="如：北京大学"
            value={form.school} onChange={e => update('school', e.target.value)} />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">个人介绍 *</label>
          <textarea className="input-box min-h-[80px]" placeholder="介绍你的剪辑经验、擅长风格、使用软件等" required
            value={form.bio} onChange={e => update('bio', e.target.value)} />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">擅长技能</label>
          <input type="text" className="input-box" placeholder="如：短视频, Vlog, 宣传片（用逗号分隔）"
            value={form.skills} onChange={e => update('skills', e.target.value)} />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">参考报价</label>
          <input type="text" className="input-box" placeholder="如：50-150元/单"
            value={form.price_range} onChange={e => update('price_range', e.target.value)} />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">作品链接</label>
          <textarea className="input-box min-h-[60px]" placeholder="粘贴你的作品链接，用逗号或换行分隔"
            value={form.portfolio_urls} onChange={e => update('portfolio_urls', e.target.value)} />
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? '提交中...' : '提交入驻'}
        </button>
      </form>
    </div>
  )
}
