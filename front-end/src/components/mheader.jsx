import React from 'react';
import { Link } from 'react-router-dom';

import logo from '../assets/images/mobile/Escola logo.png';

export default function MHeader() {
    const logout = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/m/auth/logout', { withCredentials: true });
            if (response.status === 200) {
                sessionStorage.clear();
                window.location.href = '/m/login';
            }
        } catch (error) {
            console.error('Erro ao deslogar:', error);
            window.location.href = '/m/login';
        }
    };

    return (
        <header id='mheader'>
            <div className='header-content d-flex justify-content-between align-items-center w-100'>
                <Link to={'/m/home'} className='logo d-flex align-items-center gap-2 text-black'>
                    <img width={50} src={logo} alt='Logo CEM 03 TAGUATINGA' />
                    <p className='m-0 fw-bold text-white'>CEM 03 TAGUATINGA</p>
                </Link>
                <div className="dropdown">
                    <img width={50} src='https://www.gov.br/cdn/sso-status-bar/src/image/user.png' alt='Foto de perfil' className='rounded-circle' data-bs-toggle="dropdown" />
                    <ul className="dropdown-menu">
                        <li><a className="dropdown-item" onClick={logout}><i className="bi bi-door-open"></i> Deslogar</a></li>
                    </ul>
                </div>
            </div>
        </header>
    );
}