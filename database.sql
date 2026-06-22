-- ========== 校园剪辑平台 - 数据库建表 SQL ==========
-- 在 Supabase SQL Editor 中全部执行（一次性粘贴运行）

-- 1. 用户资料表
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role TEXT CHECK (role IN ('customer', 'editor')) DEFAULT 'customer',
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  school TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 剪辑师资料表
CREATE TABLE editor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  bio TEXT DEFAULT '',
  skills TEXT[] DEFAULT '{}',
  price_range TEXT DEFAULT '面议',
  portfolio_urls TEXT[] DEFAULT '{}',
  completion_rate FLOAT DEFAULT 1.0,
  avg_rating FLOAT DEFAULT 5.0,
  total_orders INT DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. 订单表
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES profiles(id),
  editor_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  requirements TEXT DEFAULT '',
  budget TEXT DEFAULT '面议',
  status TEXT CHECK (status IN ('open','assigned','paid','editing','delivered','completed','cancelled')) DEFAULT 'open',
  deadline TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- 4. 评价表
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES profiles(id),
  editor_id UUID REFERENCES profiles(id),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. 自动创建 profile 的触发器（用户注册后自动建 profile）
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, display_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', '新用户'), 'customer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 6. Row Level Security（安全策略）
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE editor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 所有人可读
CREATE POLICY "Public read" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public read editor" ON editor_profiles FOR SELECT USING (true);
-- 本人可修改
CREATE POLICY "Own profile update" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Own editor update" ON editor_profiles FOR UPDATE
  USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));
-- 订单：相关用户可读
CREATE POLICY "Order read" ON orders FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM profiles WHERE id IN (customer_id, editor_id))
);
-- 订单：客户可创建
CREATE POLICY "Order insert" ON orders FOR INSERT WITH CHECK (
  auth.uid() = (SELECT user_id FROM profiles WHERE id = customer_id)
);
-- 订单：相关用户可更新
CREATE POLICY "Order update" ON orders FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM profiles WHERE id IN (customer_id, editor_id))
);
-- 评价：所有人可读
CREATE POLICY "Review read" ON reviews FOR SELECT USING (true);
-- 评价：客户可创建
CREATE POLICY "Review insert" ON reviews FOR INSERT WITH CHECK (
  auth.uid() = (SELECT user_id FROM profiles WHERE id = customer_id)
);
