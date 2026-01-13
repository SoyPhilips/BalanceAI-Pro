import React from 'react';
import styles from './Hero.module.css';

const Hero = () => {
    return (
        <section className={styles.hero}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <span className={styles.badge}>New: AI Food Scanning</span>
                    <h1 className={styles.title}>
                        Master Your Nutrition with <span>BalanceAI</span>
                    </h1>
                    <p className={styles.description}>
                        The smartest way to track your diet. Scan meals, analyze nutrients, and achieve your wellness goals with the power of artificial intelligence.
                    </p>
                    <div className={styles.actions}>
                        <a href="/login" target="_blank" rel="noopener noreferrer" className={styles.primaryBtn}>Start Free Trial</a>
                        <a href="#features" className={styles.secondaryBtn}>Learn More</a>
                    </div>
                </div>
                <div className={styles.imageWrapper}>
                    <div className={styles.imagePlaceholder}>
                        {/* Placeholder for App Screenshot */}
                        App Interface Preview
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
