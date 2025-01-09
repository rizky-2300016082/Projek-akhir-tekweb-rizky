import React from 'react';

function About() {
  return (
    <div className="max-w-7xl mx-auto p-20">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Tentang BudgeIn</h1>
      
      <p className="text-lg mb-4">
        <strong>BudgeIn</strong> adalah aplikasi pengelolaan anggaran pribadi berbasis web yang dirancang untuk membantu pengguna mengelola keuangan mereka dengan cara yang sederhana dan efisien. Dengan menggunakan BudgeIn, Anda dapat dengan mudah membuat dan memantau anggaran pribadi, serta mengelola pengeluaran secara real-time. Aplikasi ini membimbing Anda mulai dari pembuatan akun hingga pencatatan pengeluaran, dan dilengkapi dengan fitur visualisasi perbandingan antara pengeluaran dan dana awal yang tersedia.
      </p>
      
      <p className="text-lg mb-4">
        BudgeIn dibangun menggunakan <strong>React.js</strong> dengan dukungan styling dari <strong>Tailwind CSS</strong>, serta menggunakan file .json sebagai database untuk menyimpan data pengguna dan anggaran.
      </p>

      <h2 className="text-2xl font-semibold text-blue-600 mb-3">Fitur Utama</h2>
      
      <ol className="list-decimal list-inside text-lg mb-4">
        <li><strong>Create Account</strong> - Pengguna memulai dengan membuat akun dengan nama yang akan digunakan di seluruh aplikasi. Halaman ini dirancang sederhana dan ramah pengguna.</li>
        <li><strong>Welcome Page</strong> - Setelah membuat akun, pengguna diarahkan ke halaman sambutan yang menampilkan nama mereka serta petunjuk untuk memulai dengan membuat anggaran baru.</li>
        <li><strong>Create Budget</strong> - Pengguna dapat membuat anggaran dengan mengisi nama anggaran dan jumlah dana awal (amount). Data ini akan disimpan dan digunakan untuk analisis lebih lanjut.</li>
        <li><strong>Budget Page</strong>
          <ul className="list-inside list-circle">
            <li>Menampilkan daftar anggaran yang telah dibuat pengguna.</li>
            <li>Pengguna dapat menambahkan pengeluaran ke anggaran, lengkap dengan nama dan jumlah pengeluaran.</li>
            <li>Sistem menghitung total pengeluaran dan menampilkan sisa dana secara real-time.</li>
            <li>Menampilkan history pengeluaran dan memungkinkan pengguna untuk menghapus pengeluaran atau anggaran yang telah dibuat.</li>
            <li>Fitur untuk mengedit nama anggaran.</li>
          </ul>
        </li>
        <li><strong>Perbandingan Pengeluaran dan Anggaran</strong> - Visualisasi sederhana yang menunjukkan total pengeluaran dibandingkan dengan anggaran awal, memudahkan pengguna untuk memahami kondisi keuangan mereka.</li>
      </ol>

      <p className="text-lg mb-4">
        Dengan BudgeIn, Anda dapat lebih mudah mengatur dan memantau keuangan pribadi secara efektif dan efisien.
      </p>
    </div>
  );
}

export default About;
