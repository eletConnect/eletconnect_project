import React from "react";
import { Link } from "react-router-dom";
import Header from "../../../components/header";

export default function Settings() {
    const itemConfigs = [
        { link: '/settings/profile', nome: 'Perfil', icon: 'bi bi-person-badge', modalId: 'modalProfile' },
        { link: '/settings/security', nome: 'Segurança', icon: 'bi bi-shield-lock', modalId: 'modalSecurity' },
        { link: '/settings/institution/edit', nome: 'Instituição', icon: 'bi bi-house-gear', modalId: 'modalInstitution' },
        { link: '/settings/permissions', nome: 'Permissões', icon: 'bi bi-key', modalId: 'modalPermissions' },
        { link: '/settings/collaborators', nome: 'Colaboradores', icon: 'bi bi-people', modalId: 'modalCollaborators' },
    ];

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
                                        <Link to={config.link} data-bs-toggle="modal" data-bs-target={`#${config.modalId}`}>
                                            <div className="card border-dark" style={{ width: '10rem' }}>
                                                <div className="card-body text-center">
                                                    <i className={config.icon} style={{ fontSize: '4em' }}></i>
                                                    <p className="card-text fw-bold">{config.nome}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    )}
                                    {config.nome !== 'Colaboradores' && (
                                        <Modal id={config.modalId} title={config.nome} link={config.link} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

const Modal = ({ id, title, link }) => (
    <div className="modal fade" id={id} tabIndex="-1">
        <div className="modal-dialog modal-xl">
            <div className="modal-content">
                <div className="modal-header">
                    <div className="d-flex align-items-center gap-2">
                        <span className='d-flex align-items-center gap-2'>
                            <i className="bi bi-gear-fill fs-3"></i>
                            <h3 className='m-0 fs-4'>Configurações</h3>
                        </span>
                        <i className="bi bi-arrow-right-short fs-4"></i>
                        <h4 className="m-0">{title}</h4>
                    </div>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                    <iframe src={`http://localhost:5173${link}`} style={{ width: '100%', height: '50vh' }}></iframe>
                </div>
            </div>
        </div>
    </div>
);
