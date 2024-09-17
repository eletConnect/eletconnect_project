import React, { useState, useEffect } from 'react';
import axios from '../../../../configs/axios';
import Header from '../../../../components/header';
import showToast from '../../../../utills/toasts';
import EditarColaborador from './editarColaborador'; // Importa a página de edição do colaborador

export default function Colaboradores() {
    const [sortBy, setSortBy] = useState({ column: '', asc: true });
    const [filterText, setFilterText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [data, setData] = useState([]);
    const [dadosColaborador, setDadosColaborador] = useState({
        matricula: '',
        nome: '',
        email: '',
        cargo: '',
        status: 'Aguardando'
    });
    const [matriculaParaEditar, setMatriculaParaEditar] = useState('');
    const [matriculaParaExcluir, setMatriculaParaExcluir] = useState('');
    const [nomeParaExcluir, setNomeParaExcluir] = useState('');
    const [carregando, setCarregando] = useState(false);
    const user = JSON.parse(sessionStorage.getItem('user'));
    const escola = JSON.parse(sessionStorage.getItem('escola'));

    useEffect(() => {
        listarColaboradores();
    }, []);

    const toggleSort = (coluna) => {
        if (sortBy.column === coluna) {
            setSortBy({ ...sortBy, asc: !sortBy.asc });
        } else {
            setSortBy({ column: coluna, asc: true });
        }
        setCurrentPage(1);
    };

    const isNumeric = (value) => !isNaN(value) && !isNaN(parseFloat(value));

    const compareValues = (a, b, asc) => {
        const aValue = a[sortBy.column] || '';
        const bValue = b[sortBy.column] || '';

        if (isNumeric(aValue) && isNumeric(bValue)) {
            return asc ? aValue - bValue : bValue - aValue;
        } else {
            return asc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
    };

    const filteredAndSortedData = Array.isArray(data)
        ? data
            .filter((item) =>
                [item.nome, item.matricula, item.cargo]
                    .map((val) => val.toLowerCase())
                    .some((val) => val.includes(filterText.toLowerCase()))
            )
            .sort((a, b) => compareValues(a, b, sortBy.asc))
        : [];

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
    const endIndex = Math.min(startIndex + itemsPerPage, filteredAndSortedData.length);

    const handleInputChange = (e) => {
        setFilterText(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const listarColaboradores = async () => {
        setCarregando(true);
        try {
            const response = await axios.post('/colaboradores/listar', { instituicao: escola.cnpj });
            if (response.status === 200) {
                setData(response.data.colaboradoresData);
            } else {
                throw new Error('Erro ao buscar colaboradores.');
            }
        } catch (error) {
            showToast('danger', 'Erro ao listar os colaboradores');
            setData([]);
        } finally {
            setCarregando(false);
        }
    };

    const cadastrarColaborador = async (e) => {
        e.preventDefault();
        setCarregando(true);
        try {
            const response = await axios.post('/colaboradores/cadastrar', { ...dadosColaborador, instituicao: escola.cnpj });
            if (response.status === 200) {
                e.target.reset();
                showToast('success', `O colaborador <b>${dadosColaborador.nome}</b> foi cadastrado com sucesso`);
                setTimeout(() => { listarColaboradores(); }, 1000);
            } else {
                throw new Error('Erro ao cadastrar colaborador.');
            }
        } catch (error) {
            showToast('danger', 'Erro ao cadastrar o colaborador');
        } finally {
            setCarregando(false);
        }
    };

    const excluirColaborador = async (e) => {
        e.preventDefault();
        setCarregando(true);
        try {
            const response = await axios.post('/colaboradores/excluir', { matricula: matriculaParaExcluir, instituicao: escola.cnpj });
            if (response.status === 200) {
                showToast('success', `O colaborador <b>${dadosColaborador.nome}</b> foi excluído com sucesso`);
                setTimeout(() => { listarColaboradores(); }, 1000);
            } else {
                throw new Error('Erro ao excluir colaborador.');
            }
        } catch (error) {
            showToast('danger', 'Erro ao excluir o colaborador');
        } finally {
            setCarregando(false);
        }
    };

    const renderStatusIcon = (status) => {
        switch (status) {
            case 'Ativo':
                return <small><i className="bi bi-1-square" title='Status da conta: Ativa'></i></small>;
            case 'Inativo':
                return <small><i className="bi bi-0-square" title='Status da conta: Inativa'></i></small>;
            case 'Aguardando':
                return <small><i className="bi bi-question-square" title='Aguardando confirmação...'></i></small>;
            default:
                return null;
        }
    };

    return (
        <>
            <div id='toast-container' className="toast-container position-fixed bottom-0 end-0 p-3"></div>
            <Header />
            <section id='section'>
                <div className="box">
                    <div className="title d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                            <span className='d-flex align-items-center gap-2'>
                                <i className="bi bi-gear-fill fs-3"></i>
                                <h3 className='m-0 fs-4'>Configurações</h3>
                            </span>
                            <i className="bi bi-arrow-right-short fs-4"></i>
                            <h4 className="m-0">Colaboradores</h4>
                        </div>
                        {!carregando && (
                            <button className='btn btn-outline-secondary' data-bs-toggle="modal" data-bs-target="#cadastrarColaborador">
                                <i className="bi bi-person-add"></i>&ensp;Cadastrar
                            </button>
                        )}
                    </div>
                    <div className="p-4">
                        {carregando ? (
                            <div className="d-flex justify-content-center pt-4">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Carregando...</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="d-flex justify-content-end">
                                    <div className="w-50 ms-auto mb-2">
                                        <form className="position-relative">
                                            <input type="text" className="form-control" placeholder="Buscar colaborador... (Matricula ou Nome)" onChange={handleInputChange} />
                                            <i className="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3"></i>
                                        </form>
                                    </div>
                                </div>
                                <div className='table-responsive'>
                                    <table className='table table-striped table-hover align-middle'>
                                        <thead>
                                            <tr>
                                                {['matricula', 'nome', 'cargo'].map((coluna) => (
                                                    <th key={coluna} onClick={() => toggleSort(coluna)} style={{ cursor: 'pointer' }}>
                                                        <span className='d-flex align-items-center gap-2'>
                                                            {sortBy.column === coluna ? (
                                                                <i className={`bi bi-arrow-${sortBy.asc ? 'down' : 'up'}`}></i>
                                                            ) : (
                                                                <i className="bi bi-arrow-down-up"></i>
                                                            )}
                                                            <p className='m-0'>{coluna.charAt(0).toUpperCase() + coluna.slice(1)}</p>
                                                        </span>
                                                    </th>
                                                ))}
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedData.length > 0 ? (
                                                paginatedData.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{item.matricula}</td>
                                                        <td>
                                                            {renderStatusIcon(item.status)}&emsp;
                                                            {item.nome}&emsp;
                                                            {item.matricula === user.matricula && (<i className="bi bi-star-fill text-warning"></i>)}
                                                        </td>
                                                        <td>{item.cargo}</td>
                                                        <td className='text-end'>
                                                            <div className="d-flex align-items-center justify-content-end gap-2">
                                                                <button className='btn btn-sm btn-success d-flex align-items-center' data-bs-toggle="modal" data-bs-target="#editarColaborador" onClick={() => setMatriculaParaEditar(item.matricula)} >
                                                                    <i className="bi bi-pencil"></i>&ensp;Editar
                                                                </button>
                                                                <button className='btn btn-sm btn-danger d-flex align-items-center' data-bs-toggle="modal" data-bs-target="#excluirColaborador" onClick={() => { setMatriculaParaExcluir(item.matricula); setNomeParaExcluir(item.nome); }} disabled={item.matricula === user.matricula}>
                                                                    <i className="bi bi-trash3-fill"></i>&ensp;Excluir
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className='text-center'>
                                                        Nenhum colaborador encontrado.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <p>Mostrando {startIndex + 1} até {endIndex} de {filteredAndSortedData.length} resultados</p>
                                    <ul className="pagination">
                                        {Array.from({ length: Math.ceil(filteredAndSortedData.length / itemsPerPage) }, (_, i) => i + 1).map((pageNumber) => (
                                            <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                                                <button className="page-link" onClick={() => handlePageChange(pageNumber)}>
                                                    {pageNumber}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Modal: Cadastrar Colaborador */}
            <div className="modal fade" id="cadastrarColaborador" tabIndex="-1" aria-labelledby="cadastrarColaboradorLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className='d-flex align-items-center gap-2'>
                                    <i className="bi bi-people-fill fs-3"></i>
                                    <h4 className='m-0 fs-4'>Colaboradores</h4>
                                </span>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Cadastrar</h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form onSubmit={cadastrarColaborador}>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label htmlFor="matricula" className="form-label">Matrícula <span className='text-danger'>*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="matricula"
                                        value={dadosColaborador.matricula}
                                        onChange={(e) => setDadosColaborador({ ...dadosColaborador, matricula: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="nome" className="form-label">Nome <span className='text-danger'>*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="nome"
                                        value={dadosColaborador.nome}
                                        onChange={(e) => setDadosColaborador({ ...dadosColaborador, nome: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="cargo" className="form-label">Cargo <span className="text-danger">*</span></label>
                                    <select
                                        className="form-select"
                                        id="cargo"
                                        value={dadosColaborador.cargo}
                                        onChange={(e) => setDadosColaborador({ ...dadosColaborador, cargo: e.target.value })}
                                        required
                                    >
                                        <option value="" disabled>Selecione...</option>
                                        <option value="Diretor">Diretor</option>
                                        <option value="Coordenador">Coordenador</option>
                                        <option value="Professor">Professor</option>
                                        <option value="Colaborador">Colaborador</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">E-mail</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        value={dadosColaborador.email}
                                        onChange={(e) => setDadosColaborador({ ...dadosColaborador, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type='submit' className='btn btn-primary' data-bs-dismiss="modal">
                                    <i className="bi bi-person-add"></i>&ensp;Cadastrar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Modal: Editar Colaborador */}
            <div className="modal fade" id="editarColaborador" tabIndex="-1" aria-labelledby="editarColaboradorLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className='d-flex align-items-center gap-2'>
                                    <i className="bi bi-people-fill fs-3"></i>
                                    <h4 className='m-0 fs-4'>Colaboradores</h4>
                                </span>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Editar</h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <EditarColaborador matricula={matriculaParaEditar} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Excluir Colaborador */}
            <div className="modal fade" id="excluirColaborador" tabIndex="-1" aria-labelledby="excluirColaboradorLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className='d-flex align-items-center gap-2'>
                                    <i className="bi bi-people-fill fs-3"></i>
                                    <h4 className='m-0 fs-4'>Colaboradores</h4>
                                </span>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Excluir</h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <p>Você está prestes a excluir todos os dados do(a) colaborador(a) <b>{nomeParaExcluir}</b> , com matrícula <b>{matriculaParaExcluir}</b>. Esta ação não pode ser desfeita. Deseja prosseguir?</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" className="btn btn-danger" onClick={excluirColaborador} data-bs-dismiss="modal">
                                <i className="bi bi-trash3-fill"></i>&ensp;Excluir
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
