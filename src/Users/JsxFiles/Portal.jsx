import { useEffect, useState } from "react";
import styles from '../CssFiles/Portal.module.css';
import mainUrl from '../../api';
function Portal(){
    const [activeView, setActiveView] = useState('personal');
    const [navOpen, setNavOpen] = useState(false);
    const user_id = localStorage.getItem("user_id");
    const select = (view) => {
        setActiveView(view);
        setNavOpen(false);
    };
    const renderContent = () =>{
        switch(activeView){
            case "personal":
                return <PersonalInfo user_id={user_id}/>;
            case "readings":
                return <Readings user_id={user_id}/>;
            case "billings":
                return <Billings user_id={user_id}/>;
            default:
                return <PersonalInfo/>
        }
    }
    return(
        <>
            <button
                className={`${styles.HamburgerBtn} ${navOpen ? styles.HamburgerBtnOpen : ""}`}
                onClick={() => setNavOpen(!navOpen)}
                aria-label="Toggle navigation"
            >
                <span></span><span></span><span></span>
            </button>
            <div
                className={`${styles.Overlay} ${navOpen ? styles.OverlayVisible : ""}`}
                onClick={() => setNavOpen(false)}
            />
            <div className={styles.PortalMainDiv}>
                <div className={`${styles.PortalNavDiv} ${navOpen ? styles.PortalNavDivOpen : ""}`}>
                    <h3>Navigation</h3>
                    <p>User{user_id}</p>
                    <button onClick={() => select("personal")}
                        className={`${styles.PortalNavBtn} ${activeView === "personal" ? styles.PortalNavBtnActive : ""}`}>Personal data</button>
                    <button onClick={() => select("readings")}
                        className={`${styles.PortalNavBtn} ${activeView === "readings" ? styles.PortalNavBtnActive : ""}`}>Readings data</button>
                    <button onClick={() => select("billings")}
                        className={`${styles.PortalNavBtn} ${activeView === "billings" ? styles.PortalNavBtnActive : ""}`}>My Bills</button>
                </div>
                <div className={styles.PortalMainCtnt}>
                    {renderContent()}
                </div>
            </div>
        </>
    );
}

export default Portal;

function PersonalInfo(props){
    const [data,setData] = useState({});
    useEffect(() => {
        getData();
    },[props.user_id]);
    const getData = async () =>{
        const res = await fetch(`${mainUrl}read_personal_data/${props.user_id}/`);
        const result = await res.json();
        setData(result[0]);
    };
    return(
        <>
            <div className={styles.PortalDataDiv}>
                <h3>Personal details</h3>
                <p>Name: {data.fname || '-'}</p>
                <p>Phone: {data.phone || '-'}</p>
                <p>Email: {data.email || '-'}</p>
            </div>
        </>
    );
}

function Readings(props){
    const [data, setData] = useState({});
    useEffect(() => {
        getRead();
    }, [props.user_id]);
    const getRead = async () => {
        const res = await fetch(`${mainUrl}read_readings_data/${props.user_id}/`);
        const result = await res.json();
        setData(result[0]);
    }
    return(
        <>
           <div className={styles.PortalDataDiv}>
                <h3>Readings data</h3>
                <p>Prev User: {data.prev_user || 0}</p>
                <p>Prev Sup: {data.prev_sup || 0}</p>
                <p>Cur User: {data.cur_user || 0}</p>
                <p>cur Sup: {data.cur_sup || 0}</p>
           </div>
        </>
    );
}

function Billings(props){
    const [bill, setBill] = useState({});
    useEffect(() => {
        getBill();
    }, [props.user_id]);
    const getBill = async () => {
        const res = await fetch(`${mainUrl}read_bill_data/${props.user_id}/`);
        const result = await res.json();
        setBill(result[0]);
    }
    return(
        <>
            <div className={styles.PortalDataDiv}>
                <h3>Billing Infomation</h3>
                <p>Billing Date: {bill.billed_on || '-'}</p>
                <p>Usage: {bill.units_used || 0}</p>
                <p>Rate: {bill.rate || 0}</p>
                <p>Current Bill: {bill.bill || 0}</p>
                <p>Bal c/d: {bill.b_cd || 0}</p>
                <p>Penalty: {bill.penalty || 0}</p>
                <p>Paid: {bill.paid || 0}</p>
                <p>Bal: {bill.bal || 0}</p>
                <p>Status: {bill.status || '-'}</p>
            </div>
        </>
    )
}