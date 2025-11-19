import styles from "./ErrorPage.module.css";
function ErrorPage() {
    return(
        <>
            <div className={styles.ErrorPageDiv}>
                <h1 className={styles.ErrorPageHead}> You are currently running on the frontend side of application </h1>
                <p className={styles.ErrorPagePoint}>
                    <i>
                        The system is yet to connect to the database for data retrieval.
                    </i>
                </p>
                <p className={styles.ErrorPagePoint}>
                    Backend integration will be available soon.
                </p>
                <strong className={styles.ErrorPageStrong}>
                    <p>
                        <i> Loading... </i>
                    </p>
                </strong>
            </div>
        </>
    );
}

export default ErrorPage;