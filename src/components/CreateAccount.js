import { useState } from 'react'; // Mengimpor hook useState dari React untuk mengelola state
import { useNavigate } from 'react-router-dom'; // Mengimpor hook useNavigate untuk melakukan navigasi antar halaman

function CreateAccount() {
  // State untuk menyimpan email yang dimasukkan oleh pengguna
  const [email, setEmail] = useState('');
  // State untuk menyimpan password yang dimasukkan oleh pengguna
  const [password, setPassword] = useState('');
  // State untuk mengontrol apakah form yang ditampilkan adalah form registrasi atau login
  const [isRegistering, setIsRegistering] = useState(false);
  // Hook useNavigate untuk melakukan navigasi ke halaman lain
  const navigate = useNavigate();

  // Fungsi untuk menangani proses login
  const handleLogin = async () => {
    try {
      // Melakukan request POST ke server untuk melakukan login
      const response = await fetch('http://localhost:3001/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }), // Mengirimkan email dan password
      });

      // Mengecek apakah responsenya OK (status 200)
      if (response.ok) {
        const data = await response.json(); // Mendapatkan data dari response JSON
        // Menyimpan token dan data pengguna ke dalam localStorage
        localStorage.setItem('token', data.token); // Menyimpan token
        localStorage.setItem('user', JSON.stringify(data.user)); // Menyimpan data user

        // Melakukan navigasi ke halaman Welcome setelah berhasil login
        navigate('/welcome');
      } else {
        // Menampilkan alert jika login gagal
        alert('Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error(err); // Menangani error dan menampilkan di console
      alert('An error occurred during login.'); // Menampilkan alert jika terjadi error saat login
    }
  };

  // Fungsi untuk menangani proses registrasi
  const handleRegister = async () => {
    try {
      // Melakukan request POST ke server untuk melakukan registrasi
      const response = await fetch('http://localhost:3001/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }), // Mengirimkan email dan password
      });

      // Mengecek apakah responsenya OK (status 200)
      if (response.ok) {
        alert('Registration successful! You can now log in.'); // Menampilkan alert jika registrasi berhasil
        setIsRegistering(false); // Mengubah state isRegistering menjadi false untuk menampilkan form login
      } else {
        // Menampilkan alert jika registrasi gagal
        alert('Registration failed. Please try again.');
      }
    } catch (err) {
      console.error(err); // Menangani error dan menampilkan di console
      alert('An error occurred during registration.'); // Menampilkan alert jika terjadi error saat registrasi
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {/* Kontainer utama dengan flexbox untuk memusatkan form */}
      <div className="bg-white p-6 rounded-lg shadow-md w-80">
        {/* Menampilkan judul berdasarkan apakah sedang registrasi atau login */}
        <h2 className="text-xl font-bold mb-4">{isRegistering ? 'Register' : 'Login'}</h2>
        {/* Input untuk email */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)} // Memperbarui state email saat input berubah
          className="border border-gray-300 rounded-md w-full p-2 mb-4"
          placeholder="Email"
        />
        {/* Input untuk password */}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} // Memperbarui state password saat input berubah
          className="border border-gray-300 rounded-md w-full p-2 mb-4"
          placeholder="Password"
        />
        {/* Tombol untuk login atau registrasi, tergantung state isRegistering */}
        <button
          onClick={isRegistering ? handleRegister : handleLogin} // Memilih fungsi berdasarkan isRegistering
          className="bg-blue-500 text-white w-full py-2 rounded-md hover:bg-blue-600"
        >
          {isRegistering ? 'Register' : 'Login'} {/* Teks tombol bergantung pada isRegistering */}
        </button>
        <div className="mt-4 text-center">
          {/* Tombol untuk beralih antara form login dan registrasi */}
          <button
            onClick={() => setIsRegistering(!isRegistering)} // Mengubah state isRegistering
            className="text-blue-500 hover:underline"
          >
            {isRegistering ? 'Already have an account? Login' : 'Don\'t have an account? Register'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateAccount;
