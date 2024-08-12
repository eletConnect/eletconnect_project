import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../../../components/header';
import showToast from '../../../utills/toasts';

export default function Eletiva() {
    const [sortBy, setSortBy] = useState({ column: '', asc: true });
    const [filterText, setFilterText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const user = JSON.parse(sessionStorage.getItem('user'));

    const [data, setData] = useState([]);
    const [codigo, setCodigo] = useState('');
    const [nome, setNome] = useState('');
    const [tipo, setTipo] = useState('');
    const [professor, setProfessor] = useState('');
    const [totalAlunos, setTotalAlunos] = useState('');
    const [status, setStatus] = useState('');

    const [codigoParaEditar, setCodigoParaEditar] = useState('');
    const [nomeParaEditar, setNomeParaEditar] = useState('');

    useEffect(() => {
        listarEletivas();
    }, []);

    const toggleSort = (coluna) => {
        if (sortBy.column === coluna) {
            setSortBy({ ...sortBy, asc: !sortBy.asc });
        } else {
            setSortBy({ column: coluna, asc: true });
        }
        setCurrentPage(1);
    };

    const compareValues = (a, b, asc) => {
        const aValue = a[sortBy.column] || '';
        const bValue = b[sortBy.column] || '';

        if (isNumeric(aValue) && isNumeric(bValue)) {
            return asc ? aValue - bValue : bValue - aValue;
        } else {
            return asc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
    };

    const isNumeric = (value) => !isNaN(value) && !isNaN(parseFloat(value));

    const filteredAndSortedData = data.slice()
        .filter((item) =>
            item.nome.toLowerCase().includes(filterText.toLowerCase()) ||
            item.professor.toLowerCase().includes(filterText.toLowerCase()) ||
            item.tipo.toLowerCase().includes(filterText.toLowerCase())
        ).sort((a, b) => compareValues(a, b, sortBy.asc));

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

    const listarEletivas = async () => {
        try {
            const response = await axios.post('http://localhost:3001/eletivas/listar', { instituicao: user.instituicao });
            if (response.status === 200) {
                setData(response.data);
            }
        } catch (error) {
            console.error('Erro ao listar as eletivas', error);
            showToast('danger', error.response ? error.response.data.mensagem : 'Erro ao listar as eletivas');
        }
    };

    const cadastrarEletiva = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:3001/eletivas/cadastrar', {
                instituicao: user.instituicao, nome, tipo, professor, total_alunos: totalAlunos, status
            });
            if (response.status === 201) {
                listarEletivas();
                showToast('success', 'Eletiva cadastrada com sucesso.');
            }
        } catch (error) {
            console.error('Erro ao cadastrar a eletiva', error);
            showToast('danger', error.response ? error.response.data.mensagem : 'Erro ao cadastrar a eletiva');
        }
    };

    const excluirEletiva = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:3001/eletivas/excluir', { codigo: codigoParaEditar, instituicao: user.instituicao });
            if (response.status === 200) {
                listarEletivas();
                showToast('success', 'Eletiva excluída com sucesso.');
            }
        } catch (error) {
            console.error('Erro ao excluir a eletiva', error);
            showToast('danger', error.response ? error.response.data.mensagem : 'Erro ao excluir a eletiva');
        }
    };

    return (
        <>
            <div id='toast-container' className="toast-container position-fixed bottom-0 end-0 p-3"></div>
            <Header />
            <section id='section'>
                <div className="box">
                    <div className="title d-flex justify-content-between align-items-center">
                        <span className='d-flex align-items-center gap-2 text-black'>
                            <i className="bi bi-journal-bookmark-fill fs-3"></i>
                            <h3 className='m-0 fs-4'>Eletivas</h3>
                        </span>
                        <button className='btn btn-outline-secondary' data-bs-toggle="modal" data-bs-target="#cadastrarEletiva">
                            <i className="bi bi-file-earmark-plus me-2"></i>Cadastrar
                        </button>
                    </div>
                    <div className="p-4">
                        <div className="d-flex justify-content-between">
                            <span></span>
                            <form className="position-relative">
                                <input type="text" className="form-control" placeholder="Filtrar eletiva..." onChange={handleInputChange} />
                                <i className="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3"></i>
                            </form>
                        </div>
                        <div className='table-responsive'>
                            <table className='table table-striped table-hover align-middle'>
                                <thead>
                                    <tr>
                                        {['nome', 'tipo'].map((coluna) => (
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
                                        <th>Professor</th>
                                        <th>Total alunos</th>
                                        <th>Status</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedData.length > 0 ? paginatedData.map((item, index) => (
                                        <tr key={index}>
                                            <td className='d-none'>{item.codigo}</td>
                                            <td><p className='m-0'>{item.nome}</p></td>
                                            <td><p className='m-0'>{item.tipo}</p></td>
                                            <td><p className='m-0'>{item.professor}</p></td>
                                            <td><p className='m-0'>{item.total_alunos}</p></td>
                                            <td><p className='m-0'>{item.status}</p></td>
                                            <td className='text-end'>
                                                <div className="d-flex align-items-center justify-content-end gap-3">
                                                    <button className='btn btn-sm btn-success d-flex align-items-center gap-2' data-bs-toggle="modal" data-bs-target="#editarEletiva" onClick={() => { setCodigoParaEditar(item.codigo); }} >
                                                        <i className="bi bi-pencil-fill"></i>
                                                        <p className='m-0 d-lg-block d-none'>Editar</p>
                                                    </button>
                                                    <button className='btn btn-sm btn-secondary d-flex align-items-center gap-2' data-bs-toggle="modal" data-bs-target="#excluirEletiva" onClick={() => { setCodigoParaEditar(item.codigo); setNomeParaEditar(item.nome); }} >
                                                        <i className="bi bi-gear-fill"></i>
                                                        <p className='m-0 d-lg-block d-none'>Gerenciar</p>
                                                    </button>
                                                    <button className='btn btn-sm btn-danger d-flex align-items-center gap-2' data-bs-toggle="modal" data-bs-target="#excluirEletiva" onClick={() => { setCodigoParaEditar(item.codigo); setNomeParaEditar(item.nome); }} >
                                                        <i className="bi bi-trash3-fill"></i>
                                                        <p className='m-0 d-lg-block d-none'>Excluir</p>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" className='text-center'>
                                                Nenhuma eletiva cadastrada.
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

            {/* Modal: Cadastrar Eletiva */}
            <div className="modal fade" id="cadastrarEletiva" tabIndex="-1" aria-labelledby="cadastrarEletivaLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className='d-flex align-items-center gap-2'>
                                    <i className="bi bi-journal-bookmark-fill fs-3"></i>
                                    <h4 className='m-0 fs-4'>Eletivas</h4>
                                </span>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Cadastrar eletiva</h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form onSubmit={cadastrarEletiva}>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label htmlFor="nome" className="form-label">Nome <a className='text-danger'>*</a></label>
                                    <input type="text" className="form-control" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="tipo" className="form-label">Tipo <a className='text-danger'>*</a></label>
                                    <input type="text" className="form-control" id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="professor" className="form-label">Professor <a className='text-danger'>*</a></label>
                                    <input type="text" className="form-control" id="professor" value={professor} onChange={(e) => setProfessor(e.target.value)} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="totalAlunos" className="form-label">Total de alunos <a className='text-danger'>*</a></label>
                                    <input type="text" className="form-control" id="totalAlunos" value={totalAlunos} onChange={(e) => setTotalAlunos(e.target.value)} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type='submit' className='btn btn-primary'>Cadastrar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Modal: Editar Eletiva */}
            <div className="modal fade" id="editarEletiva" tabIndex="-1" aria-labelledby="editarEletivaLabel" aria-hidden="true">
                <div className="modal-dialog modal-xl">
                    <div className="modal-content">
                        <div className="modal-header">
                        <div className="d-flex align-items-center gap-2">
                                <span className='d-flex align-items-center gap-2'>
                                    <i className="bi bi-journal-bookmark-fill fs-3"></i>
                                    <h4 className='m-0 fs-4'>Eletivas</h4>
                                </span>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Editar eletiva</h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <iframe id='editarEletivaFrame' src={`http://localhost:5173/electives/edit?codigo=${codigoParaEditar}`} width="100%" height="500px"></iframe>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Excluir Eletiva */}
            <div className="modal fade" id="excluirEletiva" tabIndex="-1" aria-labelledby="excluirEletivaLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className='d-flex align-items-center gap-2'>
                                    <i className="bi bi-journal-bookmark-fill fs-3"></i>
                                    <h4 className='m-0 fs-4'>Eletivas</h4>
                                </span>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Excluir eletiva</h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form onSubmit={excluirEletiva}>
                            <div className="modal-body">
                                <p>Tem certeza que deseja excluir a eletiva <strong>{nomeParaEditar}</strong>?</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type='submit' className='btn btn-danger'>Excluir</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};
