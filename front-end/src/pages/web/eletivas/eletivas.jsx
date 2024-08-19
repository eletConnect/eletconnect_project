import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../../configs/axios';
import Header from '../../../components/header';
import showToast from '../../../utills/toasts';

export default function Eletiva() {
    const [ordenacao, setOrdenacao] = useState({ coluna: '', ascendente: true });
    const [textoFiltro, setTextoFiltro] = useState('');
    const [paginaAtual, setPaginaAtual] = useState(1);
    const itensPorPagina = 10;

    const usuario = JSON.parse(sessionStorage.getItem('user'));

    const [eletivas, setEletivas] = useState([]);

    const [codigoParaEditar, setCodigoParaEditar] = useState('');
    const [nomeParaEditar, setNomeParaEditar] = useState('');

    useEffect(() => {
        carregarEletivas();
    }, []);

    const alternarOrdenacao = (coluna) => {
        setOrdenacao(prevState => ({
            coluna,
            ascendente: prevState.coluna === coluna ? !prevState.ascendente : true
        }));
        setPaginaAtual(1);
    };

    const eletivasFiltradasEOrdenadas = eletivas
        .filter(eletiva =>
            ['nome', 'professor', 'tipo'].some(key =>
                eletiva[key]?.toLowerCase().includes(textoFiltro.toLowerCase())
            )
        )
        .sort((a, b) => {
            const valorA = a[ordenacao.coluna] || '';
            const valorB = b[ordenacao.coluna] || '';
            return ordenacao.ascendente ? valorA.localeCompare(valorB) : valorB.localeCompare(valorA);
        });

    const eletivasPaginadas = eletivasFiltradasEOrdenadas.slice(
        (paginaAtual - 1) * itensPorPagina,
        paginaAtual * itensPorPagina
    );

    const carregarEletivas = async () => {
        try {
            const resposta = await axios.post('/eletivas/listar', { instituicao: usuario.instituicao });
            if (resposta.status === 200) {
                setEletivas(resposta.data);
            }
        } catch (erro) {
            showToast('danger', erro.response?.data.mensagem || 'Erro ao listar as eletivas');
        }
    };

    const cadastrarEletiva = async (e) => {
        e.preventDefault();

        const novaEletiva = {
            instituicao: usuario.instituicao,
            nome: e.target.nome.value,
            tipo: e.target.tipo.value,
            dia: e.target.dia.value,
            horario: e.target.horario.value,
            professor: e.target.professor.value,
            sala: e.target.sala.value,
            total_alunos: e.target.totalAlunos.value,
            status: 'Ativo'
        };

        try {
            const resposta = await axios.post('/eletivas/cadastrar', novaEletiva);
            if (resposta.status === 201) {
                carregarEletivas();
                showToast('success', 'Eletiva cadastrada com sucesso.');
                e.target.reset();
            }
        } catch (erro) {
            showToast('danger', erro.response?.data.mensagem || 'Erro ao cadastrar a eletiva');
        }
    };

    const excluirEletiva = async (e) => {
        e.preventDefault();

        try {
            const resposta = await axios.post('/eletivas/excluir', { codigo: codigoParaEditar, instituicao: usuario.instituicao });
            if (resposta.status === 200) {
                carregarEletivas();
                showToast('success', 'Eletiva excluída com sucesso.');
            }
        } catch (erro) {
            showToast('danger', erro.response?.data.mensagem || 'Erro ao excluir a eletiva');
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
                        <div className="d-flex justify-content-end">
                            <form className="position-relative">
                                <input type="text" className="form-control" placeholder="Filtrar eletiva..." onChange={e => { setTextoFiltro(e.target.value); setPaginaAtual(1); }} />
                                <i className="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3"></i>
                            </form>
                        </div>
                        <div className='table-responsive'>
                            <table className='table table-striped table-hover align-middle'>
                                <thead>
                                    <tr>
                                        {['nome', 'tipo'].map(coluna => (
                                            <th key={coluna} onClick={() => alternarOrdenacao(coluna)} style={{ cursor: 'pointer' }} >
                                                <span className='d-flex align-items-center gap-2'>
                                                    <i className={`bi bi-arrow-${ordenacao.coluna === coluna ? (ordenacao.ascendente ? 'down' : 'up') : 'down-up'}`}></i>
                                                    <p className='m-0'>{coluna.charAt(0).toUpperCase() + coluna.slice(1)}</p>
                                                </span>
                                            </th>
                                        ))}
                                        <th>Professor</th>
                                        <th>Sala</th>
                                        <th>Horário</th>
                                        <th>Total alunos</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {eletivasPaginadas.length > 0 ? (
                                        eletivasPaginadas.map(eletiva => (
                                            <tr key={eletiva.codigo}>
                                                <td><p className='m-0'>{eletiva.nome}</p></td>
                                                <td><p className='m-0'>{eletiva.tipo}</p></td>
                                                <td><p className='m-0'>{eletiva.professor}</p></td>
                                                <td><p className='m-0'>{eletiva.sala}</p></td>
                                                <td><p className='m-0'>{eletiva.dia} | {eletiva.horario}</p></td>
                                                <td><p className='m-0'>{eletiva.alunos_cadastrados}/{eletiva.total_alunos}</p></td>
                                                <td className='text-end'>
                                                    <div className="d-flex align-items-center justify-content-end gap-3">
                                                        <button className='btn btn-sm btn-success d-flex align-items-center gap-2' data-bs-toggle="modal" data-bs-target="#editarEletiva" onClick={() => setCodigoParaEditar(eletiva.codigo)} >
                                                            <i className="bi bi-pencil-fill"></i>
                                                            <p className='m-0 d-lg-block d-none'>Editar</p>
                                                        </button>
                                                        <Link to={`/electives/manage?code=${eletiva.codigo}`} className='btn btn-sm btn-secondary d-flex align-items-center gap-2' >
                                                            <i className="bi bi-gear-fill"></i>
                                                            <p className='m-0 d-lg-block d-none'>Gerenciar</p>
                                                        </Link>
                                                        <button className='btn btn-sm btn-danger d-flex align-items-center gap-2' data-bs-toggle="modal" data-bs-target="#excluirEletiva" onClick={() => { setCodigoParaEditar(eletiva.codigo); setNomeParaEditar(eletiva.nome); }} >
                                                            <i className="bi bi-trash3-fill"></i>
                                                            <p className='m-0 d-lg-block d-none'>Excluir</p>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className='text-center'>
                                                Nenhuma eletiva cadastrada.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="d-flex justify-content-between">
                            <p>Mostrando {(paginaAtual - 1) * itensPorPagina + 1} até {paginaAtual * itensPorPagina} de {eletivasFiltradasEOrdenadas.length} resultados</p>
                            <ul className="pagination">
                                {Array.from({ length: Math.ceil(eletivasFiltradasEOrdenadas.length / itensPorPagina) }, (_, i) => (
                                    <li key={i + 1} className={`page-item ${paginaAtual === i + 1 ? 'active' : ''}`}>
                                        <button className="page-link" onClick={() => setPaginaAtual(i + 1)}>
                                            {i + 1}
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
                                    <label htmlFor="nome" className="form-label">Nome <span className='text-danger'>*</span></label>
                                    <input type="text" className="form-control" id="nome" name="nome" required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="tipo" className="form-label">Tipo <span className='text-danger'>*</span></label>
                                    <div className='d-flex justify-content-between mx-1'>
                                        <div className="form-check">
                                            <input className="form-check-input" type="radio" id="eletivaRadio" name="tipo" value="Eletiva" required />
                                            <label className="form-check-label" htmlFor="eletivaRadio">Eletiva</label>
                                        </div>
                                        <div className="form-check">
                                            <input className="form-check-input" type="radio" id="projetoVidaRadio" name="tipo" value="Projeto de Vida" />
                                            <label className="form-check-label" htmlFor="projetoVidaRadio">Projeto de Vida</label>
                                        </div>
                                        <div className="form-check">
                                            <input className="form-check-input" type="radio" id="trilhaRadio" name="tipo" value="Trilha" />
                                            <label className="form-check-label" htmlFor="trilhaRadio">Trilha</label>
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="dia" className="form-label">Dia da semana <span className='text-danger'>*</span></label>
                                    <select className="form-select" id="dia" name="dia" required>
                                        <option>Selecione...</option>
                                        <option value="Terça-feira">Terça-feira</option>
                                        <option value="Quinta-feira">Quinta-feira</option>
                                        <option value="Terça-feira e Quinta-feira">Terça-feira e Quinta-feira</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="horario" className="form-label">Horário <span className='text-danger'>*</span></label>
                                    <select className="form-select" id="horario" name="horario" required>
                                        <option>Selecione...</option>
                                        <option value="1º e 2º horário">1º e 2º horário</option>
                                        <option value="3º e 4º horário">3º e 4º horário</option>
                                        <option value="5º e 6º horário">5º e 6º horário</option>
                                        <option value="1º, 2º, 3º e 4º horário">1º, 2º, 3º e 4º horário</option>
                                        <option value="3º, 4º, 5º e 6º horário">3º, 4º, 5º e 6º horário</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="professor" className="form-label">Professor <span className='text-danger'>*</span></label>
                                    <input type="text" className="form-control" id="professor" name="professor" required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="sala" className="form-label">Sala <span className='text-danger'>*</span></label>
                                    <input type="text" className="form-control" id="sala" name="sala" required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="totalAlunos" className="form-label">Total de alunos <span className='text-danger'>*</span></label>
                                    <input type="number" className="form-control" id="totalAlunos" name="totalAlunos" required />
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
                            <iframe id='editarEletivaFrame' src={`http://localhost:5173/electives/edit?codigo=${codigoParaEditar}`} width="100%" height="350px"></iframe>
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
                                <button type='submit' className='btn btn-danger' data-bs-dismiss="modal">Excluir</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

