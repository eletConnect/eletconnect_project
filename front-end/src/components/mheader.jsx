import React from 'react';
import { Link } from 'react-router-dom';

import logo from '../assets/images/mobile/Escola logo.png';

export default function MHeader() {
    return (
        <header id='mheader'>
            <div className='header-content d-flex justify-content-between align-items-center w-100'>
                <Link to={'/m/home'} className='logo d-flex align-items-center gap-2 text-black'>
                    <img width={40} src={logo} alt='Logo CEM 03 TAGUATINGA' />
                    <p className='m-0 fw-bold'>CEM 03 TAGUATINGA</p>
                </Link>
                <div className="dropdown">
                    <i className="bi bi-three-dots-vertical fs-4 btn" data-bs-toggle="dropdown" aria-label="More options"></i>
                    <ul className="dropdown-menu">
                        <li><a className="dropdown-item" href="#">Action</a></li>
                        <li><a className="dropdown-item" href="#">Another action</a></li>
                        <li><a className="dropdown-item" href="#">Something else here</a></li>
                    </ul>
                </div>
            </div>
        </header>
    );
}