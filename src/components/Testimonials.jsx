import React from 'react';
import styles from './Testimonials.module.css';

const testimonialsList = [
    {
        quote: "BalanceAI has completely transformed how I approach nutrition. The AI scanner is a game changer!",
        name: "Sarah Johnson",
        role: "Fitness Enthusiast",
        initials: "SJ"
    },
    {
        quote: "Finally, an app that understands my dietary needs. The insights are incredibly detailed and helpful.",
        name: "Michael Chen",
        role: "Nutritionist",
        initials: "MC"
    },
    {
        quote: "I've lost 10 pounds in 2 months just by tracking with BalanceAI. It's so easy to use.",
        name: "Emily Davis",
        role: "User",
        initials: "ED"
    }
];

const Testimonials = () => {
    return (
        <section id="testimonials" className={styles.testimonials}>
            <div className={styles.container}>
                <h2 className={styles.title}>What Our Users Say</h2>
                <div className={styles.grid}>
                    {testimonialsList.map((item, index) => (
                        <div key={index} className={styles.card}>
                            <p className={styles.quote}>"{item.quote}"</p>
                            <div className={styles.author}>
                                <div className={styles.avatar}>{item.initials}</div>
                                <div className={styles.info}>
                                    <h4>{item.name}</h4>
                                    <span>{item.role}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
