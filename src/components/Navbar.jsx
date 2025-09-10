import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "../assets/company_logo.png";
import { FaUserCircle } from 'react-icons/fa';
import '../styles/Navbar.css'; 


export default function Navbar() {
   
    return (
        <nav className="navbar navbar-expand-lg fixed-top bg-white shadow-sm px-4">
            <Link className="navbar-brand" to="/">
                <img style={{ height: "2rem" }} src={logo} alt="Company Logo" />
            </Link>
            <div className="collapse navbar-collapse">
                <ul className="navbar-nav ms-auto">
                    <li className="nav-item">
                        <Link className="nav-link" to="/">
                            <FaUserCircle
                                size={24}
                                style={{
                                    "color": "#0070ad",
                                    "opacity": 0.7
                                }} />
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
}
