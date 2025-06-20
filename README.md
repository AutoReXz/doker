# Notes App - Docker Containerized Application

Aplikasi Notes yang telah dikontainerisasi menggunakan Docker dengan arsitektur frontend-backend terpisah. Aplikasi ini memungkinkan pengguna untuk membuat, membaca, mengupdate, dan menghapus catatan (CRUD operations) dengan antarmuka web yang modern.

## 🏗️ Arsitektur Aplikasi

```
Browser → Frontend Container (Express + Proxy) → Backend Container → MySQL Database (GCP)
    ↓              ↓                                     ↓
Port 3000    Port 3000 (Internal)              Port 3001 (External)
             Port 3000 (Container)             Port 3000 (Container)
```

### Komponen Utama:
- **Frontend**: Aplikasi web dengan Express.js sebagai server dan proxy
- **Backend**: REST API dengan Express.js dan Sequelize ORM  
- **Database**: MySQL database yang di-host di Google Cloud Platform
- **Docker Network**: Custom network untuk komunikasi antar container

## 📋 Prasyarat

Pastikan Anda telah menginstall:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) 
- [Git](https://git-scm.com/)
- Browser web modern (Chrome, Firefox, Edge, dll.)

## 🚀 Instalasi dan Menjalankan Aplikasi

### 1. Clone Repository
```powershell
git clone <repository-url>
cd "Final-All\docker"
```

### 2. Konfigurasi Environment Variables (Backend)
Buat file `.env` di folder `be/` dengan konfigurasi database:
```env
DB_HOST=your-mysql-host
DB_USER=your-mysql-username  
DB_PASSWORD=your-mysql-password
DB_NAME=notes_app
DB_PORT=3306
```

### 3. Build Docker Images

#### Build Backend Image
```powershell
cd be
docker build -t notes-backend .
cd ..
```

#### Build Frontend Image  
```powershell
cd fe
docker build -t notes-frontend .
cd ..
```

### 4. Buat Docker Network
```powershell
docker network create notes-network
```

### 5. Jalankan Containers

#### Jalankan Backend Container
```powershell  
docker run -d --name notes-backend-container --network notes-network -p 3001:3000 notes-backend
```

#### Jalankan Frontend Container
```powershell
docker run -d --name notes-frontend-container --network notes-network -p 3000:3000 notes-frontend  
```

### 6. Verifikasi Status Container
```powershell
docker ps
```

Output yang diharapkan:
```
CONTAINER ID   IMAGE            COMMAND                  CREATED         STATUS         PORTS                    NAMES
xxxxxxxxxx     notes-frontend   "docker-entrypoint.s…"   X minutes ago   Up X minutes   0.0.0.0:3000->3000/tcp   notes-frontend-container
xxxxxxxxxx     notes-backend    "docker-entrypoint.s…"   X minutes ago   Up X minutes   0.0.0.0:3001->3000/tcp   notes-backend-container
```

## 🌐 Mengakses Aplikasi

### Frontend (User Interface)
- **URL**: http://localhost:3000
- **Deskripsi**: Antarmuka web utama untuk mengelola catatan

### Backend API (Development)
- **URL**: http://localhost:3001/api  
- **Endpoints**:
  - `GET /api/notes` - Mendapatkan semua catatan
  - `POST /api/notes` - Membuat catatan baru
  - `GET /api/notes/:id` - Mendapatkan catatan berdasarkan ID
  - `PUT /api/notes/:id` - Mengupdate catatan
  - `DELETE /api/notes/:id` - Menghapus catatan

## 🧪 Testing API

### Test dengan PowerShell (curl)
```powershell
# Test backend langsung
curl http://localhost:3001/api/notes

# Test melalui frontend proxy  
curl http://localhost:3000/api/notes
```

### Test dengan Browser
1. Buka http://localhost:3000
2. Aplikasi akan otomatis memuat dan menampilkan catatan
3. Gunakan fitur Create, Read, Update, Delete pada interface

## 🔧 Konfigurasi Teknis

### Frontend Configuration
- **Port**: 3000
- **Framework**: Express.js + Static Files
- **Proxy**: HTTP Proxy Middleware untuk API requests
- **Target Proxy**: `http://notes-backend-container:3000` (internal Docker network)

### Backend Configuration  
- **Port**: 3000 (container), 3001 (host)
- **Framework**: Express.js  
- **ORM**: Sequelize
- **Database**: MySQL (Google Cloud Platform)
- **CORS**: Enabled untuk semua origins

### Docker Network
- **Network Name**: `notes-network`
- **Type**: Bridge network
- **Purpose**: Memungkinkan komunikasi antar container

## 📁 Struktur Proyek

```
docker/
├── README.md
├── be/                          # Backend Application
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js               # Main server file
│   ├── config/
│   │   └── database.js         # Database configuration
│   ├── controllers/
│   │   └── noteController.js   # API controllers
│   ├── models/
│   │   ├── index.js           # Sequelize models
│   │   └── note.js            # Note model
│   ├── routes/
│   │   └── noteRoutes.js      # API routes
│   └── utils/                 # Utility functions
└── fe/                         # Frontend Application  
    ├── Dockerfile
    ├── package.json
    ├── server.js              # Express server + proxy
    ├── index.html             # Main HTML file
    ├── utils.js               # Frontend utilities
    └── vm-script.js           # Client-side JavaScript
```

## 🛠️ Commands Berguna

### Container Management
```powershell
# Melihat status container
docker ps

# Melihat logs container
docker logs notes-frontend-container
docker logs notes-backend-container

# Stop containers
docker stop notes-frontend-container notes-backend-container

# Remove containers
docker rm notes-frontend-container notes-backend-container

# Remove images
docker rmi notes-frontend notes-backend

# Remove network
docker network rm notes-network
```

### Development Commands
```powershell
# Rebuild dan restart frontend
cd fe
docker build -t notes-frontend .
docker stop notes-frontend-container
docker rm notes-frontend-container  
docker run -d --name notes-frontend-container --network notes-network -p 3000:3000 notes-frontend

# Rebuild dan restart backend
cd be
docker build -t notes-backend .
docker stop notes-backend-container
docker rm notes-backend-container
docker run -d --name notes-backend-container --network notes-network -p 3001:3000 notes-backend
```

## 🐛 Troubleshooting

### Problem: Container tidak bisa berkomunikasi
**Solusi**: Pastikan kedua container berada di network yang sama
```powershell
docker network create notes-network
# Jalankan ulang container dengan --network notes-network
```

### Problem: Frontend tidak bisa mengakses backend API
**Solusi**: Periksa konfigurasi proxy di `fe/server.js` dan pastikan target mengarah ke nama container yang benar

### Problem: Database connection error
**Solusi**: 
1. Periksa file `.env` di folder `be/`
2. Pastikan database MySQL dapat diakses dari container
3. Periksa credentials database

### Problem: Port sudah digunakan
**Solusi**: 
```powershell
# Hentikan proses yang menggunakan port
netstat -ano | findstr :3000
netstat -ano | findstr :3001
# Kill process dengan PID yang ditemukan
taskkill /PID <PID> /F
```

### Melihat Logs untuk Debug
```powershell
# Frontend logs
docker logs -f notes-frontend-container

# Backend logs  
docker logs -f notes-backend-container
```

## 📊 Monitoring

### Health Check URLs
- Frontend Health: http://localhost:3000
- Backend Health: http://localhost:3001/api/notes
- Proxy Health: http://localhost:3000/api/notes

### Performance Metrics
- Container resource usage: `docker stats`
- Network traffic: `docker network inspect notes-network`

## 👥 Kontribusi

1. Fork repository ini
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📝 Catatan Pengembangan

- Aplikasi menggunakan arsitektur microservices dengan frontend dan backend terpisah
- Komunikasi antar container melalui Docker network internal
- Frontend menggunakan proxy untuk meneruskan API requests ke backend
- Database MySQL di-host secara eksternal di Google Cloud Platform
- Semua container dikonfigurasi untuk production environment

## 🔐 Keamanan

- CORS dikonfigurasi untuk development (allow all origins)
- Untuk production, perlu konfigurasi CORS yang lebih ketat
- Pastikan credentials database tidak ter-commit ke repository
- Gunakan Docker secrets untuk informasi sensitif di production

## 📞 Support

Jika Anda mengalami masalah:
1. Periksa logs container terlebih dahulu
2. Pastikan semua prerequisites telah terinstall
3. Verifikasi konfigurasi network dan port
4. Cek connectivity ke database eksternal

---

**Versi**: 1.0.0  
**Terakhir Diupdate**: 14 Juni 2025  
**Teknologi**: Docker, Node.js, Express.js, MySQL, Sequelize
