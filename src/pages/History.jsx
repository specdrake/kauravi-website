import React from 'react';

const History = () => {
    return (
        <div className="container page-layout">
            <div className="content-area" style={{ gridColumn: '1 / -1' }}>
                <div className="welcome-box">
                    <h2 className="section-title">History of Kauravi</h2>
                    <p style={{ lineHeight: '1.6', fontSize: '1.1rem' }}>
                        The history of the Kauravi (Khari Boli) speaking region is deeply intertwined with the agrarian heartland of Western Uttar Pradesh.
                        Often considered the cradle of modern Standard Hindi and Urdu, this region has witnessed the rise and fall of empires,
                        the flourishing of agricultural communities, and the enduring spirit of its people.
                    </p>
                    <br />
                    <p style={{ lineHeight: '1.6', fontSize: '1.1rem' }}>
                        Historically, this land has been recognized for its fierce independence, agricultural prowess, and the rich linguistic heritage
                        that eventually became the lingua franca of much of northern India. We are working on expanding this section with detailed
                        historical accounts sourced from well-regarded archives.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default History;
