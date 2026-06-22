import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Search, Star, MapPin, CheckCircle } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  const [editors, setEditors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchEditors()
  }, [])

  async function fetchEditors() {
    const { data } = await supabase
      .from('editor_profiles')
      .select('*, profile:profiles!inner(*)')
      .eq('is_available', true)
      .order('avg_rating', { ascending: false })

    if (data) setEditors(data)
    setLoading(false)
  }

  // 模拟数据（数据库没建好时展示）
  const mockEditors = [
    { id: '1', profile: { display_name: '小明剪辑', school: '北京大学' }, skills: ['短视频', 'Vlog'], price_range: '50-150元/单', avg_rating: 4.9, total_orders: 36, completion_rate: 0.98, bio: '3年剪辑经验，擅长抖音/B站风格' },
    { id: '2', profile: { display_name: '小红的剪辑室', school: '浙江大学' }, skills: ['宣传片', '活动视频'], price_range: '100-300元/单', avg_rating: 4.8, total_orders: 52, completion_rate: 0.96, bio: '校园官方合作剪辑师' },
    { id: '3', profile: { display_name: '阿杰影视', school: '武汉大学' }, skills: ['微电影', 'MV'], price_range: '200-500元/单', avg_rating: 4.7, total_orders: 18, completion_rate: 1.0, bio: '电影学院在读，专业级剪辑' },
  ]

  const displayEditors = editors.length > 0 ? editors : mockEditors

  return (
    <div>
      {/* 搜索栏 */}
      <div className="px-4 py-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" className="input-box pl-10" placeholder="搜索剪辑师、技能..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* 快捷入口 */}
      <div className="px-4 mb-4 grid grid-cols-2 gap-3">
        <button onClick={() => navigate('/post-job')}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4 rounded-xl text-left">
          <div className="text-lg mb-1">📋</div>
          <div className="font-semibold text-sm">发布剪辑需求</div>
          <div className="text-xs opacity-80 mt-0.5">找到合适的剪辑师</div>
        </button>
        <button onClick={() => navigate('/become-editor')}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 rounded-xl text-left">
          <div className="text-lg mb-1">✂️</div>
          <div className="font-semibold text-sm">成为剪辑师</div>
          <div className="text-xs opacity-80 mt-0.5">接单赚零花钱</div>
        </button>
      </div>

      {/* 剪辑师列表 */}
      <div className="px-4">
        <h2 className="text-base font-bold text-gray-800 mb-3">推荐剪辑师</h2>
        {loading ? (
          <div className="text-center py-8 text-gray-400">加载中...</div>
        ) : (
          <div className="space-y-3">
            {displayEditors.map(editor => (
              <div
                key={editor.id}
                onClick={() => navigate(`/editor/${editor.id}`)}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center gap-3">
                  {/* 头像 */}
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                    {editor.profile?.display_name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800 truncate">
                        {editor.profile?.display_name}
                      </h3>
                      {editor.completion_rate >= 0.95 && (
                        <CheckCircle size={14} className="text-blue-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <MapPin size={12} />
                      <span>{editor.profile?.school || '在校学生'}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star size={14} fill="#f59e0b" />
                      <span className="font-semibold text-sm">{editor.avg_rating?.toFixed(1)}</span>
                    </div>
                    <div className="text-xs text-gray-400">{editor.total_orders}单</div>
                  </div>
                </div>

                {/* 技能标签 & 价格 */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex gap-1 flex-wrap">
                    {(editor.skills || []).slice(0, 3).map(skill => (
                      <span key={skill} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <span className="text-indigo-600 font-semibold text-sm">{editor.price_range}</span>
                </div>

                {editor.bio && (
                  <p className="text-xs text-gray-400 mt-2 truncate">{editor.bio}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
