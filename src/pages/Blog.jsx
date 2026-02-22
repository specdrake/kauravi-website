import React from 'react';

const Blog = () => {
    return (
        <div className="container page-layout">
            <div className="content-area" style={{ gridColumn: '1 / -1' }}>
                <div className="welcome-box">
                    <h2 className="section-title">Community Blog & Articles</h2>
                    <p style={{ lineHeight: '1.6', fontSize: '1.1rem', marginBottom: '2rem' }}>
                        Stay updated with the latest research, cultural think-pieces, and community announcements regarding Western Uttar Pradesh and the Kauravi identity.
                    </p>

                    <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                        {/* Placeholder Post 1 */}
                        <div style={{ padding: '1.5rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                            <span className="badge" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>Culture</span>
                            <h3 style={{ marginTop: '0', color: '#166534' }}>The Linguistic Roots of Khari Boli</h3>
                            <p style={{ color: '#064e3b', fontSize: '0.95rem' }}>An deep dive into how our dialect shaped modern Hindi and Urdu...</p>
                            <a href="#" style={{ color: '#16a34a', fontWeight: 'bold', textDecoration: 'none', marginTop: '1rem', display: 'inline-block' }}>Read More →</a>
                        </div>

                        {/* Placeholder Post 2 */}
                        <div style={{ padding: '1.5rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                            <span className="badge" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>Agriculture</span>
                            <h3 style={{ marginTop: '0', color: '#166534' }}>Modernizing the Sugarcane Belt</h3>
                            <p style={{ color: '#064e3b', fontSize: '0.95rem' }}>Challenges and innovations in the agricultural heartland of Harit Pradesh...</p>
                            <a href="#" style={{ color: '#16a34a', fontWeight: 'bold', textDecoration: 'none', marginTop: '1rem', display: 'inline-block' }}>Read More →</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Blog;
