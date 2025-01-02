document.getElementById("inputForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Mencegah reload halaman

    // Ambil data dari form
    const namaLengkap = document.getElementById("name").value;
    const penghasilanBulanan = document.getElementById("income").value;
    const tanggunganKeluarga = document.getElementById("dependents").value;
    const kondisiRumah = document.getElementById("houseCondition").value;
    const statusPekerjaan = document.getElementById("jobStatus").value;

    // Validasi jika nama belum diisi
    if (!namaLengkap) {
      alert("Nama lengkap harus diisi!");
      return;
    }

    // Logika sederhana untuk menentukan hasil pengajuan
    let hasil;
    if (
      parseInt(penghasilanBulanan) < 3000000 &&
      parseInt(tanggunganKeluarga) > 3 &&
      kondisiRumah === "buruk"
    ) {
      hasil = "Pengajuan disetujui dengan prioritas tinggi";
    } else if (parseInt(penghasilanBulanan) >= 3000000) {
      hasil = "Pengajuan ditolak karena penghasilan terlalu tinggi";
    } else {
      hasil = "Pengajuan diterima";
    }

    // Tampilkan hasil di bawah form
    const resultContainer = document.getElementById("resultContainer");
    resultContainer.innerHTML = `
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">Hasil Pengajuan</h5>
          <p class="card-text">
            <strong>Nama:</strong> ${namaLengkap}<br>
            <strong>Penghasilan Bulanan:</strong> Rp ${penghasilanBulanan}<br>
            <strong>Jumlah Tanggungan:</strong> ${tanggunganKeluarga}<br>
            <strong>Kondisi Rumah:</strong> ${kondisiRumah}<br>
            <strong>Status Pekerjaan:</strong> ${statusPekerjaan}<br>
            <strong>Hasil:</strong> ${hasil}
          </p>
        </div>
      </div>`;
  });
