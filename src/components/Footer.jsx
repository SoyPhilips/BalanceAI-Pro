import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.top}>
                    <div className={styles.brand}>Balance<span>AI</span></div>
                    <div className={styles.links}>
                        <a href="#" className={styles.link}>Privacy Policy</a>
                        <a href="#" className={styles.link}>Terms of Service</a>
                        <a href="#" className={styles.link}>Contact Support</a>
                    </div>
                    <div className={styles.links}>
                        <a href="#" className={styles.link}>Twitter</a>
                        <a href="#" className={styles.link}>Instagram</a>
                        <a href="#" className={styles.link}>LinkedIn</a>
                    </div>
                </div>
                <div className={styles.bottom}>
                    &copy; {new Date().getFullYear()} BalanceAI. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
