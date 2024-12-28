// src/components/Welcome.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Welcome() {
  const [nameInput, setNameInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser || !storedUser.email) {
      navigate('/'); // Redirect ke halaman CreateAccount jika data user tidak ada
    }
  }, [navigate]);

  const handleNameSubmit = () => {
    if (!nameInput.trim()) return; // Pastikan input tidak kosong
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const updatedUser = { ...storedUser, username: nameInput };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    navigate('/budget'); // Redirect ke halaman Budget setelah nama disimpan
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-semibold mb-6">Set Your Account Name</h2>
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Enter a new account name"
          className="w-full p-3 border border-gray-300 rounded-lg mb-4"
        />
        <button
          onClick={handleNameSubmit}
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
        >
          Save Name
        </button>
      </div>
    </div>
  );
}

export default Welcome;
