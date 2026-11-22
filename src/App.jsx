import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { HashRouter, Routes, Route, Link } from "react-router-dom";
import { useState } from "react";
import Home from "./General/JsxFiles/Home";
import RegWaterUser from "./Users/JsxFiles/RegWaterUser";
import Billings from "./Billings/JsxFiles/Billings";
import Readings from "./Readings/JsxFiles/Readings";
import Users from "./Users/JsxFiles/Users";
import Dashboard from "./Dashboards/JsxFiles/Dashboard";
import Analytics from "./General/JsxFiles/Analytics";
import Login from "./Users/JsxFiles/Login";
import Workers from "./Users/JsxFiles/Workers";
import ReaderDashboard from "./Dashboards/JsxFiles/ReaderDashboard";
import Logs from "./General/JsxFiles/Logs";
import BillingDashboard from "./Billings/JsxFiles/BillingDashboard";
import RegWorker from "./Users/JsxFiles/RegWorker";
import EmployeesList from "./Users/JsxFiles/EmployeesList";
import HistoryTable from "./Readings/JsxFiles/HistoryTable";
import Sms from "./Billings/JsxFiles/Sms";
import Reminder from "./Billings/JsxFiles/Reminder";
import Payments from "./Billings/JsxFiles/Payments";
import ReadingsHistory from "./Readings/JsxFiles/ReadingsHistory";
import SysAdminLogin from "./Admin/JsxFiles/SysAdminLogin";
import MgtDashboard from "./Admin/JsxFiles/MgtDashboard";
import Subscriptions from "./Admin/JsxFiles/Subscription";
import Agencies from "./Admin/JsxFiles/Agencies";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const plot = {
    name: "Kamengo Agencies",
    location: "Kasarani",
    //slogan: "Your Number One residence",
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
              

              {/* MOBILE HAMBURGER BUTTON */}
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

          <nav className={`Navigation ${menuOpen ? "ShowMenu" : ""}`}>
            <Link to="/" className="MyNavLinks" onClick={() => setMenuOpen(false)}>Home</Link>
            {/*<Link to = "/SysAdminLogin" className="MyNavLinks" onClick={() => setMenuOpen(false)}> Admin </Link>*/}
            <Link to = "/Workers" className="MyNavLinks" onClick={() => setMenuOpen(false)}> Login to Continue </Link>
            {/*<Link to = "/Sms" className="MyNavLinks" onClick={() => setMenuOpen(false)}> Sms </Link>*/}
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
          <Route path="/Reminder" element = {<Reminder/>}/>
          <Route path="/Payments" element = {<Payments/>}/>
          <Route path="/ReadingsHistory" element = {<ReadingsHistory/>}/>
          <Route path="/SysAdminLogin" element = {<SysAdminLogin/>}/>
          <Route path="/MgtDashboard" element = {<MgtDashboard/>}/>
          <Route path="/Subscriptions" element = {<Subscriptions/>}/>
          <Route path="/Agencies" element = {<Agencies/>}/>
        </Routes>
      </HashRouter>

      <ToastContainer position="top-right" autoClose={5000} />
    </>
  );
}

export default App;
