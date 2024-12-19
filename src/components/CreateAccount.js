// src/components/CreateAccount.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateAccount() {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (name) {
      localStorage.setItem('username', name); // Simpan nama ke localStorage
      navigate('/welcome'); // Redirect ke halaman Welcome
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Create Account</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full p-3 border border-gray-300 rounded-lg mb-4"
        />
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}

export default CreateAccount;
