import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
axios.defaults.withCredentials = true;

import logo from '../assets/images/logo/azul.png';

export default function Header() {
    const location = useLocation();
    const user = JSON.parse(sessionStorage.getItem('user'));
    const escola = JSON.parse(sessionStorage.getItem('escola'));

    useEffect(() => {
        if (!user || !escola) {
            window.location.href = '/verification';
            console.log('Usuário não autenticado');
        } 
    }, []);

    // Função para fazer logout do usuário
    const logout = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/auth/logout', { withCredentials: true });
            if (response.status === 200) {
                sessionStorage.clear();
                window.location.href = '/login';
            }
        } catch (error) {
            console.error('Erro ao deslogar:', error);
        }
    };

    const menuItems = [
        { path: '/home', label: 'Início', icon: 'bi bi-bookmark-fill' },
        { path: '/students', label: 'Estudantes', icon: 'bi bi-person-arms-up' },
        { path: '/electives', label: 'Eletivas', icon: 'bi bi-journal-bookmark-fill' },
        { path: '/settings', label: 'Configurações', icon: 'bi bi-gear-fill' }
    ];

    return (
        <header id='header'>
            <div id='header-head' className='header-head'>
                <Link to={'/home'} className='logo-details gap-2 text-black  '>
                    <img width={40} src={logo} alt='' />
                    <h1>eletConnect</h1>
                </Link>
                <div className="d-flex">
                    <img className='image-school' width={50} src={escola?.logotipo || ""} alt="" />
                    <div className="profile-details">
                        <img src={user?.avatar || "https://contas.acesso.gov.br/cdn/images/user-avatar.png"} alt="" />
                        <span className="admin_name">{user?.nome || ""}</span>
                    </div>
                </div>
            </div>
            <nav id='header-nav'>
                <ul>
                    {menuItems.map((item) => (
                        <li key={item.path} className={location.pathname === item.path ? 'active' : ''}>
                            <Link to={item.path}>
                                <i className={item.icon}></i>
                                <span>{item.label}</span>
                            </Link>
                        </li>
                    ))}
                    <li className="log_out" onClick={logout}>
                        <Link>
                            <i className="bi bi-box-arrow-left"></i>
                            <span>Deslogar</span>
                        </Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
}