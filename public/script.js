
const apiUrl = 'http://localhost:3000/api';

function loadData() {
    fetch(`${apiUrl}/data`)
    .then(response => response.json())
    .then(data => {
        const tabel = document.getElementById('dataTabel');
        tabel.innerHTML = '';
        data.forEach(item => {
        tabel.innerHTML += `
            <tr>
            <td>${item.nama}</td>
            <td>${item.penghasilan}</td>
            <td>${item.jumlah_tanggungan}</td>
            <td>${item.kondisi_rumah}</td>
            <td>${item.status_pekerjaan}</td>
            <td>${item.skor}</td> <!-- Tampilkan skor -->
            <td>${item.kelayakan}</td> <!-- Tampilkan kelayakan -->
            <td>
                <button class="btn btn-warning btn-sm" onclick="editData(${item.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteData(${item.id})">Hapus</button>
            </td>
            </tr>`;
        });
    });
}

function editData(id) {
    fetch(`${apiUrl}/data/${id}`)
    .then(response => response.json())
    .then(data => {
        document.getElementById('id').value = data.id;
        document.getElementById('nama').value = data.nama;
        document.getElementById('penghasilan').value = data.penghasilan;
        document.getElementById('tanggungan').value = data.jumlah_tanggungan;
        document.getElementById('kondisi').value = data.kondisi_rumah;
        document.getElementById('status').value = data.status_pekerjaan;
    });
}

function deleteData(id) {
    if (confirm('Yakin ingin menghapus data ini?')) {
    fetch(`${apiUrl}/data/${id}`, { method: 'DELETE' })
        .then(() => {
        alert('Data berhasil dihapus!');
        loadData();
        });
    }
}

function resetForm() {
    document.getElementById('fuzzyForm').reset();
    document.getElementById('id').value = '';
}

document.getElementById('fuzzyForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const id = document.getElementById('id').value;
    const nama = document.getElementById('nama').value;
    const penghasilan = parseFloat(document.getElementById('penghasilan').value);
    const tanggungan = parseInt(document.getElementById('tanggungan').value);
    const kondisi = document.getElementById('kondisi').value;
    const status = document.getElementById('status').value;

    const method = id ? 'PUT' : 'POST';
    const endpoint = id ? `${apiUrl}/data/${id}` : `${apiUrl}/data`;

    fetch(endpoint, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nama, penghasilan, tanggungan, kondisi, status }),
    })
    .then(() => {
        alert('Data berhasil disimpan!');
        resetForm();
        loadData();
    });
});

loadData();
