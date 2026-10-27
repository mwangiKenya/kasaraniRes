
import { useState } from 'react';
import { MdWaterDrop, MdBusiness, MdSubscriptions, MdMenu, MdClose, MdLogout, MdOutlineAdminPanelSettings } from 'react-icons/md';
import Agencies from './Agencies';
import Subscription from './Subscription';
import styles from '../CssFiles/MgtDashboard.module.css';
function MgtDashboard(){
    const [activePage, setActivePage] = useState('agencies');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const menuItems = [
        { id: 'agencies', label: 'Agencies', icon: <MdBusiness /> },
        { id: 'subscriptions', label: 'Subscriptions', icon: <MdSubscriptions /> }
    ];
    const renderContent = () => {
        switch(activePage){
            case 'agencies':
                return <Agencies />;
            case 'subscriptions':
                return <Subscription />;
            default:
                return <Agencies />;
        }
    };
    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/SysAdminLogin';
    };
    const activeLabel = menuItems.find(item => item.id === activePage)?.label || 'Agencies';
    return(
        <div className={styles.dashboard}>
            <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}> 
                <nav className={styles.navigation}>
                    {menuItems.map(item => (
                        <button key={item.id} type="button" onClick={() => { setActivePage(item.id); setSidebarOpen(false); }} className={`${styles.navItem} ${activePage === item.id ? styles.navActive : ''}`}>
                            <span className={styles.navIcon}>{item.icon}</span>
                            <span>{item.label}</span>
                            {activePage === item.id && <span className={styles.activeIndicator} />}
                        </button>
                    ))}
                </nav>
                <div className={styles.sidebarBottom}>
                    <button className={styles.logoutButton} type="button" onClick={handleLogout}><MdLogout /><span>Sign out</span></button>
                </div>
            </aside>

            <main className={styles.AdminmainContent}>
                <section className={styles.pageContent} key={activePage}>
                    {renderContent()}
                </section>
            </main>
        </div>
    );
}
export default MgtDashboard;