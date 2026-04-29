import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { HashRouter, Routes, Route, Link } from "react-router-dom";
import { useState } from "react";
import Home from "./Home";
import RegWaterUser from "./RegWaterUser";
import Billings from "./Billings";
import Readings from "./Readings";
import Users from "./Users";
import Dashboard from "./Dashboard";
import Analytics from "./Analytics";
import Login from "./Login";
import Workers from "./Workers";
import ReaderDashboard from "./ReaderDashboard";
import Logs from "./Logs";
import BillingDashboard from "./BillingDashboard";
import RegWorker from "./RegWorker";
import EmployeesList from "./EmployeesList";
import HistoryTable from "./HistoryTable";
import Sms from "./Sms";

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
              <img src="my-water.png" className="MyLogo" />
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
            <Link to = "/Login" className="MyNavLinks" onClick={() => setMenuOpen(false)}> Admin </Link>
            <Link to = "/Workers" className="MyNavLinks" onClick={() => setMenuOpen(false)}> Users </Link>
            <Link to = "/Sms" className="MyNavLinks" onClick={() => setMenuOpen(false)}> Sms </Link>
          </nav>

          {/*<hr />*/}
        </div>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/RegWaterUser" element={<RegWaterUser />} />
          <Route path="/Billings" element={<Billings/>} />
          <Route path="/Readings" element = {<Readings/>}/>
          <Route path="/Users" element = {<Users/>}/>
          <Route path="/Dashboard" element = {<Dashboard/>}/>
          <Route path="/Analytics" element = {<Analytics/>}/>
          <Route path="/Login" element = {<Login/>}/>
          <Route path="/Workers" element = {<Workers/>}/>
          <Route path="/ReaderDashboard" element = {<ReaderDashboard/>}/>
          <Route path="/Logs" element = {<Logs/>}/>
          <Route path="/BillingDashboard" element = {<BillingDashboard/>}/>
          <Route path="/RegWorker" element = {<RegWorker/>}/>
          <Route path="/EmployeesList" element = {<EmployeesList/>}/>
          <Route path="/HistoryTable" element = {<HistoryTable/>}/>
          <Route path="/Sms" element = {<Sms/>}/>
        </Routes>
      </HashRouter>

      <ToastContainer position="top-right" autoClose={5000} />
    </>
  );
}

export default App;
