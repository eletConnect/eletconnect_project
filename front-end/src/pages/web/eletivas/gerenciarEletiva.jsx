import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from '../../../configs/axios';
import Header from '../../../components/header';
import showToast from '../../../utills/toasts';

const GerenciarEletiva = () => {
    const [user, setUser] = useState(null);
    const [searchParams] = useSearchParams();
    const codigoEletiva = searchParams.get('code');

    const [state, setState] = useState({
        detalhesEletiva: {},
        carregando: true,
        alunos: [],
        alunosFiltrados: [],
        todosAlunos: [],
        todosAlunosFiltrados: [],
        termoBusca: '',
        termoBuscaMatricula: '',
        selectedAluno: null,
        alunoParaDesmatricular: null,
    });

    useEffect(() => {
        const userSession = JSON.parse(sessionStorage.getItem('user'));
        if (!userSession) {
            showToast('danger', 'Usuário não autenticado.');
            return;
        }
        setUser(userSession);

        if (!codigoEletiva) {
            showToast('warning', 'Código da eletiva não encontrado.');
            setState(prevState => ({ ...prevState, carregando: false }));
            return;
        }

        const carregarDadosEletiva = async () => {
            try {
                await carregarDetalhesEletiva(userSession);
                await carregarAlunosEletiva(userSession);
            } catch (error) {
                showToast('danger', 'Erro ao carregar dados da eletiva.');
            } finally {
                setState(prevState => ({ ...prevState, carregando: false }));
            }
        };

        carregarDadosEletiva();
    }, [codigoEletiva]);

    const carregarDetalhesEletiva = async (userSession) => {
        try {
            const { data } = await axios.post('/eletivas/buscar', { instituicao: userSession.instituicao, codigo: codigoEletiva });
            const eletiva = data.find(e => e.codigo === codigoEletiva);
            if (eletiva) {
                setState(prevState => ({ ...prevState, detalhesEletiva: eletiva }));
            } else {
                showToast('warning', 'Eletiva não encontrada.');
            }
        } catch (error) {
            showToast('danger', 'Erro ao buscar detalhes da eletiva.');
        }
    };

    const carregarAlunosEletiva = async (userSession) => {
        try {
            const { data } = await axios.post('/eletivas/listar-alunos-eletiva', { instituicao: userSession.instituicao, codigo: codigoEletiva });
            setState(prevState => ({
                ...prevState,
                alunos: data || [],
                alunosFiltrados: data || [],
            }));
        } catch (error) {
            showToast('danger', 'Erro ao listar alunos da eletiva.');
        }
    };

    const listarTodosAlunos = async () => {
        if (!user) {
            showToast('danger', 'Usuário não autenticado.');
            return;
        }

        try {
            const { instituicao } = user;
            const { data } = await axios.post('/estudantes/listar', { instituicao });
            if (data?.alunosData) {
                const alunosNaoMatriculados = data.alunosData.filter(
                    aluno => !state.alunos.some(a => a.matricula === aluno.matricula)
                );
                setState(prevState => ({
                    ...prevState,
                    todosAlunos: alunosNaoMatriculados,
                    todosAlunosFiltrados: alunosNaoMatriculados,
                }));
            } else {
                showToast('warning', 'Nenhum aluno encontrado.');
            }
        } catch (error) {
            showToast('danger', 'Erro ao listar alunos.');
        }
    };

    const filtrarAlunos = (e) => {
        const termo = e.target.value.toLowerCase();
        setState(prevState => ({
            ...prevState,
            termoBusca: termo,
            alunosFiltrados: state.alunos.filter(aluno =>
                aluno.matricula.toLowerCase().includes(termo) ||
                aluno.nome.toLowerCase().includes(termo)
            )
        }));
    };

    const filtrarAlunosMatricula = (e) => {
        const termo = e.target.value.toLowerCase();
        setState(prevState => ({
            ...prevState,
            termoBuscaMatricula: termo,
            todosAlunosFiltrados: state.todosAlunos.filter(aluno =>
                aluno.matricula.toLowerCase().includes(termo) ||
                aluno.nome.toLowerCase().includes(termo)
            )
        }));
    };

    const handleMatricula = async () => {
        if (!state.selectedAluno) {
            showToast('warning', 'Selecione um aluno primeiro!');
            return;
        }

        try {
            await axios.post('/eletivas/matricular-aluno', { instituicao: user.instituicao, codigo: codigoEletiva, matricula: state.selectedAluno.matricula, tipo: state.detalhesEletiva.tipo });   
            showToast('success', 'Aluno matriculado com sucesso!');
            atualizarAlunosMatriculados(state.selectedAluno);
            window.location.reload();
        } catch (error) {
            showToast('danger', 'Erro ao matricular aluno.');
        }
    };

    const atualizarAlunosMatriculados = (aluno) => {
        setState(prevState => ({
            ...prevState,
            alunos: [...prevState.alunos, aluno],
            alunosFiltrados: [...prevState.alunos, aluno],
            todosAlunos: prevState.todosAlunos.filter(a => a.matricula !== aluno.matricula),
            todosAlunosFiltrados: prevState.todosAlunosFiltrados.filter(a => a.matricula !== aluno.matricula),
        }));
    };

    const confirmarDesmatricular = (aluno) => {
        setState(prevState => ({ ...prevState, alunoParaDesmatricular: aluno }));
    };

    const handleDesmatricular = async () => {
        if (!state.alunoParaDesmatricular) return;

        try {
            await axios.post('/eletivas/desmatricular-aluno', { instituicao: user.instituicao, codigo: codigoEletiva, matricula: state.alunoParaDesmatricular.matricula, tipo: state.detalhesEletiva.tipo });
            showToast('success', `Aluno ${state.alunoParaDesmatricular.nome} foi removido da eletiva.`);
            removerAlunoDaEletiva(state.alunoParaDesmatricular.matricula);
            window.location.reload();
        } catch (error) {
            showToast('danger', 'Erro ao desmatricular aluno.');
        }
    };

    const removerAlunoDaEletiva = (matricula) => {
        setState(prevState => ({
            ...prevState,
            alunos: prevState.alunos.filter(a => a.matricula !== matricula),
            alunosFiltrados: prevState.alunosFiltrados.filter(a => a.matricula !== matricula),
        }));
    };

    if (state.carregando) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Carregando...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <div id='toast-container' className="toast-container position-fixed bottom-0 end-0 p-3"></div>
            <Header />
            <section id='section'>
                <div className="box">
                    <div className="title d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-journal-bookmark-fill fs-3"></i>
                            <h4 className='m-0 fs-4'>Eletivas</h4>
                            <i className="bi bi-arrow-right-short fs-4"></i>
                            <h5 className="m-0">Gerenciar Eletiva</h5>
                        </div>
                        <Link to={"/electives"} className='btn btn-outline-secondary'>
                            <i className="bi bi-box-arrow-left me-2"></i>Voltar
                        </Link>
                    </div>
                    <div className='d-flex' style={{ height: "calc(100% - 4em)" }}>
                        <div className="box-alunos w-50 p-4">
                            <div className="d-flex justify-content-between align-items-center mb-4 gap-2">
                                <div className='position-relative w-75'>
                                    <input type="text" placeholder="Pesquisar aluno (Matricula ou Nome)" className="form-control" value={state.termoBusca} onChange={filtrarAlunos} />
                                    <i className="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3"></i>
                                </div>
                                <button className="btn btn-success" data-bs-toggle="modal" data-bs-target="#modalMatricularAluno" onClick={listarTodosAlunos}>
                                    <i className="bi bi-plus-circle me-2"></i>Matricular
                                </button>
                            </div>
                            {state.alunosFiltrados.length > 0 ? (
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Matricula</th>
                                            <th>Nome</th>
                                            <th>Turma</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {state.alunosFiltrados.map(aluno => (
                                            <tr key={aluno.matricula}>
                                                <td>{aluno.matricula}</td>
                                                <td>{aluno.nome}</td>
                                                <td>{aluno.serie}</td>
                                                <td className="text-end">
                                                    <button className="btn btn-sm btn-outline-danger gap-2" data-bs-toggle="modal" data-bs-target="#desmatricularAluno" onClick={() => confirmarDesmatricular(aluno)}>
                                                        <i className="bi bi-x-lg me-2"></i>Desmatricular
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-center">Nenhum aluno matriculado encontrado.</p>
                            )}
                        </div>
                        <div className="vr"></div>
                        <div className="box-gerenciamento w-50 p-4">
                            <div className="eletiva-detalhes my-4">
                                <h5>Detalhes da Eletiva</h5>
                                <ul>
                                    <li><b>Nome</b>: {state.detalhesEletiva.nome}</li>
                                    <li><b>Tipo</b>: {state.detalhesEletiva.tipo}</li>
                                    <li><b>Professor</b>: {state.detalhesEletiva.professor}</li>
                                    <li><b>Sala</b>: {state.detalhesEletiva.sala}</li>
                                    <li><b>Dia</b>: {state.detalhesEletiva.dia} | {state.detalhesEletiva.horario}</li>
                                    <li><b>Total de Alunos</b>: {state.detalhesEletiva.alunos_cadastrados}/{state.detalhesEletiva.total_alunos}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modal Matricular Aluno */}
            <div className="modal fade" id="modalMatricularAluno" tabIndex="-1" aria-labelledby="modalMatricularAlunoLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <i className="bi bi-journal-bookmark-fill fs-3"></i>
                                <h4 className='m-0 fs-4'>Eletivas</h4>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Matricular</h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className='position-relative'>
                                <input type="text" className="form-control mb-3" placeholder="Buscar aluno..." value={state.termoBuscaMatricula} onChange={filtrarAlunosMatricula} />
                                <i className="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3"></i>
                            </div>
                            {state.todosAlunosFiltrados.length > 0 ? (
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th></th>
                                            <th>Matrícula</th>
                                            <th>Nome</th>
                                            <th>Turma</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {state.todosAlunosFiltrados.map(aluno => (
                                            <tr key={aluno.matricula}>
                                                <td>
                                                    <input type="radio" name="aluno" id={aluno.matricula} value={aluno.matricula} onChange={() => setState(prevState => ({ ...prevState, selectedAluno: aluno }))} />
                                                </td>
                                                <td>{aluno.matricula}</td>
                                                <td>{aluno.nome}</td>
                                                <td>{aluno.serie}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-center">Nenhum aluno disponível para matrícula.</p>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" className="btn btn-primary" onClick={handleMatricula}>Matricular</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Confirmação de Desmatrícula */}
            <div className="modal fade" id="desmatricularAluno" tabIndex="-1" role="dialog">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <i className="bi bi-journal-bookmark-fill fs-3"></i>
                                <h4 className='m-0 fs-4'>Eletivas</h4>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Desmatricular</h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <p>Tem certeza que deseja desmatricular o aluno {state.alunoParaDesmatricular?.nome}?</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" className="btn btn-danger" data-bs-dismiss="modal" onClick={handleDesmatricular}>Confirmar</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GerenciarEletiva;
