// src/components/Welcome.js
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Welcome() {
  const [username, setUsername] = useState('');

  useEffect(() => {
    const name = localStorage.getItem('username');
    if (name) {
      setUsername(name);
    } else {
      window.location.href = "/"; // Redirect ke halaman CreateAccount jika belum ada nama
    }
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-semibold mb-6">Welcome, {username}!</h2>
        <p className="mb-4">You can now create a budget to manage your finances.</p>
        <Link
          to="/budget"
          className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
        >
          Create Budget
        </Link>
      </div>
    </div>
  );
}

export default Welcome;
