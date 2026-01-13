import React from 'react';
import styles from './ContactForm.module.css';

const ContactForm = () => {
    return (
        <section id="contact" className={styles.contact}>
            <div className={styles.container}>
                <h2 className={styles.title}>Start Your Journey</h2>
                <p className={styles.subtitle}>Join thousands of users achieving their goals with BalanceAI.</p>
                <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                    <div className={styles.formGroup}>
                        <label htmlFor="name" className={styles.label}>Full Name</label>
                        <input type="text" id="name" className={styles.input} placeholder="John Doe" />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.label}>Email Address</label>
                        <input type="email" id="email" className={styles.input} placeholder="john@example.com" />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="message" className={styles.label}>Message (Optional)</label>
                        <textarea id="message" className={styles.textarea} placeholder="Tell us about your goals..."></textarea>
                    </div>
                    <button type="submit" className={styles.submitBtn}>Get Early Access</button>
                </form>
            </div>
        </section>
    );
};

export default ContactForm;
