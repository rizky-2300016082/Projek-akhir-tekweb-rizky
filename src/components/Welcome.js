import { useState, useEffect } from 'react'; // Mengimpor hook useState dan useEffect dari React
import { useNavigate } from 'react-router-dom'; // Mengimpor hook useNavigate dari React Router untuk navigasi

function Welcome() {
  const [userData, setUserData] = useState({
    username: '', // Menyimpan data username pengguna
    fullName: '', // Menyimpan data nama lengkap pengguna
    location: ''  // Menyimpan data lokasi pengguna
  });
  const navigate = useNavigate(); // Hook untuk navigasi ke halaman lain

  useEffect(() => {
    // Mengambil data pengguna yang disimpan di localStorage
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser || !storedUser.email) {
      // Jika tidak ada data pengguna atau email pengguna tidak ada, arahkan ke halaman CreateAccount
      navigate('/create-account');
    } else if (storedUser.username) {
      // Jika sudah ada username, langsung alihkan ke halaman Budget
      navigate('/budget');
    }
  }, [navigate]); // Hook useEffect akan dijalankan ketika navigate berubah

  const handleInputChange = (e) => {
    // Mengubah data pengguna sesuai input yang dimasukkan pengguna
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    if (!userData.username.trim()) {
      // Jika username kosong, tampilkan peringatan
      alert('Please provide a username.');
      return;
    }
    // Mengambil data pengguna yang ada dari localStorage
    const storedUser = JSON.parse(localStorage.getItem('user'));
    // Menggabungkan data pengguna yang baru dengan data yang sudah ada
    const updatedUser = { ...storedUser, ...userData };
    // Menyimpan data pengguna yang sudah diperbarui ke localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
    // Setelah data disimpan, arahkan ke halaman Budget
    navigate('/budget');
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-semibold mb-6">Set Your Account Details</h2>
        {/* Input untuk memasukkan username */}
        <input
          type="text"
          name="username"
          value={userData.username}
          onChange={handleInputChange}
          placeholder="Enter your username"
          className="w-full p-3 border border-gray-300 rounded-lg mb-4"
        />
        {/* Input untuk memasukkan nama lengkap */}
        <input
          type="text"
          name="fullName"
          value={userData.fullName}
          onChange={handleInputChange}
          placeholder="Enter your full name"
          className="w-full p-3 border border-gray-300 rounded-lg mb-4"
        />
        {/* Input untuk memasukkan lokasi */}
        <input
          type="text"
          name="location"
          value={userData.location}
          onChange={handleInputChange}
          placeholder="Enter your location"
          className="w-full p-3 border border-gray-300 rounded-lg mb-4"
        />
        {/* Tombol untuk menyimpan data pengguna */}
        <button
          onClick={handleSaveProfile}
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
        >
          Save Profile
        </button>
      </div>
    </div>
  );
}

export default Welcome;
