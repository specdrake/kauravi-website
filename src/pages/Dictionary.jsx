import React, { useState, useEffect } from 'react';
import { wordsData as fallbackWordsData } from '../data/words';

const ITEMS_PER_PAGE = 20;

const Dictionary = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [words, setWords] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        // Load from localStorage, but validate that data has the 'status' field.
        // If not, force-refresh from the updated fallback data which has statuses.
        const storedWords = localStorage.getItem('krv_dictionary');
        if (storedWords) {
            const parsed = JSON.parse(storedWords);
            // Check if the first item has a status field; if not, data is stale
            if (parsed.length > 0 && parsed[0].status === undefined) {
                // Stale data - update localStorage with the new data that has statuses
                localStorage.setItem('krv_dictionary', JSON.stringify(fallbackWordsData));
                setWords(fallbackWordsData);
            } else {
                setWords(parsed);
            }
        } else {
            setWords(fallbackWordsData);
            localStorage.setItem('krv_dictionary', JSON.stringify(fallbackWordsData));
        }
    }, []);

    // Reset to page 1 when search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const filteredWords = words.filter((item) =>
        item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.meaning && item.meaning.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalPages = Math.ceil(filteredWords.length / ITEMS_PER_PAGE);
    const paginatedWords = filteredWords.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const getStatusDot = (status) => {
        if (status === 'confirmed') return <span style={{ color: '#22c55e', marginRight: '6px', fontSize: '0.75rem' }}>●</span>;
        if (status === 'guessed') return <span style={{ color: '#eab308', marginRight: '6px', fontSize: '0.75rem' }}>●</span>;
        if (status === 'unknown') return <span style={{ color: '#ef4444', marginRight: '6px', fontSize: '0.75rem' }}>●</span>;
        return null;
    };

    return (
        <div className="container dictionary-page">
            <div className="dictionary-header">
                <div className="dictionary-title">
                    <h2>Kauravi Glossary</h2>
                    <p className="subtext" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <span>{filteredWords.length} {searchTerm ? 'matching' : 'total'} entries</span>
                        <span style={{ fontSize: '0.85em', display: 'flex', gap: '0.75rem', opacity: 0.85 }}>
                            <span><span style={{ color: '#22c55e' }}>●</span> Confirmed</span>
                            <span><span style={{ color: '#eab308' }}>●</span> Guessed</span>
                            <span><span style={{ color: '#ef4444' }}>●</span> Unknown</span>
                        </span>
                    </p>
                </div>
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search glossary..."
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
                            <th>Pronunciation</th>
                            <th>Meaning</th>
                            <th className="hide-mobile">Example Usage</th>
                            <th>Tag</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedWords.length > 0 ? (
                            paginatedWords.map((item, index) => (
                                <tr key={item.id ?? index}>
                                    <td className="entry-word" style={{ whiteSpace: 'nowrap' }}>
                                        {getStatusDot(item.status)}
                                        {item.word}
                                    </td>
                                    <td className="entry-pronunciation">{item.pronunciation || '-'}</td>
                                    <td className="entry-meaning">{item.meaning}</td>
                                    <td className="entry-usage hide-mobile">
                                        {item.usage ? <em>"{item.usage}"</em> : <span className="text-muted">-</span>}
                                    </td>
                                    <td><span className="badge">{item.category}</span></td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="no-results">
                                    No records found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginTop: '1.5rem',
                    flexWrap: 'wrap',
                }}>
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="btn btn-outline"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                    >
                        ← Prev
                    </button>

                    {/* Page number buttons — show a window of 5 pages */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                        .reduce((acc, p, i, arr) => {
                            if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                            acc.push(p);
                            return acc;
                        }, [])
                        .map((item, i) =>
                            item === '...'
                                ? <span key={`ellipsis-${i}`} style={{ padding: '0 0.25rem' }}>…</span>
                                : (
                                    <button
                                        key={item}
                                        onClick={() => setCurrentPage(item)}
                                        className={`btn ${currentPage === item ? 'btn-primary' : 'btn-outline'}`}
                                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.9rem', minWidth: '2.5rem' }}
                                    >
                                        {item}
                                    </button>
                                )
                        )
                    }

                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="btn btn-outline"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                    >
                        Next →
                    </button>

                    <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', opacity: 0.7 }}>
                        Page {currentPage} of {totalPages}
                    </span>
                </div>
            )}
        </div>
    );
};

export default Dictionary;
