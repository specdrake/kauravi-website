import React from 'react';

const Hero = () => {
    return (
        <section id="hero" className="hero-section container">
            <div className="hero-content">
                <h1 className="hero-title">
                    Discover the Heart of <span className="text-gradient">Kauravi Culture</span>
                </h1>
                <p className="hero-subtitle">
                    From the vibrant fields of Western Uttar Pradesh to the bold and dynamic dialect.
                    Dive into the history, language, and the unbreakable spirit of the Kuru region.
                </p>
                <div className="hero-buttons">
                    <a href="#dictionary" className="btn btn-primary">Explore the Dialect</a>
                    <a href="#culture" className="btn btn-secondary" style={{ marginLeft: '1rem' }}>Know the History</a>
                </div>
            </div>
        </section>
    );
};

export default Hero;
