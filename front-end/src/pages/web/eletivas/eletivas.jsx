import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../../../components/header';
import showToast from '../../../utills/toasts';

const Eletivas = () => {
    const [sortBy, setSortBy] = useState({ column: '', asc: true });
    const [filterText, setFilterText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [data, setData] = useState([]);

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

    const isNumeric = (value) => !isNaN(value) && !isNaN(parseFloat(value));

    const compareTurma = (a, b, asc) => {
        const parseTurma = (turma) => {
            const num = parseInt(turma.replace(/\D/g, ''), 10);
            const str = turma.replace(/\d/g, '');
            return { num, str };
        };

        const aValue = parseTurma(a[sortBy.column] || '');
        const bValue = parseTurma(b[sortBy.column] || '');

        if (aValue.num === bValue.num) {
            return asc ? aValue.str.localeCompare(bValue.str) : bValue.str.localeCompare(aValue.str);
        }
        return asc ? aValue.num - bValue.num : bValue.num - aValue.num;
    };

    const compareValues = (a, b, asc) => {
        if (sortBy.column === 'turma') {
            return compareTurma(a, b, asc);
        }

        const aValue = a[sortBy.column] || '';
        const bValue = b[sortBy.column] || '';

        if (isNumeric(aValue) && isNumeric(bValue)) {
            return asc ? aValue - bValue : bValue - aValue;
        } else {
            return asc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
    };

    const filteredAndSortedData = data.slice()
        .filter((item) =>
            item.nome.toLowerCase().includes(filterText.toLowerCase()) ||
            item.matricula.toLowerCase().includes(filterText.toLowerCase()) ||
            item.turma.toLowerCase().includes(filterText.toLowerCase())
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
            const response = await axios.get('http://localhost:3001/eletivas');
            if (response.status === 200) {
                setData(response.data);
            }
        } catch (error) {
            console.error('Erro ao listar as eletivas', error);
            showToast('danger', error.response ? error.response.data.mensagem : 'Erro ao listar as eletivas.');
        }
    };

    const cadastrarEletiva = async (e) => {
    }

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
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedData.length > 0 ? paginatedData.map((item, index) => (
                                        <tr key={index}>
                                            <td><p className='m-0 '>{item.matricula}</p></td>
                                            <td><p className='m-0'>{item.nome}</p></td>
                                            <td><p className='m-0'>{item.turma}</p></td>
                                            <td colSpan="2">
                                                {Array.isArray(item.eletivas) && item.eletivas.map((eletiva, eletivaIndex) => (
                                                    <p key={eletivaIndex} className='m-0'>{eletiva.nome}</p>
                                                ))}
                                            </td>
                                            <td className='text-end'>
                                                <div className="d-flex align-items-center justify-content-end gap-3">
                                                    <button className='btn btn-outline-primary'>Editar</button>
                                                    <button className='btn btn-outline-danger'>Excluir</button>
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
                                    <i className="bi bi-journal-bookmark-fill"></i>
                                    <h4 className='m-0 fs-4'>Eletivas</h4>
                                </span>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Cadastrar eletiva</h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form onSubmit={cadastrarEletiva}>
                            <div className="modal-body">

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

export default Eletivas;
