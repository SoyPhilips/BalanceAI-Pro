import React from 'react';
import styles from './Features.module.css';

const featuresList = [
    {
        title: "Smart Food Logging",
        description: "Effortlessly track your daily meals with our intuitive database and quick-add features.",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
        )
    },
    {
        title: "Nutritional Progress",
        description: "Visualize your journey with detailed charts and insights into your macro and micronutrients.",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
        )
    },
    {
        title: "AI Food Scanner",
        description: "Simply snap a photo of your meal, and let our AI identify ingredients and estimate calories instantly.",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v5" /><path d="M3 12v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5" /><path d="M12 12v-3" /><path d="M8 12v-2" /><path d="M16 12v-2" /></svg>
        )
    },
    {
        title: "Calorie Calculator",
        description: "Get precise calorie counts and personalized daily goals based on your body metrics and activity.",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M16 12l-4-4-4 4" /><path d="M12 16V8" /></svg>
        )
    }
];

const Features = () => {
    return (
        <section id="features" className={styles.features}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Everything You Need</h2>
                    <p className={styles.subtitle}>
                        Powerful tools to help you maintain a balanced diet and achieve your health goals.
                    </p>
                </div>
                <div className={styles.grid}>
                    {featuresList.map((feature, index) => (
                        <div key={index} className={styles.card}>
                            <div className={styles.iconWrapper}>
                                {feature.icon}
                            </div>
                            <h3 className={styles.cardTitle}>{feature.title}</h3>
                            <p className={styles.cardDescription}>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
