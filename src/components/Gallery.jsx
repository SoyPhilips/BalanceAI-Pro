import React from 'react';
import styles from './Gallery.module.css';

const Gallery = () => {
    return (
        <section id="gallery" className={styles.gallery}>
            <div className={styles.container}>
                <h2 className={styles.title}>See It In Action</h2>
                <div className={styles.grid}>
                    <div className={styles.imageCard}></div>
                    <div className={styles.imageCard}></div>
                    <div className={styles.imageCard}></div>
                </div>
            </div>
        </section>
    );
};

export default Gallery;
