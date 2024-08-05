import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../../../components/header';
import showToast from '../../../utills/toasts';

const Alunos = () => {
    const [sortBy, setSortBy] = useState({ column: '', asc: true });
    const [filterText, setFilterText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [data, setData] = useState([]);
    const [matricula, setMatricula] = useState('');
    const [nome, setNome] = useState('');
    const [turma, setTurma] = useState('');
    const [email, setEmail] = useState('');
    const [senha] = useState('76543210');
    const [matriculaParaEditar, setMatriculaParaEditar] = useState('');
    const [nomeParaEditar, setNomeParaEditar] = useState('');

    const escola = JSON.parse(sessionStorage.getItem('escola'));

    useEffect(() => {
        listarAlunos();
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

    const listarAlunos = async () => {
        try {
            const response = await axios.post('http://localhost:3001/aluno/listar', { instituicao: escola.cnpj });
            if (response.status === 200) {
                setData(response.data.alunosData.map((aluno) => ({
                    matricula: aluno.matricula,
                    nome: aluno.nome,
                    turma: aluno.turma,
                    eletivas: aluno.eletivas || []
                })));
            }
        } catch (error) {
            console.error('Erro ao listar alunos:', error);
            showToast('danger', 'Erro ao listar alunos!');
        }
    };

    const cadastrarAluno = async (e) => {
        e.preventDefault();

        if (data.some(aluno => aluno.matricula === matricula)) {
            showToast('danger', 'Já existe um aluno com essa matrícula!');
            return;
        }

        try {
            const responseAluno = await axios.post('http://localhost:3001/aluno/cadastrar', {
                matricula, nome, turma, instituicao: escola.cnpj
            });
            if (responseAluno.status === 200) {
                showToast('success', 'Aluno cadastrado com sucesso!');
                listarAlunos();
                setMatricula('');
                setNome('');
                setTurma('');
                setEmail('');w
            }
        } catch (error) {
            console.error('Erro ao cadastrar aluno:', error);
            showToast('danger', 'Erro ao cadastrar aluno!');
        }
    };

    const redefinirSenha = async (e) => {
        e.preventDefault();

        if (!matriculaParaEditar) {
            showToast('danger', 'A matrícula não foi fornecida.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:3001/aluno/redefinir-senha', { matricula: matriculaParaEditar, senha });
            if (response.status === 200) {
                showToast('success', 'Senha redefinida com sucesso!');
            }
        } catch (error) {
            console.error('Erro ao redefinir senha do aluno:', error);
            showToast('danger', 'Erro ao redefinir senha do aluno!');
        }
    };

    const excluirAluno = async (e) => {
        e.preventDefault();

        if (!matriculaParaEditar) {
            showToast('danger', 'A matrícula não foi fornecida.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:3001/aluno/excluir', { matricula: matriculaParaEditar });
            if (response.status === 200) {
                showToast('success', 'Aluno excluído com sucesso!');
                listarAlunos();
            }
        } catch (error) {
            console.error('Erro ao excluir aluno:', error);
            showToast('danger', 'Erro ao excluir aluno!');
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
                            <i className="bi bi-person-arms-up fs-3"></i>
                            <h3 className='m-0 fs-4'>Estudantes</h3>
                        </span>
                        <button className='btn btn-outline-secondary' data-bs-toggle="modal" data-bs-target="#cadastrarAluno">
                            <i className="bi bi-person-add me-2"></i>Cadastrar
                        </button>
                    </div>
                    <div className="p-4">
                        <div className="d-flex justify-content-between">
                            <span></span>
                            <form className="position-relative">
                                <input type="text" className="form-control" placeholder="Filtrar alunos..." onChange={handleInputChange} />
                                <i className="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3"></i>
                            </form>
                        </div>
                        <div className='table-responsive mt-2'>
                            <table className='table table-striped table-hover align-middle'>
                                <thead>
                                    <tr>
                                        {['matricula', 'nome', 'turma'].map((coluna) => (
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
                                        <th colSpan='2'>Eletivas</th>
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
                                                    <button className='btn btn-sm btn-primary d-flex align-items-center gap-2' data-bs-toggle="modal" data-bs-target="#redefinirSenha" onClick={() => { setMatriculaParaEditar(item.matricula); setNomeParaEditar(item.nome); }}>
                                                        <i className="bi bi-key-fill"></i>
                                                        <p className='m-0 d-lg-block d-none'>Redefinir Senha</p>
                                                    </button>
                                                    <button className='btn btn-sm btn-success d-flex align-items-center gap-2' data-bs-toggle="modal" data-bs-target="#editarAluno" onClick={() => { setMatriculaParaEditar(item.matricula); }}>
                                                        <i className="bi bi-pencil"></i>
                                                        <p className='m-0 d-lg-block d-none'>Editar</p>
                                                    </button>
                                                    <button className='btn btn-sm btn-danger d-flex align-items-center gap-2' data-bs-toggle="modal" data-bs-target="#excluirAluno" onClick={() => { setMatriculaParaEditar(item.matricula); setNomeParaEditar(item.nome); }} >
                                                        <i className="bi bi-trash3-fill"></i>
                                                        <p className='m-0 d-lg-block d-none'>Excluir</p>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" className='text-center'>
                                                Nenhum aluno encontrado.
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

            {/* Modal: Cadastrar Aluno */}
            <div className="modal fade" id="cadastrarAluno" tabIndex="-1" aria-labelledby="cadastrarAlunoLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className='d-flex align-items-center gap-2'>
                                    <i className="bi bi-person-arms-up fs-3"></i>
                                    <h4 className='m-0 fs-4'>Estudantes</h4>
                                </span>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Cadastrar aluno</h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form onSubmit={cadastrarAluno}>
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
                                    <label htmlFor="turma" className="form-label">Turma <a className='text-danger'>*</a></label>
                                    <input type="text" className="form-control" id="turma" value={turma} onChange={e => setTurma(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="turma" className="form-label">E-mail</label>
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

            {/* Modal: Redefinir Senha */}
            <div className="modal fade" id="redefinirSenha" tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className='d-flex align-items-center gap-2'>
                                    <i className="bi bi-person-arms-up fs-3"></i>
                                    <h4 className='m-0 fs-4'>Estudantes</h4>
                                </span>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Redefinir senha</h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form onSubmit={redefinirSenha}>
                            <div className="modal-body">
                                <p>Você está prestes a redefinir a senha do(a) aluno(a) <b>{nomeParaEditar}</b>, com matrícula <b>{matriculaParaEditar}</b>. Esta ação não pode ser desfeita. Deseja prosseguir?<br />Senha padrão: <b>76543210</b></p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" className="btn btn-primary" data-bs-dismiss="modal">Redefinir</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Modal: Editar Aluno */}
            <div className="modal fade" id="editarAluno" tabIndex="-1" aria-labelledby="editarAlunoLabel" aria-hidden="true">
                <div className="modal-dialog modal-xl">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className='d-flex align-items-center gap-2'>
                                    <i className="bi bi-person-arms-up fs-3"></i>
                                    <h3 className='m-0 fs-4'>Estudantes</h3>
                                </span>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h4 className="m-0">Editar dados</h4>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <iframe id='editarAlunoFrame' src={`http://localhost:5173/edit-student?matricula=${matriculaParaEditar}`} width="100%" height="500px"></iframe>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Excluir Aluno */}
            <div className="modal fade" id="excluirAluno" tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className='d-flex align-items-center gap-2'>
                                    <i className="bi bi-person-arms-up fs-3"></i>
                                    <h4 className='m-0 fs-4'>Estudantes</h4>
                                </span>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Excluir dados</h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form onSubmit={excluirAluno}>
                            <div className="modal-body">
                                <p>Você está prestes a excluir todos os dados do(a) aluno(a) <b>{nomeParaEditar}</b>, com matrícula <b>{matriculaParaEditar}</b>. Esta ação não pode ser desfeita. Deseja prosseguir?</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" className="btn btn-danger" data-bs-dismiss="modal">Confirmar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Alunos;
