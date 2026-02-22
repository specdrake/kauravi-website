import React from 'react';
import { FaDiscord, FaReddit } from 'react-icons/fa';

const Home = () => {
    return (
        <div className="container page-layout">
            <div className="content-area">
                <section className="welcome-box">
                    <h2>Welcome to the Kauravi Culture Portal</h2>
                    <p>This community space is dedicated to documenting, sharing, and preserving the vibrant culture, dialect, and history of Western Uttar Pradesh.</p>
                    <div className="action-buttons">
                        <a href="/dictionary" className="btn btn-primary">Browse Glossary</a>
                        <a href="/culture" className="btn btn-outline">Read the History</a>
                    </div>
                </section>

                <section className="recent-updates">
                    <h3>Recent Discussions</h3>
                    <ul className="discussion-list">
                        <li>
                            <div className="discussion-meta">Announcements • 2 hours ago by <span className="author">Admin</span></div>
                            <a href="#" className="discussion-title">New words added to the Glossary!</a>
                        </li>
                        <li>
                            <div className="discussion-meta">General • 1 day ago by <span className="author">Chaudhary</span></div>
                            <a href="#" className="discussion-title">Regional variations of Khari Boli across districts</a>
                        </li>
                        <li>
                            <div className="discussion-meta">History • 3 days ago by <span className="author">HistorianUP</span></div>
                            <a href="#" className="discussion-title">The agrarian roots of Kauravi idioms</a>
                        </li>
                    </ul>
                </section>
            </div>

            <aside className="sidebar">
                <div className="sidebar-widget">
                    <h4>Community Links</h4>
                    <ul className="link-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <li>
                            <a href="https://discord.gg/NkMp7yC7zH" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#5865F2', fontWeight: 'bold', textDecoration: 'none' }}>
                                <FaDiscord size={24} /> Join Harit Pradesh Discord
                            </a>
                        </li>
                        <li>
                            <a href="https://www.reddit.com/r/WesternUttarPradesh/" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ff4500', fontWeight: 'bold', textDecoration: 'none' }}>
                                <FaReddit size={24} /> r/WesternUttarPradesh
                            </a>
                        </li>
                    </ul>
                </div>
                <div className="sidebar-widget">
                    <h4>About Community</h4>
                    <p>A place for researchers, locals, and enthusiasts to explore the roots of Western UP's unique demographic and dialect.</p>
                    <div className="stats">
                        <div className="stat"><strong>500+</strong> Words</div>
                        <div className="stat"><strong>More than 3k</strong> Members</div>
                    </div>
                </div>
            </aside>
        </div>
    );
};

export default Home;
