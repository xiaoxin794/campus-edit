import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Clock, CheckCircle, AlertCircle, MessageCircle, Star } from 'lucide-react'

const STATUS_MAP = {
  open: { label: '待接单', color: 'text-blue-600', bg: 'bg-blue-50' },
  assigned: { label: '已接单', color: 'text-purple-600', bg: 'bg-purple-50' },
  paid: { label: '剪辑中', color: 'text-amber-600', bg: 'bg-amber-50' },
  editing: { label: '剪辑中', color: 'text-amber-600', bg: 'bg-amber-50' },
  delivered: { label: '待验收', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  completed: { label: '已完成', color: 'text-gray-600', bg: 'bg-gray-50' },
  cancelled: { label: '已取消', color: 'text-red-600', bg: 'bg-red-50' },
}

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [reviewing, setReviewing] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchOrder() }, [id])

  async function fetchOrder() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    // 尝试从 Supabase 获取
    const { data, error } = await supabase.from('orders')
      .select('*, customer:profiles!orders_customer_id_fkey(*), editor:profiles!orders_editor_id_fkey(*)')
      .eq('id', id).single()

    if (data) {
      setOrder(data)
      const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
      if (profile) {
        setUserRole(data.customer_id === profile.id ? 'customer' : data.editor_id === profile.id ? 'editor' : null)
      }
    } else {
      // 模拟数据
      setOrder({
        id, title: '毕业纪念视频剪辑', description: '需要剪辑一个3-5分钟的毕业纪念视频，包括班级合影、活动花絮、个人感言等素材，希望走温情风格。', requirements: '需要加字幕、背景音乐、转场特效，输出1080p',
        budget: '150元', status: 'editing', deadline: '2024-07-01',
        created_at: '2024-06-20',
        customer: { display_name: '张同学', school: '北京大学' },
        editor: { display_name: '小明剪辑', school: '北京大学' },
      })
      setUserRole('customer')
    }
    setLoading(false)
  }

  async function updateStatus(newStatus) {
    await supabase.from('orders').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id)
    fetchOrder()
  }

  async function submitReview() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', user.id).single()

    await supabase.from('reviews').insert({
      order_id: id, customer_id: profile.id, editor_id: order.editor_id,
      rating, comment
    })
    await updateStatus('completed')
    setReviewing(false)
  }

  if (loading) return <div className="text-center py-16 text-gray-400">加载中...</div>
  if (!order) return <div className="text-center py-16 text-gray-400">订单不存在</div>

  const statusInfo = STATUS_MAP[order.status]

  return (
    <div className="px-4 py-4">
      {/* 状态横幅 */}
      <div className={`${statusInfo.bg} rounded-xl p-4 mb-4 text-center`}>
        <span className={`font-bold text-lg ${statusInfo.color}`}>{statusInfo.label}</span>
        <p className="text-xs text-gray-500 mt-1">订单号：{order.id?.slice(0, 8)}</p>
      </div>

      {/* 订单信息 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-3 mb-4">
        <h2 className="font-bold text-lg text-gray-800">{order.title}</h2>
        <p className="text-gray-600 text-sm leading-relaxed">{order.description}</p>
        {order.requirements && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">具体要求</h4>
            <p className="text-sm text-gray-500">{order.requirements}</p>
          </div>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div className="text-sm text-gray-500">预算：<span className="text-indigo-600 font-bold">{order.budget}</span></div>
          <div className="text-sm text-gray-500">截止：{order.deadline}</div>
        </div>
      </div>

      {/* 双方信息 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
          <div className="text-xs text-gray-400 mb-1">客户</div>
          <div className="font-medium text-sm">{order.customer?.display_name}</div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
          <div className="text-xs text-gray-400 mb-1">剪辑师</div>
          <div className="font-medium text-sm">{order.editor?.display_name || '待接单'}</div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="space-y-2">
        {/* 客户：已交付 → 确认完成 */}
        {userRole === 'customer' && order.status === 'delivered' && (
          <div className="space-y-2">
            <button onClick={() => setReviewing(true)} className="btn-primary bg-gradient-to-r from-emerald-500 to-teal-500">
              验收通过，确认完成
            </button>
            <button onClick={() => alert('请联系剪辑师修改')} className="w-full py-3 text-amber-600 text-sm font-medium">
              需要修改，联系剪辑师
            </button>
          </div>
        )}

        {/* 评价弹窗 */}
        {reviewing && (
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">评价剪辑师</h3>
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map(i => (
                <button key={i} onClick={() => setRating(i)}>
                  <Star size={28} fill={i <= rating ? '#f59e0b' : 'none'}
                    className={i <= rating ? 'text-amber-500' : 'text-gray-300'} />
                </button>
              ))}
            </div>
            <textarea className="input-box min-h-[80px] mb-3" placeholder="写点评价吧..."
              value={comment} onChange={e => setComment(e.target.value)} />
            <button onClick={submitReview} className="btn-primary">提交评价</button>
          </div>
        )}

        {/* 客户：等待中 */}
        {userRole === 'customer' && ['open', 'assigned', 'paid', 'editing'].includes(order.status) && (
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-500">
              {order.status === 'open' ? '等待剪辑师接单中...' :
               order.status === 'editing' || order.status === 'paid' ? '剪辑师正在努力剪辑中...' :
               '剪辑师已接单，请先支付费用到平台账户'}
            </p>
            {order.status === 'assigned' && (
              <div className="mt-3 bg-amber-50 rounded-lg p-3 text-left">
                <p className="text-xs text-amber-800 font-medium mb-2">💡 支付方式</p>
                <p className="text-xs text-amber-700">请通过微信转账 <strong>{order.budget}</strong> 到平台管理员账户，转账备注订单号后4位：<strong>{order.id?.slice(-4)}</strong></p>
              </div>
            )}
          </div>
        )}

        {/* 剪辑师：可接单 */}
        {userRole === 'editor' && order.status === 'open' && (
          <button onClick={() => updateStatus('assigned')} className="btn-primary">
            接单
          </button>
        )}

        {/* 剪辑师：工作中 → 交付 */}
        {userRole === 'editor' && ['paid', 'editing', 'assigned'].includes(order.status) && (
          <div className="space-y-2">
            <button onClick={() => updateStatus('delivered')}
              className="btn-primary bg-gradient-to-r from-emerald-500 to-teal-500">
              提交成品
            </button>
            <p className="text-xs text-gray-400 text-center">提交后等待客户验收</p>
          </div>
        )}
      </div>
    </div>
  )
}
