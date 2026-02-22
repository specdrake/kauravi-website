import React from 'react';
import { NavLink } from 'react-router-dom';

const Navigation = () => {
    return (
        <nav className="nav-bar">
            <div className="container">
                <ul className="nav-tabs">
                    <li>
                        <NavLink
                            to="/"
                            className={({ isActive }) => (isActive ? 'nav-tab active' : 'nav-tab')}
                        >
                            Overview
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/identity"
                            className={({ isActive }) => (isActive ? 'nav-tab active' : 'nav-tab')}
                        >
                            Identity & Culture
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/history"
                            className={({ isActive }) => (isActive ? 'nav-tab active' : 'nav-tab')}
                        >
                            History
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/struggle"
                            className={({ isActive }) => (isActive ? 'nav-tab active' : 'nav-tab')}
                        >
                            The Struggle
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/map"
                            className={({ isActive }) => (isActive ? 'nav-tab active' : 'nav-tab')}
                        >
                            Interactive Map
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/dictionary"
                            className={({ isActive }) => (isActive ? 'nav-tab active' : 'nav-tab')}
                        >
                            Glossary / Dictionary
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/blog"
                            className={({ isActive }) => (isActive ? 'nav-tab active' : 'nav-tab')}
                        >
                            Blog
                        </NavLink>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navigation;
