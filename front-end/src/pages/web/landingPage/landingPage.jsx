import React, { useState } from 'react';
import { isMobile } from 'react-device-detect';
import emailjs from '@emailjs/browser';

import "./landingPage.css";
import logo from '../../../assets/images/logo/azul.png';
import imgSelect from '../../../assets/images/Digital transformation-cuate.png';

export default function LandingPage() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [mensagem, setMensagem] = useState('');

    // Função para enviar o email via EmailJS
    const enviarEmail = (e) => {
        e.preventDefault();

        const templateParams = {
            from_name: nome,
            from_email: email,
            message: mensagem,
        };

        emailjs.send('service_penom2m', 'template_gp9c4bv', templateParams, 'sFI71YOCUv276jh3s')
            .then((response) => {
                alert('Mensagem enviada com sucesso!');
                // Limpa o formulário
                setNome('');
                setEmail('');
                setMensagem('');
            })
            .catch((error) => {
                alert('Erro ao enviar mensagem. Tente novamente mais tarde.');
            });
    };

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
                                <button className="nav-link text-black " data-bs-toggle="modal" data-bs-target="#contato"><p className='m-0'>CONTATO</p></button>
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

            {/* Modal de contato */}
            <div className="modal fade" id="contato" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">Formulário de Contato</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <form id="formContato" onSubmit={enviarEmail}>
                                <div className="mb-3">
                                    <label htmlFor="nome" className="form-label">Nome</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="nome"
                                        placeholder="Seu nome"
                                        value={nome}
                                        onChange={(e) => setNome(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        placeholder="seuemail@exemplo.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="mensagem" className="form-label">Mensagem</label>
                                    <textarea
                                        className="form-control"
                                        id="mensagem"
                                        rows="3"
                                        placeholder="Sua mensagem"
                                        value={mensagem}
                                        onChange={(e) => setMensagem(e.target.value)}
                                        required
                                    />
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                            <button type="submit" form="formContato" className="btn btn-primary">Enviar</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
