import styles from '../CssFiles/Agencies.module.css';
function Agencies(){
    return(
        <>
           <h2 className={styles.AgenciesH1}>Manage the Agencies on this page</h2>
           <Statistics/>
           <Actions/>
        </>
    );
}

export default Agencies;

function Statistics(){
    return(
        <>
           <div className={styles.StatisticsMainDiv}>
            <h3 className={styles.SubDivHead}>Agency statistics</h3>
            <div className={styles.CardsHolder}>
                <div className={styles.TheCard}>
                    <h4 className={styles.CardPoint}>Registered Agencies</h4>
                    <p className={styles.CardData}>XXX</p>
                </div>
                <div className={styles.TheCard}>
                    <h4 className={styles.CardPoint}>Active Agencies</h4>
                    <p className={styles.CardData}>YYY</p>
                </div>
                <div className={styles.TheCard}>
                    <h4 className={styles.CardPoint}>Inactive Agencies</h4>
                    <p className={styles.CardData}>AAA</p>
                </div>
            </div>
           </div>
        </>
    );
}

function Actions(){
    return(
        <>
            <div className={styles.StatisticsMainDiv}>
                <h3 className={styles.SubDivHead}>Quick Actions</h3>
                <div className={styles.CardsHolder}>
                    <div className={styles.TheCard}>
                        <h4 className={styles.CardPoint}>Add Agency</h4>
                        <button className={styles.AddBtn}>Add Agency</button>
                    </div>
                    <div className={styles.TheCard}>
                        <h4 className={styles.CardPoint}>Update Agency</h4>
                        <button className={styles.UpdateBtn}>Update Agency</button>
                    </div>
                    <div className={styles.TheCard}>
                        <h4 className={styles.CardPoint}>Delete Agency</h4>
                        <button className={styles.DeleteBtn}>Delete Agency</button>
                    </div>
                </div>
            </div>
        </>
    );
}