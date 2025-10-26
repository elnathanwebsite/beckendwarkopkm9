// 1. Impor library
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';           // <-- MODIFIKASI: Ditambahkan untuk fix CORS
import 'dotenv/config';       // <-- MODIFIKASI: Ditambahkan untuk memuat file .env

// 2. Inisialisasi Express
const app = express();
app.use(cors());                 // <-- MODIFIKASI: Ini yang memperbaiki error 'Failed to fetch'
const port = process.env.PORT || 3000;

// ===================================================================
// AMAN: Kredensial diambil dari file .env (BUKAN hardcode)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
// ===================================================================

// Cek apakah kredensial ada
if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Pastikan SUPABASE_URL dan SUPABASE_SERVICE_KEY ada di file .env');
  process.exit(1); // Hentikan server jika .env tidak diatur
}

// 3. Buat koneksi (client) ke Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Koneksi ke Supabase dibuat (menggunakan .env).');



/**
 * Fungsi bantuan untuk membuat endpoint API dengan mudah
 * (Kode ini sudah bersih dari spasi yang salah)
 */
function createApiEndpoint(tableName) {
  app.get(`/api/${tableName}`, async (req, res) => {
    console.log(`Mencoba mengambil data dari tabel: ${tableName}...`);
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

// 5. Jalankan server
app.listen(port, () => {
  console.log(`Server backend berjalan di http://localhost:${port}`);
  console.log('Endpoint yang tersedia:');
  tableNames.forEach(tableName => {
    console.log(`  -> http://localhost:${port}/api/${tableName}`);
  });
});
