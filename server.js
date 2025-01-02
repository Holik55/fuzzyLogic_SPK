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
const calculateEligibility = (penghasilan, tanggungan, kondisi, status) => {
    // Fuzzifikasi
    const fuzzifikasi = {
      penghasilan: penghasilan < 2000000 ? 0.75 : 0.25,
      tanggungan: tanggungan >= 5 ? 1.0 : (tanggungan >= 3 ? 0.6 : 0.3),
      kondisi: kondisi === "sewa" ? 1.0 : (kondisi === "milik sendiri" ? 0.5 : 0.3),
      status: status === "tidak bekerja" ? 1.0 : 0.5,
    };

    // Bobot AHP
    const bobot = {
      penghasilan: 0.419,
      tanggungan: 0.263,
      kondisi: 0.160,
      status: 0.158,
    };

    // Hitung skor
    const skor =
      (bobot.penghasilan * fuzzifikasi.penghasilan) +
      (bobot.tanggungan * fuzzifikasi.tanggungan) +
      (bobot.kondisi * fuzzifikasi.kondisi) +
      (bobot.status * fuzzifikasi.status);

    // Kategori kelayakan
    let kelayakan;
    if (skor > 0.75) {
      kelayakan = "Sangat Layak";
    } else if (skor >= 0.5) {
      kelayakan = "Layak";
    } else {
      kelayakan = "Tidak Layak";
    }

    return { skor: skor.toFixed(5), kelayakan };
  };

// Endpoint untuk menambah data baru
app.post('/api/data', (req, res) => {
    const { nama, penghasilan, tanggungan, kondisi, status } = req.body;
    if (!nama || !penghasilan || !tanggungan || !kondisi || !status) {
      return res.status(400).json({ error: 'Semua data harus diisi.' });
    }

    // Evaluasi kelayakan menggunakan metode fuzzy
    const { skor, kelayakan } = calculateEligibility(penghasilan, tanggungan, kondisi, status);

    const query = `INSERT INTO data_pengajuan (nama, penghasilan, jumlah_tanggungan, kondisi_rumah, status_pekerjaan, skor, kelayakan) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(query, [nama, penghasilan, tanggungan, kondisi, status, skor, kelayakan], (err, results) => {
      if (err) {
        console.error('Error saat menyimpan data:', err.message);
        return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
      }
      res.json({ message: 'Data berhasil disimpan', id: results.insertId, skor, kelayakan });
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

    // Evaluasi kelayakan menggunakan metode fuzzy
    const { skor, kelayakan } = calculateEligibility(penghasilan, tanggungan, kondisi, status);

    const query = `UPDATE data_pengajuan SET nama = ?, penghasilan = ?, jumlah_tanggungan = ?, kondisi_rumah = ?, status_pekerjaan = ?, skor = ?, kelayakan = ? WHERE id = ?`;
    db.query(query, [nama, penghasilan, tanggungan, kondisi, status, skor, kelayakan, req.params.id], (err) => {
      if (err) {
        console.error('Error saat memperbarui data:', err.message);
        return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
      }
      res.json({ message: 'Data berhasil diperbarui', skor, kelayakan });
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
