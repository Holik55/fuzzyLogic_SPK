const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Koneksi ke database MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'pengajuan',
});

db.connect((err) => {
  if (err) {
    console.error('Gagal terhubung ke database:', err.message);
    process.exit(1);
  }
  console.log('Terhubung ke database MySQL.');
});

// Fungsi untuk menilai kelayakan bantuan
const evaluateEligibility = (penghasilan, tanggungan, kondisi, status) => {
  // Aturan kelayakan (bisa diubah sesuai kebijakan)
  const penghasilanBatas = 3000000; // Misalnya, penghasilan di bawah 3 juta
  const tanggunganBatas = 3; // Jika lebih dari 3 tanggungan
  const kondisiRumahBuruk = 'buruk'; // Kategori kondisi rumah
  const statusTidakBekerja = 'tidak bekerja'; // Status pekerjaan

  if (penghasilan <= penghasilanBatas && tanggungan > tanggunganBatas && kondisi === kondisiRumahBuruk && status === statusTidakBekerja) {
    return 'Layak menerima bantuan';
  }
  return 'Tidak layak menerima bantuan';
};

// Endpoint untuk menambah data baru
app.post('/api/data', (req, res) => {
  const { nama, penghasilan, tanggungan, kondisi, status } = req.body;
  if (!nama || !penghasilan || !tanggungan || !kondisi || !status) {
    return res.status(400).json({ error: 'Semua data harus diisi.' });
  }

  // Evaluasi kelayakan bantuan
  const kelayakan = evaluateEligibility(penghasilan, tanggungan, kondisi, status);

  const query = `INSERT INTO data_pengajuan (nama, penghasilan, jumlah_tanggungan, kondisi_rumah, status_pekerjaan, kelayakan) VALUES (?, ?, ?, ?, ?, ?)`;
  db.query(query, [nama, penghasilan, tanggungan, kondisi, status, kelayakan], (err, results) => {
    if (err) {
      console.error('Error saat menyimpan data:', err.message);
      return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
    res.json({ message: 'Data berhasil disimpan', id: results.insertId, kelayakan });
  });
});

// Endpoint untuk membaca semua data
app.get('/api/data', (req, res) => {
  const query = 'SELECT * FROM data_pengajuan';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error saat mengambil data:', err.message);
      return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
    res.json(results);
  });
});

// Endpoint untuk membaca data berdasarkan ID
app.get('/api/data/:id', (req, res) => {
  const query = 'SELECT * FROM data_pengajuan WHERE id = ?';
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      console.error('Error saat mengambil data:', err.message);
      return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Data tidak ditemukan' });
    }
    res.json(results[0]);
  });
});

// Endpoint untuk memperbarui data
app.put('/api/data/:id', (req, res) => {
  const { nama, penghasilan, tanggungan, kondisi, status } = req.body;
  if (!nama || !penghasilan || !tanggungan || !kondisi || !status) {
    return res.status(400).json({ error: 'Semua data harus diisi.' });
  }

  // Evaluasi kelayakan bantuan
  const kelayakan = evaluateEligibility(penghasilan, tanggungan, kondisi, status);

  const query = `UPDATE data_pengajuan SET nama = ?, penghasilan = ?, jumlah_tanggungan = ?, kondisi_rumah = ?, status_pekerjaan = ?, kelayakan = ? WHERE id = ?`;
  db.query(query, [nama, penghasilan, tanggungan, kondisi, status, kelayakan, req.params.id], (err) => {
    if (err) {
      console.error('Error saat memperbarui data:', err.message);
      return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
    res.json({ message: 'Data berhasil diperbarui' });
  });
});

// Endpoint untuk menghapus data
app.delete('/api/data/:id', (req, res) => {
  const query = 'DELETE FROM data_pengajuan WHERE id = ?';
  db.query(query, [req.params.id], (err) => {
    if (err) {
      console.error('Error saat menghapus data:', err.message);
      return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
    res.json({ message: 'Data berhasil dihapus' });
  });
});

// Menjalankan server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
