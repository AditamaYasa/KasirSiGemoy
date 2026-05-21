# Setup & Build Electron (.exe) untuk POS System

## Prerequisites
- Node.js v16+ (download dari https://nodejs.org)
- pnpm (sudah terinstall di project ini)

## Cara Menjalankan di Development

```bash
pnpm electron-dev
```

Ini akan membuka aplikasi dalam Electron window dengan Next.js dev server.

## Cara Build menjadi .exe

### Build untuk Production (NSIS Installer + Portable)

```bash
pnpm electron-build
```

File `.exe` akan ada di folder `dist/` :
- `POS System Setup x.x.x.exe` - Installer (recommended)
- `POS System-x.x.x-portable.exe` - Portable version (run langsung)

### Hanya Build Portable .exe (lebih cepat)

```bash
electron-builder --win portable
```

---

## Struktur Folder Electron

```
electron/
  ├── main.js      # Entry point Electron
  └── preload.js   # Security bridge antara main & renderer
```

## Fitur yang Sudah Tersedia

✅ Development mode dengan hot reload
✅ NSIS Installer untuk instalasi di Windows
✅ Portable .exe tanpa installer
✅ Desktop shortcuts (Start Menu + Desktop)
✅ Print functionality dari aplikasi
✅ Menu bar (File, Edit, View)
✅ Dev tools toggle (Ctrl+Shift+I)

---

## Debugging

Saat development, tekan:
- `Ctrl+R` - Reload aplikasi
- `Ctrl+Shift+I` - Buka Developer Tools
- `Ctrl+Q` - Tutup aplikasi

---

## Tips untuk Build

1. **Pastikan next build sukses dulu:**
   ```bash
   pnpm build
   ```

2. **Jika error saat building .exe, cek:**
   - Node modules sudah lengkap: `pnpm install`
   - Windows Build Tools terinstall (untuk Windows)
   - Disk space cukup untuk build

3. **Untuk distribusi ke client:**
   - Gunakan file `POS System Setup x.x.x.exe` dari folder `dist/`
   - Client bisa langsung double-click dan install

---

## Kustomisasi

### Ubah nama aplikasi:
Di `package.json` → `"productName"` dan `build.nsis.shortcutName`

### Ubah icon .exe:
Letakkan file icon di `assets/icon.ico` (256x256 pixel)

### Build untuk platform lain:
```bash
electron-builder --mac    # macOS
electron-builder --linux  # Linux
```

---

## Troubleshooting

**"electron is not recognized"**
→ Cek instalasi: `pnpm list electron`

**"next build failed"**
→ Jalankan `pnpm build` terpisah untuk debug

**"Port 3000 already in use"**
→ Kill process: `lsof -i :3000` atau tutup app lain yang pakai port

---

## Production Release

Untuk release ke production:

1. Update version di `package.json`
2. Jalankan `pnpm electron-build`
3. Test file `.exe` di `dist/`
4. Distribute file `.exe` ke clients
5. Buat update mechanism (opsional - gunakan electron-updater)
