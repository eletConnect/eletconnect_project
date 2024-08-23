import React from 'react';
import { Link } from 'react-router-dom';
import { isMobile } from 'react-device-detect';

import "./landingPage.css";
import logo from '../../../assets/images/logo/azul.png';
import imgSelect from '../../../assets/images/Chat bot-pana.png';

export default function LandingPage() {
    return (
        <>
            <nav className="navbar fixed-top bg-body-tertiary">
                <div id='navbar-menu' className="d-flex justify-content-between w-100">
                    <div id='menu-logo' className="d-flex align-items-center gap-2">
                        <img width={40} src={logo} alt="logo" />
                        <h2 className='m-0 fw-bold'>eletConnect</h2>
                    </div>
                    <div id='menu-itens' className="d-flex align-items-center">
                        <ul id='menu-ul' className="nav fw-bold">
                            <li className="nav-item">
                                <Link className="nav-link text-black" to=""><p className='m-0'>SOLUÇÕES</p></Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link text-black" to=""><p className='m-0'>CLIENTES</p></Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link text-black" to=""><p className='m-0'>CONTATO</p></Link>
                            </li>
                        </ul>
                        <Link className="btn btn-primary" to={isMobile ? "/m/login" : "/login"}><i className="bi bi-person-fill"></i></Link>
                    </div>
                </div>
            </nav>
            <main>
                <section id='painel' className='container-fluid'>
                    <div id='painel-text' className="row text-white">
                        <div className="col-md-6">
                            <h1 className="fw-bold">Conecte-se com seus clientes de forma eficiente!</h1>
                            <p className="fs-5">A eletConnect é uma plataforma de atendimento ao cliente que utiliza inteligência artificial para automatizar o atendimento e proporcionar uma experiência incrível para seus clientes.</p>
                            <Link className="btn btn-primary" to={isMobile ? "/m/login" : "/login"}>Começar</Link>
                        </div>
                        <div className="col-md-6 text-center robot">
                            <img className='efeito-flutuante-infinito' src={imgSelect} width={350} alt="Imagem de seleção" />
                        </div>
                    </div>
                </section>
                <section id='solucoes' className='container-fluid bg-body-tertiary'>
                    <div className="row text-center" style={{ padding: '4em' }}>
                        <div className="col-md-4">
                            <h2 className="fw-bold">Atendimento 24/7</h2>
                            <p className="fs-5">Atenda seus clientes a qualquer hora do dia, todos os dias da semana.</p>
                        </div>
                        <div className="col-md-4">
                            <h2 className="fw-bold">Inteligência Artificial</h2>
                            <p className="fs-5">Utilize a inteligência artificial para automatizar o atendimento e proporcionar uma experiência incrível para seus clientes.</p>
                        </div>
                        <div className="col-md-4">
                            <h2 className="fw-bold">Integração</h2>
                            <p className="fs-5">Integre a eletConnect com outras plataformas para otimizar o atendimento ao cliente.</p>
                        </div>
                    </div>
                </section>
                <section id='clientes' className='container-fluid' style={{ padding: '3em 6em' }}>
                    <div>
                        <h2 className='m-0 fw-bold text-primary'>CLIENTES</h2>
                        <h4 className='m-0'>Nosso maior orgulho</h4>
                    </div>
                    <div className='mt-4'>
                        <ul>
                            <li>
                                <h1>CEM 03 TAGUATINGA</h1>
                            </li>
                        </ul>
                    </div>
                </section>
            </main>
        </>
    );
}
