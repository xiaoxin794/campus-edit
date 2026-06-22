import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Search, PlusCircle, ClipboardList, User } from 'lucide-react'

const tabs = [
  { path: '/', label: '首页', icon: Home },
  { path: '/post-job', label: '发需求', icon: PlusCircle },
  { path: '/my-orders', label: '订单', icon: ClipboardList },
  { path: '/profile', label: '我的', icon: User },
]

export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎬</span>
          <h1 className="text-lg font-bold text-gray-800">校园剪辑</h1>
        </div>
        <span className="text-xs text-gray-400">学生剪辑接单平台</span>
      </header>

      {/* 页面内容 */}
      <main className="flex-1 page-content">
        {children}
      </main>

      {/* 底部导航栏 */}
      {tabs.some(t => t.path === location.pathname || (t.path !== '/' && location.pathname.startsWith(t.path))) && (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 flex items-center justify-around py-2 z-50 safe-area-bottom">
          {tabs.map(tab => {
            const isActive = tab.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(tab.path)
            const Icon = tab.icon
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center gap-1 px-3 py-1 transition-colors ${
                  isActive ? 'text-indigo-500' : 'text-gray-400'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[11px] font-medium">{tab.label}</span>
              </button>
            )
          })}
        </nav>
      )}
    </div>
  )
}
