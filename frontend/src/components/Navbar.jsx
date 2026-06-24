import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <h2>KIZASHI</h2>

      <div className="nav-links">
        <Link to="/">Dashboard</Link>

        <Link to="/daily-log">
          Daily Log
        </Link>

        <Link to="/history">
          History
        </Link>

        <Link to="/analytics">
          Analytics
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;