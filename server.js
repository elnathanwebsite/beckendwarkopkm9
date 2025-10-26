// 1. Impor library
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';
import 'dotenv/config';

// 2. Inisialisasi Express
const app = express();
app.use(cors()); // Mengizinkan request dari domain lain (penting!)
const port = process.env.PORT || 3000;

// ===================================================================
// AMAN: Kredensial diambil dari Environment Variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
// ===================================================================

// Cek apakah kredensial ada (hanya saat runtime)
if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Kredensial Supabase (SUPABASE_URL dan SUPABASE_SERVICE_KEY) tidak diatur di Environment Variables.');
  // Tidak perlu process.exit(1) agar Vercel bisa menangani error
}

// 3. Buat koneksi (client) ke Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Koneksi ke Supabase dibuat (menggunakan env).');

/**
 * Fungsi bantuan untuk membuat endpoint API dengan mudah
 */
function createApiEndpoint(tableName) {
  app.get(`/api/${tableName}`, async (req, res) => {
    console.log(`Mencoba mengambil data dari tabel: ${tableName}...`);

    // Tambahan: Cek lagi kredensial jika error sebelumnya
    if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ error: 'Konfigurasi server tidak lengkap, Kunci API hilang.' });
    }

    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*');

      if (error) {
        console.error(`Error Supabase [${tableName}]:`, error.message);
        return res.status(500).json({ error: error.message });
      }

      console.log(`Data dari [${tableName}] berhasil diambil!`);
      res.status(200).json(data);

    } catch (err) {
      console.error(`Error Server [${tableName}]:`, err.message);
      res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
  });
}

// 4. Buat semua endpoint API berdasarkan daftar tabel Anda
const tableNames = ['contacts', 'gallery', 'menu', 'orders', 'payments', 'settings'];
tableNames.forEach(tableName => {
  createApiEndpoint(tableName);
});

// 5. Jalankan server (Hanya untuk tes lokal, Vercel akan mengabaikan ini)
app.listen(port, () => {
  console.log(`Server lokal berjalan di http://localhost:${port}`);
});
