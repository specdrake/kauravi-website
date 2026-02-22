import React from 'react';

const CultureIntro = () => {
    return (
        <section id="culture" className="culture-section container">
            <div className="culture-grid">
                <div className="culture-text">
                    <h2>The Legacy of <span className="text-gradient">Western UP</span></h2>
                    <p>
                        The Kauravi or Kuru dialect and culture stem from the fertile plains of Western Uttar Pradesh.
                        Historically known as the Kuru Kingdom in the Mahabharata, the region is known for its agrarian roots,
                        robust way of life, and straightforward communication style.
                    </p>
                    <p>
                        The language, Kauravi (popularly known as Khari Boli), serves as the foundational base for Modern Standard Hindi.
                        Known for its strong, earthy dialect that sounds both poetic and direct, it captures the raw essence of the people.
                    </p>
                    <div className="highlights">
                        <div className="highlight-item">
                            <h3>Earthly Dialect</h3>
                            <p>Khari Boli brings a unique roughness that signifies honesty.</p>
                        </div>
                        <div className="highlight-item">
                            <h3>Agrarian Spirit</h3>
                            <p>Deep connections to farming and a hardworking lifestyle.</p>
                        </div>
                    </div>
                </div>
                {/* Placeholder for an artistic image representing the region */}
                <div className="culture-image">
                    <div className="image-placeholder">
                        <div className="gradient-sphere"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CultureIntro;
