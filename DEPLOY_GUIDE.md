# Panduan Deploy ITS AI ke cPanel

## 📋 Persiapan

### 1. Yang Dibutuhkan
- cPanel dengan Node.js support
- Domain atau subdomain
- Akses SSH (opsional, tapi disarankan)

### 2. Informasi Server Anda
- IP: 103.163.138.80
- Hostname: polite.jagoanhosting.id

---

## 🚀 Langkah 1: Setup Node.js di cPanel

1. Login ke cPanel: `https://polite.jagoanhosting.id:2083` atau `https://103.163.138.80:2083`

2. Cari **"Software"** → **"Setup Node.js App"**

3. Klik **"Create Application"**

4. Isi form:
   - **Node.js version**: Pilih versi 18.x atau 20.x
   - **Application mode**: Production
   - **Application root**: `its-ai`
   - **Application URL**: Pilih domain/subdomain (misal: `itsai.yourdomain.com`)
   - **Application startup file**: `server.js` (akan kita buat)
   - **Environment variables**: (kosongkan dulu)

5. Klik **"Create"**

6. **CATAT** informasi yang muncul:
   - Application path (misal: `/home/username/its-ai`)
   - Port yang diberikan

---

## 🚀 Langkah 2: Upload File ke Server

### Opsi A: Via File Manager cPanel

1. Buka **File Manager** di cPanel
2. Navigate ke folder aplikasi (misal: `/home/username/its-ai`)
3. Upload semua file project atau extract dari ZIP

### Opsi B: Via Git (Direkomendasikan)

1. Buka **Terminal** di cPanel atau SSH

2. Masuk ke folder aplikasi:
```bash
cd /home/username/its-ai
```

3. Clone repository:
```bash
git clone https://github.com/UjangSupriatna/its-ai.git .
```

---

## 🚀 Langkah 3: Install Dependencies

Via Terminal/SSH:

```bash
cd /home/username/its-ai
npm install
```

---

## 🚀 Langkah 4: Build Aplikasi

```bash
cd /home/username/its-ai
npm run build
```

Tunggu sampai selesai (2-5 menit).

---

## 🚀 Langkah 5: Buat File server.js

Buat file `server.js` di root folder:

```javascript
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
```

---

## 🚀 Langkah 6: Set Environment Variables

### Di cPanel Node.js App:

1. Klik nama aplikasi Anda di daftar
2. Scroll ke **"Environment variables"**
3. Tambahkan:

```
NEXT_PUBLIC_GOOGLE_CLIENT_ID = your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = your-client-secret
NEXTAUTH_URL = https://itsai.yourdomain.com
NODE_ENV = production
```

4. Klik **"Save"**

### Atau buat file `.env.production`:

```bash
cd /home/username/its-ai
nano .env.production
```

Isi dengan:
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
NEXTAUTH_URL=https://itsai.yourdomain.com
NODE_ENV=production
```

---

## 🚀 Langkah 7: Update Google OAuth

1. Buka [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

2. Edit OAuth 2.0 Client

3. Tambahkan ke **Authorized JavaScript origins**:
   - `https://itsai.yourdomain.com`

4. Tambahkan ke **Authorized redirect URIs**:
   - `https://itsai.yourdomain.com/auth/callback`

5. Save

---

## 🚀 Langkah 8: Setup SSL (HTTPS)

1. Di cPanel, cari **"SSL/TLS"** atau **"Let's Encrypt"**

2. Pilih domain `itsai.yourdomain.com`

3. Klik **"Issue"** untuk SSL gratis dari Let's Encrypt

---

## 🚀 Langkah 9: Restart Aplikasi

### Via cPanel Node.js App:
1. Klik **"Restart"** pada aplikasi

### Via Terminal:
```bash
cd /home/username/its-ai
pkill -f "node.*next"
npm start &
```

---

## 🔧 Troubleshooting

### Error: "Cannot find module"
```bash
npm install
```

### Error: "Port already in use"
```bash
# Cek proses yang pakai port
lsof -i :3000
# Kill proses
kill -9 <PID>
```

### Error: "Permission denied"
```bash
chmod -R 755 /home/username/its-ai
```

### Aplikasi tidak jalan
Cek log:
```bash
cd /home/username/its-ai
cat logs/app.log
# atau
pm2 logs its-ai
```

---

## 📱 Akses Aplikasi

Buka browser: `https://itsai.yourdomain.com`

---

## 🔄 Update Aplikasi

```bash
cd /home/username/its-ai
git pull origin main
npm install
npm run build
# Restart via cPanel atau:
pm2 restart its-ai
```

---

## 🆘 Butuh Bantuan?

Jika ada masalah, berikan saya:
1. Screenshot error dari cPanel
2. Log aplikasi
3. Output dari `node -v` dan `npm -v`

Saya akan bantu troubleshoot!
