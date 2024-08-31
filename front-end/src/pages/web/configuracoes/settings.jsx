import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../components/header";

// Importa os componentes que serão exibidos nos modais
import EditarPerfil from "./componentes/perfil/perfil";
import EditarSenha from "../auth/changePassword";
import EditarInstituicao from "./componentes/instituicao/editarInstituicao";
import Permissoes from "./componentes/permissoes/permissoes";

export default function Settings() {
    const [modalContent, setModalContent] = useState(null);
    const [modalTitle, setModalTitle] = useState(''); // Adicionado para armazenar o título do modal

    const itemConfigs = [
        { link: '/settings/profile', nome: 'Perfil', icon: 'bi bi-person-badge', component: <EditarPerfil /> },
        { link: '/settings/security', nome: 'Segurança', icon: 'bi bi-shield-lock', component: <EditarSenha /> },
        { link: '/settings/institution/edit', nome: 'Instituição', icon: 'bi bi-house-gear', component: <EditarInstituicao /> },
        { link: '/settings/permissions', nome: 'Permissões', icon: 'bi bi-key', component: <Permissoes /> },
        { link: '/settings/collaborators', nome: 'Colaboradores', icon: 'bi bi-people' }, // Este item não abre modal
    ];

    const handleModalContent = (component, title) => {
        setModalContent(component);
        setModalTitle(title); // Atualiza o título do modal com base no item selecionado
    };

    return (
        <>
            <div id='toast-container' className="toast-container position-fixed bottom-0 end-0 p-3"></div>
            <Header />
            <section id='section'>
                <div className="box">
                    <div className="title">
                        <Link to={'/settings'} className='d-flex align-items-center gap-2 text-black'>
                            <i className="bi bi-gear-fill fs-3"></i>
                            <h3 className='m-0 fs-4'>Configurações</h3>
                        </Link>
                    </div>
                    <div className="mid-box">
                        <div className="d-flex flex-wrap justify-content-center align-items-center gap-5" style={{ height: '100%' }}>
                            {itemConfigs.map((config, index) => (
                                <div key={index}>
                                    {config.nome === 'Colaboradores' ? (
                                        <Link to={config.link}>
                                            <div className="card border-dark" style={{ width: '10rem' }}>
                                                <div className="card-body text-center">
                                                    <i className={config.icon} style={{ fontSize: '4em' }}></i>
                                                    <p className="card-text fw-bold">{config.nome}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ) : (
                                        <div>
                                            <button
                                                type="button"
                                                className="btn p-0"
                                                data-bs-toggle="modal"
                                                data-bs-target="#configModal"
                                                onClick={() => handleModalContent(config.component, config.nome)}
                                            >
                                                <div className="card border-dark" style={{ width: '10rem' }}>
                                                    <div className="card-body text-center">
                                                        <i className={config.icon} style={{ fontSize: '4em' }}></i>
                                                        <p className="card-text fw-bold">{config.nome}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <Modal content={modalContent} title={modalTitle} />
        </>
    );
}

const Modal = ({ content, title }) => (
    <div className="modal fade" id="configModal" tabIndex="-1">
        <div className="modal-dialog modal-xl">
            <div className="modal-content">
                <div className="modal-header">
                    <div className="d-flex align-items-center gap-2">
                        <span className='d-flex align-items-center gap-2'>
                            <i className="bi bi-gear-fill fs-3"></i>
                            <h3 className='m-0 fs-4'>Configurações</h3>
                        </span>
                        <i className="bi bi-arrow-right-short fs-4"></i>
                        <h4 className='m-0 fs-4'>{title}</h4> 
                    </div>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                    {content}
                </div>
            </div>
        </div>
    </div>
);
