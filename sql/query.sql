CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);
create table threads (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    user_id uuid references auth.users(id) on delete cascade,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Tabel messages
create table messages (
    id uuid primary key default gen_random_uuid(),
    role text check (role in ('user', 'assistant')) not null,
    content text not null,
    thread_id uuid references threads(id) on delete cascade,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);