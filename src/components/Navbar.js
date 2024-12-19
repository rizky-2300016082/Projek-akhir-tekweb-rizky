import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-blue-600 p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo/Brand Name */}
        <h1 className="text-white text-2xl font-semibold flex items-center space-x-2">
        <span className="text-xs text-gray-300">Your Budget Assistant</span>
          <span className="text-lg font-bold">BudgeIn</span> 
        </h1>

        {/* Navbar Links */}
        <div className="space-x-6 hidden md:flex">
          <Link
            to="/"
            className="text-white text-lg font-medium hover:text-yellow-300 transition duration-200"
          >
            Home
          </Link>
          <Link
            to="/welcome"
            className="text-white text-lg font-medium hover:text-yellow-300 transition duration-200"
          >
            Welcome
          </Link>
          <Link
            to="/budget"
            className="text-white text-lg font-medium hover:text-yellow-300 transition duration-200"
          >
            Create Budget
          </Link>
        </div>

        {/* Mobile Navbar Toggle Button */}
        <div className="md:hidden">
          <button className="text-white text-2xl">
            <i className="fas fa-bars"></i> {/* Optional: FontAwesome hamburger icon */}
          </button>
        </div>
      </div>

      {/* Dropdown for mobile */}
      <div className="md:hidden mt-4 flex flex-col space-y-2">
        <Link
          to="/"
          className="text-white text-lg font-medium hover:text-yellow-300 transition duration-200"
        >
          Home
        </Link>
        <Link
          to="/welcome"
          className="text-white text-lg font-medium hover:text-yellow-300 transition duration-200"
        >
          Welcome
        </Link>
        <Link
          to="/budget"
          className="text-white text-lg font-medium hover:text-yellow-300 transition duration-200"
        >
          Create budget
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
