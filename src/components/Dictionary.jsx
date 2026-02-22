import React, { useState } from 'react';
import { wordsDump } from '../data/words';

const Dictionary = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredWords = wordsDump.filter((item) =>
        item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.meaning.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <section id="dictionary" className="dictionary-section container">
            <div className="dictionary-header">
                <h2>Kauravi <span className="text-gradient">Dictionary</span></h2>
                <p>Explore our living database of {wordsDump.length}+ words and phrases from Western UP.</p>
            </div>

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search a word or meaning (e.g., bawala)..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="words-grid">
                {filteredWords.length > 0 ? (
                    filteredWords.map((item, index) => (
                        <div className="word-card" key={index}>
                            <div className="word-header">
                                <h3>{item.word}</h3>
                                <span className="word-category">{item.category}</span>
                            </div>
                            <p className="pronunciation">🗣️ {item.pronunciation}</p>
                            <div className="divider"></div>
                            <p className="meaning"><strong>Meaning:</strong> {item.meaning}</p>
                            {item.usage && (
                                <p className="usage"><strong>Usage:</strong> <em>"{item.usage}"</em></p>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="no-results">
                        <p>No words found for "{searchTerm}".</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Dictionary;
