import React, { useState, useEffect } from 'react';
import { wordsData as initialWordsData } from '../data/words';

const Superadmin = () => {
    const [words, setWords] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingWord, setEditingWord] = useState(null);
    const [formData, setFormData] = useState({ id: null, word: '', meaning: '', category: 'General', usage: '', status: 'confirmed' });

    // Load from localStorage or fallback to initial data
    useEffect(() => {
        const storedWords = localStorage.getItem('krv_dictionary');
        if (storedWords) {
            setWords(JSON.parse(storedWords));
        } else {
            setWords(initialWordsData);
            localStorage.setItem('krv_dictionary', JSON.stringify(initialWordsData));
        }
    }, []);

    const saveToLocalStorage = (newWords) => {
        setWords(newWords);
        localStorage.setItem('krv_dictionary', JSON.stringify(newWords));
    };

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(words, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "words_export.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingWord) {
            // Update
            const updatedWords = words.map(w => w.id === formData.id ? formData : w);
            saveToLocalStorage(updatedWords);
        } else {
            // Add
            const newWord = { ...formData, id: Date.now() };
            saveToLocalStorage([newWord, ...words]);
        }
        setFormData({ id: null, word: '', meaning: '', category: 'General', usage: '', status: 'confirmed' });
        setEditingWord(null);
    };

    const handleEdit = (wordObj) => {
        setEditingWord(wordObj);
        setFormData(wordObj);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this word?")) {
            const updatedWords = words.filter(w => w.id !== id);
            saveToLocalStorage(updatedWords);
        }
    };

    const filteredWords = words.filter(w => w.word.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="container page-layout" style={{ maxWidth: '1200px' }}>
            <div className="content-area" style={{ gridColumn: '1 / -1' }}>
                <div className="dictionary-header">
                    <div className="dictionary-title">
                        <h2>Superadmin Dictionary Dashboard</h2>
                        <div className="subtext">Manage local dictionary data.</div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn btn-outline" onClick={handleExport}>Export JSON</button>
                    </div>
                </div>

                {/* Form Area */}
                <div className="welcome-box" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <div style={{ flex: '1 1 200px' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Word</label>
                            <input type="text" name="word" value={formData.word} onChange={handleFormChange} required style={{ width: '100%', padding: '0.5rem' }} />
                        </div>
                        <div style={{ flex: '2 1 300px' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Meaning</label>
                            <input type="text" name="meaning" value={formData.meaning} onChange={handleFormChange} required style={{ width: '100%', padding: '0.5rem' }} />
                        </div>
                        <div style={{ flex: '1 1 150px' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Category</label>
                            <select name="category" value={formData.category} onChange={handleFormChange} style={{ width: '100%', padding: '0.5rem' }}>
                                <option value="General">General</option>
                                <option value="Idiom">Idiom</option>
                                <option value="Agriculture">Agriculture</option>
                                <option value="Household">Household</option>
                            </select>
                        </div>
                        <div style={{ flex: '1 1 120px' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Status</label>
                            <select name="status" value={formData.status || 'confirmed'} onChange={handleFormChange} style={{ width: '100%', padding: '0.5rem' }}>
                                <option value="confirmed">🟢 Confirmed</option>
                                <option value="guessed">🟡 Guessed</option>
                                <option value="unknown">🔴 Unknown</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary">
                            {editingWord ? 'Update Word' : 'Add Word'}
                        </button>
                        {editingWord && (
                            <button type="button" className="btn btn-outline" onClick={() => { setEditingWord(null); setFormData({ id: null, word: '', meaning: '', category: 'General', usage: '', status: 'confirmed' }); }}>
                                Cancel
                            </button>
                        )}
                    </form>
                </div>

                {/* Table Area */}
                <div className="dictionary-header" style={{ marginBottom: '1rem', paddingBottom: '0.5rem' }}>
                    <h3>Database ({words.length} entries)</h3>
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search words..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-container">
                    <table className="dictionary-table">
                        <thead>
                            <tr>
                                <th>Word</th>
                                <th>Meaning</th>
                                <th>Category</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredWords.map((item) => (
                                <tr key={item.id}>
                                    <td className="entry-word" style={{ whiteSpace: 'nowrap' }}>
                                        {item.status === 'confirmed' && <span style={{ color: '#22c55e', marginRight: '5px' }}>●</span>}
                                        {item.status === 'guessed' && <span style={{ color: '#eab308', marginRight: '5px' }}>●</span>}
                                        {item.status === 'unknown' && <span style={{ color: '#ef4444', marginRight: '5px' }}>●</span>}
                                        {item.word}
                                    </td>
                                    <td className="entry-meaning">{item.meaning}</td>
                                    <td><span className="badge">{item.category}</span></td>
                                    <td>
                                        <button className="btn btn-small btn-outline" style={{ marginRight: '0.5rem' }} onClick={() => handleEdit(item)}>Edit</button>
                                        <button className="btn btn-small btn-outline" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={() => handleDelete(item.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {filteredWords.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="no-results">No entries found matching "{searchTerm}"</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Superadmin;
