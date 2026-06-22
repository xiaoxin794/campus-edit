import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Clock, CheckCircle, AlertCircle } from 'lucide-react'

const STATUS_MAP = {
  open: { label: '待接单', color: 'bg-blue-100 text-blue-700', icon: Clock },
  assigned: { label: '已接单', color: 'bg-purple-100 text-purple-700', icon: Clock },
  paid: { label: '剪辑中', color: 'bg-amber-100 text-amber-700', icon: Clock },
  editing: { label: '剪辑中', color: 'bg-amber-100 text-amber-700', icon: Clock },
  delivered: { label: '待验收', color: 'bg-emerald-100 text-emerald-700', icon: AlertCircle },
  completed: { label: '已完成', color: 'bg-gray-100 text-gray-600', icon: CheckCircle },
  cancelled: { label: '已取消', color: 'bg-red-100 text-red-500', icon: AlertCircle },
}

export default function MyOrders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [tab, setTab] = useState('customer')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchOrders() }, [tab])

  async function fetchOrders() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', user.id).single()
    if (!profile) { setLoading(false); return }

    const field = tab === 'customer' ? 'customer_id' : 'editor_id'
    const { data } = await supabase.from('orders')
      .select('*, customer:profiles!orders_customer_id_fkey(display_name), editor:profiles!orders_editor_id_fkey(display_name)')
      .eq(field, profile.id)
      .order('created_at', { ascending: false })

    if (data) setOrders(data)
    // 模拟数据
    if (!data || data.length === 0) {
      setOrders([
        { id: 'demo-1', title: '毕业纪念视频剪辑', status: 'editing', budget: '150元', created_at: '2024-06-20',
          customer: { display_name: '张同学' }, editor: { display_name: '小明剪辑' } },
        { id: 'demo-2', title: '社团宣传片', status: 'completed', budget: '300元', created_at: '2024-06-15',
          customer: { display_name: '李同学' }, editor: { display_name: '小红剪辑室' } },
      ])
    }
    setLoading(false)
  }

  return (
    <div className="px-4 py-4">
      {/* Tab 切换 */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
        <button
          onClick={() => setTab('customer')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'customer' ? 'bg-white shadow text-gray-800' : 'text-gray-500'
          }`}
        >我发布的</button>
        <button
          onClick={() => setTab('editor')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'editor' ? 'bg-white shadow text-gray-800' : 'text-gray-500'
          }`}
        >我接的单</button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">加载中...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl block mb-4">📭</span>
          <p className="text-gray-400">暂无订单</p>
          <button onClick={() => navigate('/post-job')} className="btn-primary mt-4">
            发布需求
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.open
            const StatusIcon = statusInfo.icon
            const otherParty = tab === 'customer' ? order.editor : order.customer
            return (
              <div
                key={order.id}
                onClick={() => navigate(`/order/${order.id}`)}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">{order.title}</h3>
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    <StatusIcon size={12} />
                    {statusInfo.label}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {tab === 'customer' ? '剪辑师：' : '客户：'}
                    {otherParty?.display_name || '待分配'}
                  </span>
                  <span className="text-indigo-600 font-semibold">{order.budget}</span>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  {order.created_at?.slice(0, 10)}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
