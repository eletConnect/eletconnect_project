import React from 'react';
import { Link } from 'react-router-dom';

import "../assets/styles/mMain.css";

export default function MFooter() {
    const menuItems = [
        { path: '', label: 'Eletivas', icon: 'bi bi-journal-bookmark-fill fs-2' },
        { path: '', label: '', icon: '' },
        { path: '', label: '', icon: '' },
        
         
    ];

    return (
        <footer id='mFooter'>
            <ul className='footer-menu d-flex justify-content-around align-items-center '>
                {menuItems.map((item, index) => (
                    <li key={index} className='text-center'>
                        <Link to={item.path} className={location.pathname === item.path ? 'active' : ''}>
                            <i className={item.icon} aria-hidden="true"></i>
                            <p className='m-0'><small>{item.label}</small></p>
                        </Link>
                    </li>
                ))}
                <button className='position-absolute top-0 start-50 translate-middle rounded-circle cor-menu'>
                    <i className="bi bi-list position-absolute top-50 start-50 translate-middle text-white fs-1"></i>
                </button>
            </ul>
        </footer>
    );
}
