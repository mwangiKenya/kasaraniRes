import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { HashRouter, Routes, Route, Link } from "react-router-dom";
import { useState } from "react";

import Home from "./Home";
import SignIn from "./SignIng";
import Readings from "./Readings";
import Plots from "./Plots";
import Dashboard from "./Dashboard";
import WaterData from "./WaterData";
import RegWaterUser from "./RegWaterUser";
import ErrorPage from "./ErrorPage";
import Finances from "./Finances";
import Tenant from "./Tenant";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const plot = {
    name: "Kasarani Res ltd",
    location: "Kasarani",
    slogan: "Your Number One residence",
    service: "Water supply services"
  };

  return (
    <>
      <HashRouter>
        <div className="MainDivHolder">
          <div className="AppTopDiv">

            <div>
              <img src="Adster ltd.png" className="MyLogo" />
            </div>

            <div>
              <h1>{plot.name} </h1>
            </div>

            <div>
              <p>{plot.slogan}</p>
              <p> {plot.service} </p>
              

              {/* 👉 MOBILE HAMBURGER BUTTON */}
              <div 
                className="Hamburger" 
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <div></div>
                <div></div>
                <div></div>
              </div>
            </div>
          </div>

          {/* 👉 MAIN NAVIGATION */}
          <nav className={`Navigation ${menuOpen ? "ShowMenu" : ""}`}>
            <Link to="/" className="MyNavLinks" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/SignIn" className="MyNavLinks" onClick={() => setMenuOpen(false)}>Admin login</Link>
            <Link to="/Tenant" className="MyNavLinks" onClick={() => setMenuOpen(false)}>Tenant</Link>
            <Link to="/Tenant" className="MyNavLinks" onClick={() => setMenuOpen(false)}>Water User</Link>
            {/*<Link to="/Help" className="HelpLink" onClick={() => setMenuOpen(false)}>Help</Link>*/}
          </nav>

          <hr />
        </div>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/SignIn" element={<SignIn />} />
          <Route path="/Readings" element={<Readings />} />
          <Route path="/Plots" element={<Plots />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/WaterData" element={<WaterData />} />
          <Route path="/RegWaterUser" element={<RegWaterUser />} />
          <Route path="/ErrorPage" element={<ErrorPage />} />
          <Route path="/Finances" element={<Finances />} />
          <Route path="/Tenant" element={<Tenant />} />
        </Routes>
      </HashRouter>

      <ToastContainer position="top-right" autoClose={5000} />
    </>
  );
}

export default App;
