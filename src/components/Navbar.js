import { Link } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../assets/logo.png';
import { WalletIcon, XMarkIcon, InformationCircleIcon, Bars3Icon } from '@heroicons/react/24/outline'; // Menggunakan ikon dari Heroicons

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-blue-600 p-4 shadow-md fixed top-0 left-0 w-full z-10">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo and Brand Name */}
        <div className="flex items-center space-x-2">
          <img src={Logo} alt="BudgeIn Logo" className="w-8 h-8" />
          <h1 className="text-white text-2xl font-semibold">BudgeIn</h1>
        </div>

        {/* Hamburger Menu for Small Screens */}
        <div className="block lg:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white focus:outline-none"
          >
            {isMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>

        {/* Menu Links */}
        <div
          className={`${
            isMenuOpen ? 'block' : 'hidden'
          } absolute top-16 left-0 w-full bg-blue-600 lg:bg-transparent lg:relative lg:top-0 lg:w-auto lg:flex lg:items-center lg:space-x-6`}
        >
          <Link
            to="/budget"
            className="block lg:inline-block text-white text-lg font-medium hover:text-yellow-300 transition duration-200 transform hover:scale-105 px-4 py-2 lg:px-0"
          >
            <div className="flex items-center space-x-2">
              <WalletIcon className="w-5 h-5" />
              <span>Manage Budget</span>
            </div>
          </Link>

          <Link
            to="/logout"
            className="block lg:inline-block text-white text-lg font-medium hover:text-yellow-300 transition duration-200 transform hover:scale-105 px-4 py-2 lg:px-0"
          >
            <div className="flex items-center space-x-2">
              <XMarkIcon className="w-5 h-5" />
              <span>Logout</span>
            </div>
          </Link>

          <Link
            to="/about"
            className="block lg:inline-block text-white text-lg font-medium hover:text-yellow-300 transition duration-200 transform hover:scale-105 px-4 py-2 lg:px-0"
          >
            <div className="flex items-center space-x-2">
              <InformationCircleIcon className="w-5 h-5" />
              <span>About</span>
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
