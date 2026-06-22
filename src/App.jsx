import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import EditorDetail from './pages/EditorDetail'
import PostJob from './pages/PostJob'
import MyOrders from './pages/MyOrders'
import OrderDetail from './pages/OrderDetail'
import BecomeEditor from './pages/BecomeEditor'
import Profile from './pages/Profile'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/editor/:id" element={<EditorDetail />} />
          <Route path="/post-job" element={<PostJob />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/order/:id" element={<OrderDetail />} />
          <Route path="/become-editor" element={<BecomeEditor />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
