# KLINK PEMDI - Layanan Konsultasi Digital Pemerintah Daerah

<div align="center">
 
  
  <p>
    <strong>Layanan Konsultasi Digital Pemerintah Daerah Berbasis Chatbot AI</strong>
  </p>
  
  <p>
    Dukung implementasi SPBE dan percepat akses informasi teknis melalui chatbot berbasis RAG yang terintegrasi dengan dokumen resmi Komdigi.
  </p>
</div>

## 📋 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Fitur Utama](#-fitur-utama)
- [Teknologi](#-teknologi)
- [Prasyarat](#-prasyarat)
- [Instalasi](#-instalasi)
  - [Windows](#windows)
  - [Ubuntu Linux](#ubuntu-linux)
- [Konfigurasi](#-konfigurasi)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Struktur Database](#-struktur-database)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Kontribusi](#-kontribusi)

## 📖 Tentang Proyek

KLINK PEMDI adalah platform digital yang menyediakan layanan konsultasi untuk pemerintah daerah dalam implementasi Sistem Pemerintahan Berbasis Elektronik (SPBE). Platform ini menggunakan teknologi AI chatbot dengan pendekatan Retrieval-Augmented Generation (RAG) untuk memberikan respons yang akurat berdasarkan dokumen resmi Kementerian Komunikasi dan Informatika.

## ✨ Fitur Utama

- 🤖 **Chatbot AI dengan RAG**: Konsultasi otomatis menggunakan dokumen resmi
- 📋 **Form Konsultasi Terstruktur**: Pendaftaran konsultasi dengan kategori yang jelas
- 📊 **Dashboard Admin**: Pengelolaan konsultasi dan laporan statistik
- 👥 **Manajemen User**: Sistem autentikasi dan otorisasi berbasis role
- 📈 **Analytics**: Visualisasi data konsultasi dan trends
- 🗺️ **Peta Indonesia**: Visualisasi distribusi konsultasi per wilayah
- 📱 **Responsive Design**: Tampilan optimal di desktop dan mobile
- 🔐 **Row Level Security**: Keamanan data dengan Supabase RLS
- 📋 **Ticket System**: Tracking status konsultasi dengan nomor tiket
- 📊 **Export Data**: Export laporan dalam format Excel

## 🛠 Teknologi

- **Frontend**: Next.js 15 (App Router), TypeScript, React 19
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Styling**: Tailwind CSS, Radix UI, Shadcn/ui
- **Charts**: Recharts
- **Maps**: React Leaflet
- **Forms**: React Hook Form, Zod validation
- **State Management**: React Context API
- **Deployment**: Vercel (recommended)

## 📋 Prasyarat

Sebelum memulai instalasi, pastikan sistem Anda memiliki:

- **Node.js** versi 18.x atau lebih tinggi
- **npm** atau **yarn** sebagai package manager
- **Git** untuk version control
- **Supabase Account** (gratis di [supabase.com](https://supabase.com))
- **Text Editor** (VSCode recommended)

## 🚀 Instalasi

### Windows

#### 1. Install Node.js
1. Download Node.js dari [nodejs.org](https://nodejs.org/)
2. Pilih versi LTS (Long Term Support)
3. Jalankan installer dan ikuti petunjuk instalasi
4. Verifikasi instalasi dengan membuka Command Prompt:
   ```cmd
   node --version
   npm --version
   ```

#### 2. Install Git
1. Download Git dari [git-scm.com](https://git-scm.com/)
2. Jalankan installer dengan pengaturan default
3. Verifikasi instalasi:
   ```cmd
   git --version
   ```

#### 3. Clone Repository
```cmd
git clone https://github.com/username/klink_pemdi.git
cd klink_pemdi
```

#### 4. Install Dependencies
```cmd
npm install
```

### Ubuntu Linux

#### 1. Update System Package
```bash
sudo apt update && sudo apt upgrade -y
```

#### 2. Install Node.js menggunakan NodeSource
```bash
# Install curl jika belum ada
sudo apt install -y curl

# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verifikasi instalasi
node --version
npm --version
```

#### 3. Install Git
```bash
sudo apt install -y git

# Verifikasi instalasi
git --version
```

#### 4. Clone Repository
```bash
git clone https://github.com/username/klink_pemdi.git
cd klink_pemdi
```

#### 5. Install Dependencies
```bash
npm install
```

## ⚙️ Konfigurasi

### 1. Setup Supabase

#### Buat Project Supabase Baru
1. Buka [supabase.com](https://supabase.com) dan login/register
2. Klik "New Project"
3. Isi nama project, database password, dan pilih region terdekat
4. Tunggu hingga project selesai dibuat

#### Setup Database Schema
1. Buka Supabase Dashboard → SQL Editor
2. Copy dan jalankan script SQL dari file `sql/query.sql`:
   ```sql
   -- Copy seluruh isi dari sql/query.sql dan execute
   ```
3. Jalankan juga RLS policies dari `sql/rls-policies.sql` (jika ada)
4. (Opsional) Insert sample data dari `sql/sample-data.sql`

### 2. Konfigurasi Environment Variables

#### Buat file .env.local
```bash
# Windows
copy .env.example .env.local

# Linux
cp .env.example .env.local
```

#### Edit file .env.local
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-supabase-anon-key

# RAG API Configuration (Optional)
RAG_BASE_URL=http://localhost:8000

# WhatsApp API Configuration (Optional)
WHATSAPP_API_URL=http://localhost:5000
```

#### Cara Mendapatkan Supabase Keys:
1. Buka Supabase Dashboard
2. Pilih project Anda
3. Pergi ke Settings → API
4. Copy **Project URL** untuk `NEXT_PUBLIC_SUPABASE_URL`
5. Copy **anon/public key** untuk `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`

### 3. Setup Authentication di Supabase

1. Buka Supabase Dashboard → Authentication → Settings
2. Konfigurasikan Site URL: `http://localhost:3000`
3. Tambahkan Redirect URLs:
   - `http://localhost:3000/auth/callback`
   - Domain production jika sudah deploy

### 4. Setup Storage (Optional)
Jika menggunakan file upload:
1. Buka Supabase Dashboard → Storage
2. Buat bucket baru bernama `uploads`
3. Set bucket sebagai public

## 🏃‍♂️ Menjalankan Aplikasi

### Development Mode
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

### Build Production
```bash
npm run build
npm start
```

### Lint Code
```bash
npm run lint
```

## 🗄️ Struktur Database

Database menggunakan PostgreSQL melalui Supabase dengan tabel-tabel utama:

### Tabel Utama:
- **profiles**: Data profil user yang terhubung dengan Supabase Auth
- **konsultasi_spbe**: Data form konsultasi SPBE
- **topik_konsultasi**: Master data topik konsultasi
- **unit_penanggungjawab**: Unit/divisi penanggungjawab
- **pic_list**: Person in Charge untuk setiap konsultasi
- **threads**: Thread percakapan chat
- **messages**: Pesan dalam chat
- **file_context_uploads**: File upload untuk konteks

### Relasi:
- Many-to-many relation antara konsultasi dan topik (`konsultasi_topik`)
- Many-to-many relation antara konsultasi dan unit penanggungjawab (`konsultasi_unit`)
- One-to-many relation untuk chat threads dan messages
- Foreign key relations untuk PIC dan user management

Detail lengkap schema dapat dilihat di file `sql/query.sql`.

## 📚 API Documentation

### Authentication Endpoints
Aplikasi menggunakan Supabase Auth:

```typescript
// Login
POST /api/auth/sign-in
// Register  
POST /api/auth/sign-up
// Logout
POST /api/auth/sign-out
```

### Konsultasi API
```typescript
// Buat konsultasi baru
POST /api/konsultasi
// Get semua konsultasi (Admin)
GET /api/konsultasi
// Update status konsultasi
PUT /api/konsultasi/[id]
// Get konsultasi by ticket
GET /api/konsultasi/ticket/[ticketNumber]
```

### Chat API
```typescript
// Buat thread baru
POST /api/chat/threads
// Get messages
GET /api/chat/threads/[id]/messages
// Kirim message
POST /api/chat/threads/[id]/messages
```

### Admin API
```typescript
// Get dashboard stats
GET /api/admin/stats
// Export data
GET /api/admin/export
// User management
GET /api/admin/users
PUT /api/admin/users/[id]
```

Dokumentasi lengkap API dapat dilihat di folder `docs/`.

## 🌐 Deployment

### Deploy ke Vercel (Recommended)

#### 1. Persiapan
1. Push code ke GitHub repository
2. Login ke [vercel.com](https://vercel.com)
3. Connect repository GitHub Anda

#### 2. Environment Variables
Tambahkan environment variables di Vercel:
```env
NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-production-anon-key
RAG_BASE_URL=your-rag-api-url
WHATSAPP_API_URL=your-whatsapp-api-url
```

#### 3. Deploy
1. Klik "Deploy" di Vercel
2. Tunggu proses build selesai
3. Update Site URL di Supabase Auth settings dengan domain production

### Deploy ke Platform Lain

#### Netlify
1. Connect repository di Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Tambahkan environment variables
5. Configure redirects untuk SPA routing

#### VPS/Server dengan PM2
```bash
# Install PM2 globally
npm install -g pm2

# Build aplikasi
npm run build

# Start dengan PM2
pm2 start npm --name "klink-pemdi" -- start

# Setup auto-restart
pm2 startup
pm2 save

# Setup reverse proxy dengan Nginx
sudo apt install nginx
```

## 👨‍💻 Development

### Struktur Folder
```
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── admin/          # Admin dashboard
│   ├── auth/           # Authentication pages
│   ├── chat/           # Chat interface
│   ├── konsultasi-form/ # Form konsultasi
│   └── protected/      # Protected routes
├── components/         # React components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── landing/        # Landing page components
│   └── chat/           # Chat-specific components
├── lib/                # Utility libraries
│   └── supabase/       # Supabase client config
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── sql/                # Database scripts
├── docs/               # Documentation
└── public/             # Static assets
```

### Coding Standards
- Gunakan TypeScript untuk type safety
- Follow ESLint configuration yang sudah ada
- Gunakan Prettier untuk code formatting
- Komponen menggunakan PascalCase
- File dan folder menggunakan kebab-case
- Gunakan barrel exports untuk cleaner imports

### Custom Hooks
Proyek ini menggunakan beberapa custom hooks:
- `useChat.ts`: Mengelola state chat dan websocket
- `useProfile.ts`: User profile management
- `useUsers.ts`: Admin user management
- `useSummaryData.ts`: Dashboard statistics
- `useContextFiles.ts`: File upload management

## 🔒 Security & Access Control

Aplikasi menggunakan Row Level Security (RLS) dari Supabase:

### Role-based Access:
- **Admin**: Full access ke semua data dan fitur
- **User**: Access ke konsultasi sendiri dan chat
- **Guest**: Limited access ke halaman publik

### API Security:
- Semua API routes memiliki authentication middleware
- Rate limiting untuk mencegah abuse
- Input validation menggunakan Zod schemas

Detail security policies dapat dilihat di `sql/rls-policies.sql`.

## 🧪 Testing

```bash
# Run tests (jika ada)
npm test

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

## 📱 Mobile Support

Aplikasi fully responsive dan mendukung:
- Progressive Web App (PWA) features
- Touch-friendly interface
- Offline capabilities untuk chat
- Push notifications (optional)

## 🤝 Kontribusi

1. Fork repository ini
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Commit perubahan Anda (`git commit -m 'Add some amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request

### Guidelines Kontribusi:
- Ikuti coding standards yang ada
- Tambahkan tests untuk fitur baru
- Update dokumentasi jika diperlukan
- Pastikan build berhasil sebelum submit PR

## 🐛 Troubleshooting

### Common Issues:

1. **Build Error**: Pastikan semua environment variables sudah diset
2. **Database Connection**: Periksa Supabase URL dan API key
3. **Auth Issues**: Pastikan redirect URLs sudah dikonfigurasi di Supabase
4. **CORS Error**: Periksa domain settings di Supabase dashboard

### Logs dan Debugging:
- Development: Check browser console dan terminal
- Production: Periksa Vercel function logs
- Database: Gunakan Supabase logs dashboard

## 📞 Support

Jika Anda mengalami masalah atau membutuhkan bantuan:

1. **Documentation**: Baca docs di folder `docs/`
2. **Issues**: Buka [GitHub Issues](https://github.com/username/klink_pemdi/issues)
3. **Discussions**: Gunakan GitHub Discussions untuk pertanyaan umum

## 📋 Roadmap

- [ ] Integration dengan WhatsApp Business API
- [ ] Advanced analytics dan reporting
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] AI-powered auto-categorization
- [ ] Real-time collaboration features

## 📄 License

Project ini menggunakan [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Kementerian Komunikasi dan Informatika RI** - Requirements dan domain expertise
- **Supabase Team** - Database dan authentication platform
- **Next.js Team** - React framework
- **Shadcn/ui** - UI component library
- **Vercel** - Hosting dan deployment platform
- **Open Source Community** - Various libraries dan tools

---

<div align="center">
  
**Dibuat dengan ❤️ untuk digitalisasi pemerintahan Indonesia**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/username/klink_pemdi)

</div>
