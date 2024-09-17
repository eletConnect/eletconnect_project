import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from '../../../configs/axios';
import Header from '../../../components/header';
import showToast from '../../../utills/toasts';
import EditarEletiva from './editarEletiva';

export default function GerenciarEletiva() {
    const [searchParams] = useSearchParams();
    const codigoEletiva = searchParams.get('code');

    const user = JSON.parse(sessionStorage.getItem('user'));

    const [carregando, setCarregando] = useState({ geral: true, modal: false });
    const [eletiva, setEletiva] = useState({});
    const [alunosMatriculados, setAlunosMatriculados] = useState([]);
    const [todosAlunosMatriculados, setTodosAlunosMatriculados] = useState([]);
    const [todosAlunos, setTodosAlunos] = useState([]);
    const [busca, setBusca] = useState({ termo: '', termoMatricula: '' });
    const [alunoSelecionado, setAlunoSelecionado] = useState({ matricula: '', nome: '' });

    useEffect(() => {
        if (!codigoEletiva) {
            showToast('warning', 'Código da eletiva não encontrado.');
            setCarregando(prev => ({ ...prev, geral: false }));
            return;
        }

        const carregarDadosEletiva = async () => {
            try {
                await buscarDetalhesEletiva(user);
                await listarAlunosMatriculados(user);
            } catch (error) {
                showToast('danger', 'Erro ao carregar dados da eletiva.');
            } finally {
                setCarregando(prev => ({ ...prev, geral: false }));
            }
        };

        carregarDadosEletiva();
    }, [codigoEletiva]);

    const buscarDetalhesEletiva = async (user) => {
        try {
            const { data } = await axios.post('/eletivas/buscar', { instituicao: user.instituicao, codigo: codigoEletiva });
            const detalhes = data.find(e => e.codigo === codigoEletiva);
            if (detalhes) {
                setEletiva(detalhes);
            } else {
                showToast('warning', 'Eletiva não encontrada.');
            }
        } catch (error) {
            showToast('danger', 'Erro ao buscar detalhes da eletiva.');
        }
    };

    const listarAlunosMatriculados = async (user) => {
        try {
            const { data } = await axios.post('/eletivas/listar-alunos-eletiva', { instituicao: user.instituicao, codigo: codigoEletiva });
            setAlunosMatriculados(data || []);
            setTodosAlunosMatriculados(data || []);
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
            setCarregando(prev => ({ ...prev, modal: true }));
            const { data } = await axios.post('/estudantes/listar', { instituicao: user.instituicao });
            if (data?.alunosData) {
                const alunosNaoMatriculados = data.alunosData.filter(
                    aluno => !alunosMatriculados.some(a => a.matricula === aluno.matricula)
                );
                setTodosAlunos(alunosNaoMatriculados);
            }
        } catch (error) {
            showToast('danger', 'Erro ao listar alunos.');
        } finally {
            setCarregando(prev => ({ ...prev, modal: false }));
        }
    };

    const matricularAluno = async () => {
        if (!user || !alunoSelecionado.matricula) {
            showToast('warning', 'É necessário selecionar um aluno.');
            return;
        }

        try {
            const resposta = await axios.post('/eletivas/matricular-aluno', {
                instituicao: user.instituicao,
                codigo: codigoEletiva,
                matricula: alunoSelecionado.matricula,
                tipo: eletiva.tipo
            });

            if (resposta.status === 201) {
                showToast('success', `O(a) aluno(a) <b>${alunoSelecionado.nome}</b> foi matriculado(a) com sucesso.`);
                const novoAluno = alunoSelecionado;
                setAlunosMatriculados(prev => [...prev, novoAluno]);
                setTodosAlunosMatriculados(prev => [...prev, novoAluno]);
                setTodosAlunos(prev => prev.filter(a => a.matricula !== alunoSelecionado.matricula));
                setAlunoSelecionado({ matricula: '', nome: '' });
            } else {
                showToast('danger', 'Erro ao matricular aluno.');
            }
        } catch (error) {
            showToast('danger', 'Erro ao matricular aluno.');
        }
    };

    const desmatricularAluno = async () => {
        if (!user || !alunoSelecionado.matricula) return;

        try {
            const resposta = await axios.post('/eletivas/desmatricular-aluno', {
                instituicao: user.instituicao,
                codigo: codigoEletiva,
                matricula: alunoSelecionado.matricula,
                tipo: eletiva.tipo
            });

            if (resposta.status === 200) {
                showToast('success', `O(a) aluno(a) <b>${alunoSelecionado.nome}</b> foi removido(a) da eletiva.`);
                setAlunosMatriculados(prev => prev.filter(a => a.matricula !== alunoSelecionado.matricula));
                setTodosAlunosMatriculados(prev => prev.filter(a => a.matricula !== alunoSelecionado.matricula));
                setAlunoSelecionado({ matricula: '', nome: '' });
            }
        } catch (error) {
            showToast('danger', 'Erro ao desmatricular aluno.');
        }
    };

    const filtrarAlunos = (e) => {
        const termo = e.target.value.toLowerCase();
        setBusca(prev => ({ ...prev, termo }));

        if (termo === '') {
            setAlunosMatriculados(todosAlunosMatriculados);
        } else {
            const filtrados = todosAlunosMatriculados.filter(aluno =>
                aluno.matricula.toLowerCase().includes(termo) ||
                aluno.nome.toLowerCase().includes(termo)
            );
            setAlunosMatriculados(filtrados);
        }
    };

    const filtrarAlunosMatricula = (e) => {
        const termoMatricula = e.target.value.toLowerCase();
        setBusca(prev => ({ ...prev, termoMatricula }));

        if (termoMatricula === '') {
            listarTodosAlunos();
        } else {
            const filtrados = todosAlunos.filter(aluno =>
                aluno.matricula.toLowerCase().includes(termoMatricula) ||
                aluno.nome.toLowerCase().includes(termoMatricula)
            );
            setTodosAlunos(filtrados);
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
                            <i className="bi bi-journal-bookmark-fill fs-3"></i>
                            <h4 className='m-0 fs-4'>Eletivas</h4>
                            <i className="bi bi-arrow-right-short fs-4"></i>
                            <h5 className="m-0">Gerenciar</h5>
                        </div>
                        {!carregando.geral && (
                            <div className='d-flex gap-2'>
                                <Link to={"/electives"} className='btn btn-outline-secondary'>
                                    <i className="bi bi-arrow-return-left"></i>&ensp;Voltar
                                </Link>
                                <button className='btn btn-outline-secondary' data-bs-toggle="modal" data-bs-target="#editarEletiva">
                                    <i className="bi bi-pencil-fill"></i>&ensp;Editar
                                </button>
                                <button className='btn btn-outline-secondary' data-bs-toggle="modal" data-bs-target="#gerarLista">
                                    <i className="bi bi-file-earmark-ruled"></i>&ensp;Gerar lista
                                </button>
                            </div>
                        )}
                    </div>
                    {carregando.geral ? (
                        <div className="d-flex justify-content-center pt-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Carregando...</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className='d-flex' style={{ height: "calc(100% - 4em)" }}>
                                <div className="box-alunos w-50 p-4">
                                    <div className="d-flex justify-content-between align-items-center mb-4 gap-2">
                                        <div className='position-relative w-75'>
                                            <input
                                                type="text"
                                                placeholder="Buscar aluno... (Matricula ou Nome)"
                                                className="form-control"
                                                value={busca.termo}
                                                onChange={filtrarAlunos}
                                            />
                                            <i className="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3"></i>
                                        </div>
                                        <button className="btn btn-success" data-bs-toggle="modal" data-bs-target="#modalMatricularAluno" onClick={listarTodosAlunos}>
                                            <i className="bi bi-person-plus"></i>&ensp;Matricular
                                        </button>
                                    </div>
                                    {alunosMatriculados.length > 0 ? (
                                        <div id='tb-elet' className='table-responsive' style={{ height: `calc(100% - 4em)` }}>
                                            <table className="table table-hover table-sm align-middle">
                                                <thead>
                                                    <tr>
                                                        <th>Matricula</th>
                                                        <th colSpan={2}>Nome</th>
                                                        <th>Série</th>
                                                        <th></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {alunosMatriculados.map(aluno => (
                                                        <tr key={aluno.matricula}>
                                                            <td>{aluno.matricula}</td>
                                                            <td colSpan={2}>{aluno.nome}</td>
                                                            <td>{aluno.serie}</td>
                                                            <td className="text-end">
                                                                <button
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    data-bs-toggle="modal"
                                                                    data-bs-target="#desmatricularAluno"
                                                                    onClick={() => setAlunoSelecionado(aluno)}
                                                                >
                                                                    <i className="bi bi-person-dash-fill"></i>&ensp;Desmatricular
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-center">Nenhum aluno matriculado encontrado.</p>
                                    )}
                                </div>
                                <div className="vr"></div>
                                <div className="box-gerenciamento w-50 px-4">
                                    <div className="eletiva-detalhes my-4">
                                        <h5>Detalhes da Eletiva</h5>
                                        <ul>
                                            <li><b>Nome</b>: {eletiva.nome}</li>
                                            <li><b>Descrição</b>: {eletiva.descricao}</li>
                                            <li><b>Tipo</b>: {eletiva.tipo}</li>
                                            <li><b>Professor</b>: {eletiva.professor}</li>
                                            <li><b>Sala</b>: {eletiva.sala}</li>
                                            <li><b>Dia</b>: {eletiva.dia} | {eletiva.horario}</li>
                                            <li><b>Total de Alunos</b>: {alunosMatriculados.length}/{eletiva.total_alunos}</li>
                                            {eletiva.serie && eletiva.turma && (
                                                <li><b>Exclusiva para</b>: {eletiva.serie} {eletiva.turma}</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* Modal Matricular Aluno */}
            <div className="modal fade" id="modalMatricularAluno" tabIndex="-1" aria-labelledby="modalMatricularAlunoLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className='d-flex align-items-center gap-2'>
                                    <i className="bi bi-journal-bookmark-fill fs-3"></i>
                                    <h4 className='m-0 fs-4'>Eletivas</h4>
                                </span>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Matricular</h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {carregando.modal ? (
                                <div className="d-flex justify-content-center pt-4">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Carregando...</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className='position-relative'>
                                        <input
                                            type="text"
                                            className="form-control mb-3"
                                            placeholder="Buscar aluno... (Matricula ou Nome)"
                                            value={busca.termoMatricula}
                                            onChange={filtrarAlunosMatricula}
                                        />
                                        <i className="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3"></i>
                                    </div>
                                    {todosAlunos.length > 0 ? (
                                        <table className="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th></th>
                                                    <th>Matrícula</th>
                                                    <th>Nome</th>
                                                    <th>Série</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {todosAlunos.map(aluno => (
                                                    <tr key={aluno.matricula}>
                                                        <td>
                                                            <input
                                                                type="radio"
                                                                name="aluno"
                                                                id={aluno.matricula}
                                                                value={aluno.matricula}
                                                                onChange={() => setAlunoSelecionado(aluno)}
                                                            />
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
                                </>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button
                                type="button"
                                className="btn btn-success"
                                data-bs-dismiss="modal"
                                onClick={matricularAluno}
                            >
                                <i className="bi bi-person-plus"></i>&ensp;Matricular
                            </button>
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
                                <span className='d-flex align-items-center gap-2'>
                                    <i className="bi bi-journal-bookmark-fill fs-3"></i>
                                    <h4 className='m-0 fs-4'>Eletivas</h4>
                                </span>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Desmatricular</h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <p>Tem certeza que deseja desmatricular o aluno {alunoSelecionado?.nome}?</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                data-bs-dismiss="modal"
                                onClick={desmatricularAluno}
                            >
                                <i className="bi bi-person-dash-fill"></i>&ensp;Desmatricular
                            </button>
                        </div>
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
                                <h5 className="m-0">Editar</h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <EditarEletiva codigo={codigoEletiva} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Gerar lista de chamada */}
            <div className="modal fade" id="gerarLista" tabIndex="-1" aria-labelledby="definirPeriodoLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className='d-flex align-items-center gap-2'>
                                    <i className="bi bi-journal-bookmark-fill fs-3"></i>
                                    <h4 className='m-0 fs-4'>Eletivas</h4>
                                </span>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Gerar lista de chamada</h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <p>Em desenvolvimento...</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
