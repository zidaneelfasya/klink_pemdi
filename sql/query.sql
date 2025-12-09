-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.file_context_uploads (
  id character varying NOT NULL,
  original_name character varying NOT NULL,
  unique_name character varying NOT NULL,
  path_url text,
  upload_date timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT file_context_uploads_pkey PRIMARY KEY (id)
);
CREATE TABLE public.konsultasi_spbe (
  id integer NOT NULL DEFAULT nextval('konsultasi_spbe_id_seq'::regclass),
  timestamp timestamp without time zone,
  nama_lengkap text,
  nomor_telepon text,
  instansi_organisasi text,
  asal_kota_kabupaten text,
  asal_provinsi text,
  uraian_kebutuhan_konsultasi text,
  skor_indeks_spbe numeric,
  kondisi_implementasi_spbe text,
  fokus_tujuan text,
  mekanisme_konsultasi text,
  surat_permohonan text,
  butuh_konsultasi_lanjut boolean,
  status USER-DEFINED,
  pic_id integer,
  solusi text,
  kategori USER-DEFINED,
  ticket text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT konsultasi_spbe_pkey PRIMARY KEY (id),
  CONSTRAINT konsultasi_spbe_pic_id_fkey FOREIGN KEY (pic_id) REFERENCES public.pic_list(id)
);
CREATE TABLE public.konsultasi_topik (
  konsultasi_id integer NOT NULL,
  topik_id integer NOT NULL,
  CONSTRAINT konsultasi_topik_pkey PRIMARY KEY (konsultasi_id, topik_id),
  CONSTRAINT konsultasi_topik_konsultasi_id_fkey FOREIGN KEY (konsultasi_id) REFERENCES public.konsultasi_spbe(id),
  CONSTRAINT konsultasi_topik_topik_id_fkey FOREIGN KEY (topik_id) REFERENCES public.topik_konsultasi(id)
);
CREATE TABLE public.konsultasi_unit (
  konsultasi_id integer NOT NULL,
  unit_id integer NOT NULL,
  CONSTRAINT konsultasi_unit_pkey PRIMARY KEY (konsultasi_id, unit_id),
  CONSTRAINT konsultasi_unit_konsultasi_id_fkey FOREIGN KEY (konsultasi_id) REFERENCES public.konsultasi_spbe(id),
  CONSTRAINT konsultasi_unit_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.unit_penanggungjawab(id)
);
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  role text NOT NULL CHECK (role = ANY (ARRAY['user'::text, 'assistant'::text])),
  content text NOT NULL,
  thread_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.threads(id)
);
CREATE TABLE public.pic_list (
  id integer NOT NULL DEFAULT nextval('pic_list_id_seq'::regclass),
  nama_pic text NOT NULL UNIQUE,
  CONSTRAINT pic_list_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text,
  phone text,
  email text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  role text DEFAULT 'user'::text,
  nip text,
  jabatan text,
  satuan_kerja text,
  instansi text,
  avatar_url text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.threads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT threads_pkey PRIMARY KEY (id),
  CONSTRAINT threads_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.topik_konsultasi (
  id integer NOT NULL DEFAULT nextval('topik_konsultasi_id_seq'::regclass),
  nama_topik text NOT NULL UNIQUE,
  CONSTRAINT topik_konsultasi_pkey PRIMARY KEY (id)
);
CREATE TABLE public.unit_penanggungjawab (
  id integer NOT NULL DEFAULT nextval('unit_penanggungjawab_id_seq'::regclass),
  nama_unit text NOT NULL UNIQUE,
  nama_pic text,
  CONSTRAINT unit_penanggungjawab_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_unit_penanggungjawab (
  id integer NOT NULL DEFAULT nextval('user_unit_penanggungjawab_id_seq'::regclass),
  user_id uuid NOT NULL,
  unit_id integer NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT user_unit_penanggungjawab_pkey PRIMARY KEY (id),
  CONSTRAINT user_unit_penanggungjawab_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_unit_penanggungjawab_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.unit_penanggungjawab(id)
);