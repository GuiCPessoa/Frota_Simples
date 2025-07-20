-- Create enums for vehicle types and user roles
CREATE TYPE public.vehicle_type AS ENUM ('car', 'van', 'motorcycle', 'truck');
CREATE TYPE public.supplier_type AS ENUM ('fuel', 'repair');
CREATE TYPE public.user_role AS ENUM ('owner', 'manager', 'driver');

-- Create accounts table
CREATE TABLE public.accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'America/Recife',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create users table (extends auth.users)
CREATE TABLE public.users (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role public.user_role NOT NULL DEFAULT 'driver',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vehicles table
CREATE TABLE public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  plate TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1990),
  type public.vehicle_type NOT NULL,
  current_odometer INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(account_id, plate)
);

-- Create suppliers table
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type public.supplier_type NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user's account_id
CREATE OR REPLACE FUNCTION public.get_user_account_id()
RETURNS UUID AS $$
  SELECT account_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for accounts
CREATE POLICY "Users can view their own account" 
ON public.accounts 
FOR SELECT 
USING (id = public.get_user_account_id());

CREATE POLICY "Users can update their own account" 
ON public.accounts 
FOR UPDATE 
USING (id = public.get_user_account_id());

-- RLS Policies for users
CREATE POLICY "Users can view users in their account" 
ON public.users 
FOR SELECT 
USING (account_id = public.get_user_account_id());

CREATE POLICY "Users can create their own profile" 
ON public.users 
FOR INSERT 
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
USING (id = auth.uid());

-- RLS Policies for vehicles
CREATE POLICY "Users can view vehicles in their account" 
ON public.vehicles 
FOR SELECT 
USING (account_id = public.get_user_account_id());

CREATE POLICY "Users can create vehicles in their account" 
ON public.vehicles 
FOR INSERT 
WITH CHECK (account_id = public.get_user_account_id());

CREATE POLICY "Users can update vehicles in their account" 
ON public.vehicles 
FOR UPDATE 
USING (account_id = public.get_user_account_id());

CREATE POLICY "Users can delete vehicles in their account" 
ON public.vehicles 
FOR DELETE 
USING (account_id = public.get_user_account_id());

-- RLS Policies for suppliers
CREATE POLICY "Users can view suppliers in their account" 
ON public.suppliers 
FOR SELECT 
USING (account_id = public.get_user_account_id());

CREATE POLICY "Users can create suppliers in their account" 
ON public.suppliers 
FOR INSERT 
WITH CHECK (account_id = public.get_user_account_id());

CREATE POLICY "Users can update suppliers in their account" 
ON public.suppliers 
FOR UPDATE 
USING (account_id = public.get_user_account_id());

CREATE POLICY "Users can delete suppliers in their account" 
ON public.suppliers 
FOR DELETE 
USING (account_id = public.get_user_account_id());

-- Create trigger function for handling new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, account_id, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    -- For now, we'll need to handle account creation in the app
    -- This will be updated when the user creates or joins an account
    NULL,
    'driver'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();