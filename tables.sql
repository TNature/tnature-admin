-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.addresses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  full_name text NOT NULL,
  phone_number text NOT NULL,
  address_line text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  pincode text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT addresses_pkey PRIMARY KEY (id),
  CONSTRAINT addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  image text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity integer NOT NULL,
  price numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  address_id uuid NOT NULL,
  total_amount numeric NOT NULL,
  payment_method text NOT NULL,
  status text DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT now(),
  payment_status character varying DEFAULT 'pending'::character varying,
  razorpay_payment_id character varying,
  razorpay_order_id character varying,
  razorpay_signature character varying,
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT orders_address_id_fkey FOREIGN KEY (address_id) REFERENCES public.addresses(id)
);
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  image text,
  price numeric NOT NULL,
  rating numeric DEFAULT 0,
  unit character varying,
  category_id uuid,
  is_best_seller boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES public.categories(id)
);

-- --------------------------------------------------------
-- SUPABASE STORAGE BUCKET: products
-- --------------------------------------------------------

-- 1. Create the bucket
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('products', 'products', true);

-- 2. Allow public read access to the bucket
-- CREATE POLICY "Public Access"
-- ON storage.objects FOR SELECT
-- USING ( bucket_id = 'products' );

-- 3. Allow authenticated users to upload files to the bucket
-- CREATE POLICY "Authenticated users can upload"
-- ON storage.objects FOR INSERT
-- WITH CHECK ( bucket_id = 'products' AND auth.role() = 'authenticated' );

-- 4. Allow authenticated users to update/delete files
-- CREATE POLICY "Authenticated users can update"
-- ON storage.objects FOR UPDATE
-- WITH CHECK ( bucket_id = 'products' AND auth.role() = 'authenticated' );

-- CREATE POLICY "Authenticated users can delete"
-- ON storage.objects FOR DELETE
-- USING ( bucket_id = 'products' AND auth.role() = 'authenticated' );

-- --------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------

-- -- Enable RLS on all tables
-- ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- -- 1. Products
-- CREATE POLICY "Super admin full access to products" ON public.products FOR ALL TO authenticated USING ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'super-admin' ) WITH CHECK ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'super-admin' );
-- CREATE POLICY "Public read access to products" ON public.products FOR SELECT USING ( true );

-- -- 2. Categories
-- CREATE POLICY "Super admin full access to categories" ON public.categories FOR ALL TO authenticated USING ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'super-admin' ) WITH CHECK ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'super-admin' );
-- CREATE POLICY "Public read access to categories" ON public.categories FOR SELECT USING ( true );

-- -- 3. Orders
-- CREATE POLICY "Super admin full access to orders" ON public.orders FOR ALL TO authenticated USING ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'super-admin' ) WITH CHECK ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'super-admin' );
-- CREATE POLICY "Users manage own orders" ON public.orders FOR ALL TO authenticated USING ( auth.uid() = user_id ) WITH CHECK ( auth.uid() = user_id );

-- -- 4. Order Items
-- CREATE POLICY "Super admin full access to order_items" ON public.order_items FOR ALL TO authenticated USING ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'super-admin' ) WITH CHECK ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'super-admin' );
-- CREATE POLICY "Users manage own order items" ON public.order_items FOR ALL TO authenticated USING ( EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()) ) WITH CHECK ( EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()) );

-- -- 5. Addresses
-- CREATE POLICY "Super admin full access to addresses" ON public.addresses FOR ALL TO authenticated USING ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'super-admin' ) WITH CHECK ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'super-admin' );
-- CREATE POLICY "Users manage own addresses" ON public.addresses FOR ALL TO authenticated USING ( auth.uid() = user_id ) WITH CHECK ( auth.uid() = user_id );