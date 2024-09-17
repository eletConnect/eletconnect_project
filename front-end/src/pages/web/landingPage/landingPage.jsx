import React from 'react';
import { isMobile } from 'react-device-detect';

import "./landingPage.css";
import logo from '../../../assets/images/logo/azul.png';
import imgSelect from '../../../assets/images/Digital transformation-cuate.png';

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
                                <a className="nav-link text-black" href="#solucoes"><p className='m-0'>SOLUÇÕES</p></a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link text-black" href="#clientes"><p className='m-0'>CLIENTES</p></a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link text-black" href="#contato"><p className='m-0'>CONTATO</p></a>
                            </li>
                        </ul>
                        <a className="btn btn-primary" href={isMobile ? "/m/login" : "/login"}>
                            <i className="bi bi-person-fill"></i>
                        </a>
                    </div>
                </div>
            </nav>
            <main>
                <section id='painel' className='container-fluid'>
                    <div id='painel-text' className="row text-white">
                        <div className="col-md-6">
                            <h1 className="fw-bold">Conecte-se com seus clientes de forma eficiente!</h1>
                            <p className="fs-5">A eletConnect é uma plataforma de atendimento ao cliente que utiliza inteligência artificial para automatizar o atendimento e proporcionar uma experiência incrível para seus clientes.</p>
                            <a className="btn btn-primary" href={isMobile ? "/m/login" : "/login"}>Começar</a>
                        </div>
                        <div className="col-md-6 text-center robot">
                            <img className='' src={imgSelect} width={400} alt="Imagem de seleção" />
                        </div>
                    </div>
                </section>
                <section id='solucoes' className='container-fluid bg-body-tertiary'>
                    <div className="painel d-flex align-items-center text-center gap-4 p-4">
                        <div id='txt1' className="w-25">
                            <h3 className="fw-bold mt-2">Atendimento 24/7</h3>
                            <p className="fs-5">Atenda seus clientes a qualquer hora do dia, todos os dias da semana.</p>
                        </div>
                        <div id='txt1' className="w-25">
                            <h3 className="fw-bold mt-2">Inteligência Artificial</h3>
                            <p className="fs-5">Utilize chatbots para automatizar o atendimento e fornecer respostas rápidas.</p>
                        </div>
                        <div id='txt1' className="w-25">
                            <h3 className="fw-bold mt-2">Personalização</h3>
                            <p className="fs-5">Personalize o atendimento de acordo com as necessidades do seu cliente.</p>
                        </div>
                        <div id='txt1' className='w-25'>
                            <h3 className="fw-bold mt-2">Relatórios</h3>
                            <p className="fs-5">Acompanhe o desempenho do seu atendimento e tome decisões baseadas em dados.</p>
                        </div>
                    </div>
                </section>
                <section id='clientes' className='container-fluid'>
                    <h2 className='m-0 fw-bold text-primary'>| CLIENTES</h2>
                    <h4 className='m-0'>Nosso maior orgulho</h4>
                    <div className='mt-4'>
                        <ul>
                            <li>
                                <h1 className='m-0'>CEM 03 TAGUATINGA</h1>
                            </li>
                        </ul>
                    </div>
                </section>
            </main>
        </>
    );
}
