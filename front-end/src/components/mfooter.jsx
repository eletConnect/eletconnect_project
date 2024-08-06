import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import "../assets/styles/mMain.css";

export default function MFooter() {
    const menuItems = [
        { path: '', label: 'Início', icon: 'bi bi-bookmark-fill text-white' },
        { path: '', label: 'Eletivas', icon: 'bi bi-journal-bookmark-fill text-white' },
    ];

    return (
        <footer id='mFooter'>
            <ul className='footer-menu d-flex justify-content-around align-items-center'>
                {menuItems.map((item, index) => (
                    <li key={index} className='text-center'>
                        <Link to={item.path} className={location.pathname === item.path ? 'active' : ''}>
                            <i className={item.icon} aria-hidden="true"></i>
                            <p className='m-0'>{item.label}</p>
                        </Link>
                    </li>
                ))}
            </ul>
        </footer>
    );
}