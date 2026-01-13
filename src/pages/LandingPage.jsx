import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Gallery from '../components/Gallery';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';

const LandingPage = () => {
    return (
        <>
            <Header />
            <main>
                <Hero />
                <Features />
                <Gallery />
                <Testimonials />
            </main>
            <Footer />
        </>
    );
};

export default LandingPage;
