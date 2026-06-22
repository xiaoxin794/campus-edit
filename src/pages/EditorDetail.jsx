import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Star, CheckCircle, Briefcase, Clock, ThumbsUp } from 'lucide-react'

export default function EditorDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [editor, setEditor] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchEditor() }, [id])

  async function fetchEditor() {
    const { data } = await supabase
      .from('editor_profiles')
      .select('*, profile:profiles!inner(*)')
      .eq('id', id).single()

    if (data) {
      setEditor(data)
      const { data: revs } = await supabase
        .from('reviews')
        .select('*, customer:profiles!reviews_customer_id_fkey(display_name)')
        .eq('editor_id', data.profile_id)
        .order('created_at', { ascending: false })
        .limit(10)
      if (revs) setReviews(revs)
    } else {
      // 模拟数据
      setEditor({
        id, profile: { display_name: '小明剪辑', school: '北京大学' },
        skills: ['短视频', 'Vlog', '活动视频', '宣传片'],
        price_range: '50-150元/单', avg_rating: 4.9, total_orders: 36, completion_rate: 0.98,
        bio: '3年剪辑经验，传媒学院在读，擅长抖音/B站风格短视频剪辑。熟练使用PR、剪映、达芬奇。可接急单，质量保证。'
      })
      setReviews([
        { id: '1', rating: 5, comment: '剪得超好！速度也快，当天就交了👍', customer: { display_name: '王同学' } },
        { id: '2', rating: 5, comment: '很专业，沟通顺畅，按要求改了两次都很耐心', customer: { display_name: '李同学' } },
        { id: '3', rating: 4, comment: '质量不错，就是稍微晚了一点交', customer: { display_name: '张同学' } },
      ])
    }
    setLoading(false)
  }

  if (loading) return <div className="text-center py-16 text-gray-400">加载中...</div>
  if (!editor) return <div className="text-center py-16 text-gray-400">剪辑师不存在</div>

  return (
    <div>
      {/* 头部卡片 */}
      <div className="bg-white px-4 py-6 text-center border-b border-gray-100">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-3">
          {editor.profile?.display_name?.[0] || '?'}
        </div>
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-xl font-bold">{editor.profile?.display_name}</h1>
          {editor.completion_rate >= 0.95 && <CheckCircle size={18} className="text-blue-500" />}
        </div>
        <p className="text-gray-500 text-sm mt-1">{editor.profile?.school} · {editor.bio?.slice(0, 30)}...</p>

        {/* 数据栏 */}
        <div className="flex justify-center gap-8 mt-4">
          <div className="text-center">
            <div className="flex items-center gap-1 text-amber-500 font-bold text-lg">
              <Star size={16} fill="#f59e0b" />{editor.avg_rating?.toFixed(1)}
            </div>
            <div className="text-xs text-gray-400">评分</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-gray-800">{editor.total_orders}</div>
            <div className="text-xs text-gray-400">完成订单</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-emerald-500">{(editor.completion_rate * 100).toFixed(0)}%</div>
            <div className="text-xs text-gray-400">完成率</div>
          </div>
        </div>
      </div>

      {/* 技能 & 价格 */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3">擅长领域</h3>
          <div className="flex flex-wrap gap-2">
            {(editor.skills || []).map(s => (
              <span key={s} className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full text-sm">{s}</span>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-gray-500 text-sm">参考价格</span>
            <span className="text-indigo-600 font-bold text-lg">{editor.price_range}</span>
          </div>
        </div>

        {/* 简介 */}
        <div className="bg-white rounded-xl p-4 mt-3 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-2">个人介绍</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{editor.bio}</p>
        </div>

        {/* 评价 */}
        <div className="bg-white rounded-xl p-4 mt-3 mb-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3">客户评价（{reviews.length}）</h3>
          {reviews.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">暂无评价</p>
          ) : (
            <div className="space-y-3">
              {reviews.map(r => (
                <div key={r.id} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{r.customer?.display_name}</span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} fill={i < r.rating ? '#f59e0b' : 'none'}
                          className={i < r.rating ? 'text-amber-500' : 'text-gray-300'} />
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className="text-sm text-gray-500 mt-1">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 底部下单按钮 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 p-4 z-40">
        <button onClick={() => navigate('/post-job')} className="btn-primary">
          找 TA 剪辑
        </button>
      </div>
    </div>
  )
}
