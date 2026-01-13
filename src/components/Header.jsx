import React from 'react';
import styles from './Header.module.css';

const Header = () => {
    return (
        <header className={styles.header}>
            <div className={styles.logo}>
                Balance<span>AI</span>
            </div>
            <nav className={styles.nav}>
                <a href="#features" className={styles.navLink}>Features</a>
                <a href="#gallery" className={styles.navLink}>Gallery</a>
                <a href="#testimonials" className={styles.navLink}>Testimonials</a>
            </nav>
            <a href="/login" target="_blank" rel="noopener noreferrer" className={styles.ctaButton}>Get Started</a>
        </header>
    );
};

export default Header;
