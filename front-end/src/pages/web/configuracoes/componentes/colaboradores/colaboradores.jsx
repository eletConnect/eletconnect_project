import React, { useState, useEffect } from 'react';
import axios from '../../../../../configs/axios';
import Header from '../../../../../components/header';
import showToast from '../../../../../utills/toasts';

export default function Colaboradores() {
    const [sortBy, setSortBy] = useState({ column: '', asc: true });
    const [filterText, setFilterText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [data, setData] = useState([]);
    const [matricula, setMatricula] = useState('');
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [cargo, setCargo] = useState('');
    const [matriculaParaEditar, setMatriculaParaEditar] = useState('');
    const [nomeParaEditar, setNomeParaEditar] = useState('');

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

    const filteredAndSortedData = Array.isArray(data) ? data.slice()
        .filter((item) =>
            item.nome.toLowerCase().includes(filterText.toLowerCase()) ||
            item.matricula.toLowerCase().includes(filterText.toLowerCase()) ||
            item.cargo.toLowerCase().includes(filterText.toLowerCase())
        ).sort((a, b) => compareValues(a, b, sortBy.asc)) : [];

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
        try {
            const response = await axios.post('/colaboradores/listar', { instituicao: escola.id });
            setData(response.data.colaboradoresData || []);
        } catch (error) {
            showToast('Erro ao listar os colaboradores', 'error');
            setData([]); // Garantir que data seja um array mesmo após uma falha
        }
    }

    const cadastrarColaborador = async (e) => {
        e.preventDefault();

        try {
            await axios.post('/colaboradores/cadastrar', { matricula, nome, email, cargo, instituicao: escola.id });
            showToast('Colaborador cadastrado com sucesso', 'success');
            listarColaboradores();
        } catch (error) {
            showToast('Erro ao cadastrar o colaborador', 'error');
        }
    }

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
                        <button className='btn btn-outline-secondary' data-bs-toggle="modal" data-bs-target="#cadastrarColaborador">
                            <i className="bi bi-person-add me-2"></i>Cadastrar
                        </button>
                    </div>
                    <div className="p-4">
                        <div className="d-flex justify-content-between">
                            <span></span>
                            <form className="position-relative">
                                <input type="text" className="form-control" placeholder="Filtrar colaboradores..." onChange={handleInputChange} />
                                <i className="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3"></i>
                            </form>
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
                                    {paginatedData.length > 0 ? paginatedData.map((item, index) => (
                                        <tr key={index}>
                                            <td><p className='m-0 '>{item.matricula}</p></td>
                                            <td><p className='m-0'>{item.nome}</p></td>
                                            <td><p className='m-0'>{item.cargo}</p></td>
                                               <td className='text-end'>
                                                <div className="d-flex align-items-center justify-content-end gap-3">
                                                    <button className='btn btn-sm btn-primary d-flex align-items-center gap-2' data-bs-toggle="modal" data-bs-target="#redefinirSenha" onClick={() => { setMatriculaParaEditar(item.matricula); setNomeParaEditar(item.nome); }}>
                                                        <i className="bi bi-key-fill"></i>
                                                        <p className='m-0 d-lg-block d-none'>Redefinir Senha</p>
                                                    </button>
                                                    <button className='btn btn-sm btn-success d-flex align-items-center gap-2' data-bs-toggle="modal" data-bs-target="#editarColaborador" onClick={() => { setMatriculaParaEditar(item.matricula); }}>
                                                        <i className="bi bi-pencil"></i>
                                                        <p className='m-0 d-lg-block d-none'>Editar</p>
                                                    </button>
                                                    <button className='btn btn-sm btn-danger d-flex align-items-center gap-2' data-bs-toggle="modal" data-bs-target="#excluirColaborador" onClick={() => { setMatriculaParaEditar(item.matricula); setNomeParaEditar(item.nome); }} >
                                                        <i className="bi bi-trash3-fill"></i>
                                                        <p className='m-0 d-lg-block d-none'>Excluir</p>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
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
                                    <label htmlFor="matricula" className="form-label">Matrícula <a className='text-danger'>*</a></label>
                                    <input type="text" className="form-control" id="matricula" value={matricula} onChange={e => setMatricula(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="nome" className="form-label">Nome <a className='text-danger'>*</a></label>
                                    <input type="text" className="form-control" id="nome" value={nome} onChange={e => setNome(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="cargo" className="form-label">Cargo <a className='text-danger'>*</a></label>
                                    <input type="text" className="form-control" id="cargo" value={cargo} onChange={e => setCargo(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">E-mail</label>
                                    <input type="email" className="form-control" id="email" value={email} onChange={e => setEmail(e.target.value)} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type='submit' className='btn btn-primary' data-bs-dismiss="modal">Cadastrar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};
