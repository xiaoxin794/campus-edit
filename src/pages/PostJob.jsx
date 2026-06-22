import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function PostJob() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', description: '', requirements: '', budget: '', deadline: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title || !form.description) {
      alert('请至少填写标题和描述')
      return
    }
    setLoading(true)

    // 获取当前用户 profile
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      navigate('/login')
      return
    }
    const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', user.id).single()

    if (profile) {
      await supabase.from('orders').insert({
        customer_id: profile.id,
        title: form.title,
        description: form.description,
        requirements: form.requirements,
        budget: form.budget || '面议',
        deadline: form.deadline || '可协商',
        status: 'open'
      })
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <span className="text-6xl mb-4">🎉</span>
        <h2 className="text-xl font-bold text-gray-800 mb-2">需求发布成功！</h2>
        <p className="text-gray-500 mb-6">剪辑师们会看到你的需求并接单</p>
        <button onClick={() => navigate('/my-orders')} className="btn-primary">
          查看我的订单
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 py-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">发布剪辑需求</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">标题 *</label>
          <input type="text" className="input-box" placeholder="如：毕业纪念视频剪辑"
            value={form.title} onChange={e => update('title', e.target.value)} required />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">详细描述 *</label>
          <textarea className="input-box min-h-[100px]" placeholder="描述你的视频类型、风格需求、时长等..."
            value={form.description} onChange={e => update('description', e.target.value)} required />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">具体要求</label>
          <textarea className="input-box min-h-[80px]" placeholder="如：需要加字幕、特效、背景音乐等"
            value={form.requirements} onChange={e => update('requirements', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">预算</label>
            <input type="text" className="input-box" placeholder="如：100元"
              value={form.budget} onChange={e => update('budget', e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">截止日期</label>
            <input type="date" className="input-box"
              value={form.deadline} onChange={e => update('deadline', e.target.value)} />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? '发布中...' : '发布需求'}
        </button>
      </form>

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-amber-800 mb-2">💡 温馨提示</h3>
        <ul className="text-xs text-amber-700 space-y-1">
          <li>• 描述越详细，剪辑师越能理解你的需求</li>
          <li>• 剪辑师接单后，请通过微信转账给平台管理员托管资金</li>
          <li>• 验收满意后再确认放款，不满意可申请修改</li>
        </ul>
      </div>
    </div>
  )
}
