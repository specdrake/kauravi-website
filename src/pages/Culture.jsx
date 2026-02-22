import React from 'react';

const Culture = () => {
    return (
        <div className="container page-layout">
            <div className="content-area">
                <article className="post-article">
                    <header className="article-header">
                        <h2>The Legacy of Western UP & Kauravi</h2>
                        <div className="article-meta">Published by <span className="author">Site Admin</span> in History</div>
                    </header>

                    <div className="article-body">
                        <p>
                            The Kauravi or Kuru dialect and culture stem from the fertile plains of Western Uttar Pradesh.
                            Historically known as the Kuru Kingdom in the Mahabharata, the region is known for its agrarian roots,
                            robust way of life, and straightforward communication style.
                        </p>
                        <h3>Roots of Khari Boli</h3>
                        <p>
                            The language, Kauravi (popularly known as Khari Boli), serves as the foundational base for Modern Standard Hindi.
                            Known for its strong, earthy dialect that sounds both poetic and direct, it captures the raw essence of the people.
                        </p>
                        <div className="info-box">
                            <strong>Fun Fact:</strong> The term "Khari" (खड़ी) literally means "standing" or "upright", reflecting the perceived stiffness or rustic nature of the dialect compared to Awadhi or Braj Bhasha.
                        </div>
                        <h3>Agrarian Spirit</h3>
                        <p>
                            Deep connections to farming and a hardworking lifestyle form the backbone of the community. Idioms and daily phrases heavily lean on agricultural metaphors, seasons, and livestock.
                        </p>
                    </div>
                </article>
            </div>

            <aside className="sidebar">
                <div className="sidebar-widget">
                    <h4>Related Topics</h4>
                    <ul className="link-list">
                        <li><a href="#">Mahabharata and the Kuru Region</a></li>
                        <li><a href="#">Evolution into Modern Hindi</a></li>
                        <li><a href="#">Folk Music & Traditions</a></li>
                    </ul>
                </div>
            </aside>
        </div>
    );
};

export default Culture;
