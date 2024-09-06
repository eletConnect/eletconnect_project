import React, { useState, useEffect } from 'react';
import axios from '../../../configs/axios';
import Header from '../../../components/header';
import showToast from '../../../utills/toasts';
import EditarAluno from './editarAluno';

export default function Alunos() {
    const [ordenacao, setOrdenacao] = useState({ coluna: '', asc: true });
    const [textoFiltro, setTextoFiltro] = useState('');
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [alunos, setAlunos] = useState([]);
    const [alunoSelecionado, setAlunoSelecionado] = useState({ matricula: '', nome: '' });
    const [carregando, setCarregando] = useState(true);

    const itensPorPagina = 10;
    const senhaPadrao = '76543210';
    const escola = JSON.parse(sessionStorage.getItem('escola'));

    useEffect(() => {
        carregarAlunos();
    }, []);

    const alternarOrdenacao = (coluna) => {
        setOrdenacao((prevOrdenacao) => ({
            coluna,
            asc: prevOrdenacao.coluna === coluna ? !prevOrdenacao.asc : true,
        }));
        setPaginaAtual(1);
    };

    const compararValores = (a, b) => {
        const valorA = a[ordenacao.coluna] || '';
        const valorB = b[ordenacao.coluna] || '';

        const comparacaoNumerica = !isNaN(valorA) && !isNaN(valorB);
        if (comparacaoNumerica) return ordenacao.asc ? valorA - valorB : valorB - valorA;

        return ordenacao.asc
            ? valorA.localeCompare(valorB)
            : valorB.localeCompare(valorA);
    };

    const obterClasseBadge = (tipo) => {
        const classes = {
            'Trilha': 'text-bg-primary',
            'Eletiva': 'text-bg-success',
            'Projeto de Vida': 'text-bg-danger',
            'default': 'text-bg-secondary',
        };
        return classes[tipo] || classes['default'];
    };

    const listarEletivasDoAluno = async (matricula) => {
        try {
            const resposta = await axios.post('/eletivas/listar-eletivas-aluno', {
                matricula,
                instituicao: escola.cnpj,
            });
            return resposta.status === 200 ? resposta.data : [];
        } catch (erro) {
            console.error('Erro ao listar as eletivas do aluno:', erro);
            showToast('danger', 'Erro ao listar as eletivas do aluno!');
            return [];
        }
    };

    const carregarAlunos = async () => {
        setCarregando(true);
        try {
            const resposta = await axios.post('/estudantes/listar', { instituicao: escola.cnpj });

            if (resposta.status === 200) {
                const alunosComEletivas = await Promise.all(
                    resposta.data.alunosData.map(async (aluno) => ({
                        ...aluno,
                        eletivas: await listarEletivasDoAluno(aluno.matricula),
                    }))
                );
                setAlunos(alunosComEletivas);
            }
        } catch (erro) {
            console.error('Erro ao listar alunos:', erro);
            showToast('danger', 'Erro ao listar alunos!');
        } finally {
            setCarregando(false);
        }
    };

    const alunosFiltradosEOrdenados = alunos
        .filter(({ nome, matricula }) =>
            nome.toLowerCase().includes(textoFiltro.toLowerCase()) ||
            matricula.toLowerCase().includes(textoFiltro.toLowerCase())
        )
        .sort(compararValores);

    const indiceInicial = (paginaAtual - 1) * itensPorPagina;
    const alunosPaginados = alunosFiltradosEOrdenados.slice(indiceInicial, indiceInicial + itensPorPagina);
    const totalPaginas = Math.ceil(alunosFiltradosEOrdenados.length / itensPorPagina);

    const manipularEntradaFiltro = (e) => {
        setTextoFiltro(e.target.value);
        setPaginaAtual(1);
    };

    const manipularTrocaDePagina = (numeroPagina) => {
        setPaginaAtual(numeroPagina);
    };

    const cadastrarAluno = async (e) => {
        e.preventDefault();

        const matricula = e.target.matricula.value;

        // Verifica se já existe um aluno com a mesma matrícula
        const alunoExistente = alunos.find(aluno => aluno.matricula === matricula);
        if (alunoExistente) {
            showToast('danger', 'Já existe um aluno com esta matrícula!');
            return;
        }

        const novoAluno = {
            instituicao: escola.cnpj,
            matricula,
            nome: e.target.nome.value,
            serie: e.target.serie.value,
            turma: e.target.turma.value,
            senha: senhaPadrao,
        };

        try {
            const resposta = await axios.post('/estudantes/cadastrar', novoAluno);
            if (resposta.status === 200) {
                showToast('success', 'Aluno cadastrado com sucesso!');
                carregarAlunos();
            }
        } catch (erro) {
            showToast('danger', erro.response?.data.mensagem || 'Erro ao cadastrar o aluno');
        }
    };

    const redefinirSenha = async (e) => {
        e.preventDefault();

        if (!alunoSelecionado.matricula) {
            showToast('danger', 'A matrícula não foi fornecida.');
            return;
        }

        try {
            const resposta = await axios.post('/estudantes/redefinir-senha', {
                matricula: alunoSelecionado.matricula,
                senha: senhaPadrao
            });

            if (resposta.status === 200) {
                showToast('success', 'Senha redefinida com sucesso!');
                carregarAlunos();
            }
        } catch (erro) {
            console.error('Erro ao redefinir senha do aluno:', erro);
            showToast('danger', 'Erro ao redefinir senha do aluno!');
        }
    };

    const excluirAluno = async (e) => {
        e.preventDefault();

        if (!alunoSelecionado.matricula) {
            showToast('danger', 'A matrícula não foi fornecida.');
            return;
        }

        try {
            const resposta = await axios.post('/estudantes/excluir', { matricula: alunoSelecionado.matricula });

            if (resposta.status === 200) {
                showToast('success', 'Aluno excluído com sucesso!');
                carregarAlunos(); 
            }
        } catch (erro) {
            console.error('Erro ao excluir aluno:', erro);
            showToast('danger', 'Erro ao excluir aluno!');
        }
    };

    return (
        <>
            <div id="toast-container" className="toast-container position-fixed bottom-0 end-0 p-3"></div>
            <Header />
            <section id="section">
                <div className="box">
                    <div className="title d-flex justify-content-between align-items-center">
                        <span className="d-flex align-items-center gap-2 text-black">
                            <i className="bi bi-person-arms-up fs-3"></i>
                            <h3 className="m-0 fs-4">Estudantes</h3>
                        </span>
                        {!carregando && (
                            <button className="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#cadastrarAluno" onClick={() => setAlunoSelecionado({ matricula: '', nome: '' })} >
                                <i className="bi bi-person-add"></i>&ensp;Cadastrar
                            </button>
                        )}
                    </div>
                    <div className="p-4">
                        {carregando ? (
                            <div className="d-flex justify-content-center">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Carregando...</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="d-flex justify-content-end">
                                    <div className="w-50 ms-auto mb-2">
                                        <form className="position-relative">
                                            <input type="text" className="form-control" placeholder="Buscar aluno... (Matricula ou Nome)" onChange={manipularEntradaFiltro} />
                                            <i className="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3"></i>
                                        </form>
                                    </div>
                                </div>
                                <div className="table-responsive mt-2">
                                    <table className="table table-striped table-hover table-sm align-middle">
                                        <thead>
                                            <tr>
                                                {['matricula', 'nome'].map((coluna) => (
                                                    <th key={coluna} onClick={() => alternarOrdenacao(coluna)} style={{ cursor: 'pointer' }}>
                                                        <span className="d-flex align-items-center gap-2">
                                                            {ordenacao.coluna === coluna ? (
                                                                <i className={`bi bi-arrow-${ordenacao.asc ? 'down' : 'up'}`}></i>
                                                            ) : (
                                                                <i className="bi bi-arrow-down-up"></i>
                                                            )}
                                                            <p className="m-0">{coluna.charAt(0).toUpperCase() + coluna.slice(1)}</p>
                                                        </span>
                                                    </th>
                                                ))}
                                                <th>Turma</th>
                                                <th colSpan="2">Eletivas</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {alunosPaginados.length > 0 ? (
                                                alunosPaginados.map((aluno) => (
                                                    <tr key={aluno.matricula}>
                                                        <td><p className="m-0">{aluno.matricula}</p></td>
                                                        <td><p className="m-0">{aluno.nome}</p></td>
                                                        <td>{`${aluno.serie} ${aluno.turma}`}</td>
                                                        <td colSpan="2">
                                                            {aluno.eletivas.length > 0 ? (
                                                                aluno.eletivas.map((eletiva, index) => (
                                                                    <span key={index} className={`badge ${obterClasseBadge(eletiva.tipo)} me-1`} >
                                                                        {eletiva.nome}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <p className="m-0 text-muted">Nenhuma eletiva</p>
                                                            )}
                                                        </td>
                                                        <td className="text-end">
                                                            <div className="d-flex align-items-center justify-content-end gap-3">
                                                                <button className="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#redefinirSenha" onClick={() => setAlunoSelecionado(aluno)} >
                                                                    <i className="bi bi-key-fill"></i>&ensp;Redefinir Senha
                                                                </button>
                                                                <button className="btn btn-sm btn-success" data-bs-toggle="modal" data-bs-target="#editarAluno" onClick={() => setAlunoSelecionado(aluno)} >
                                                                    <i className="bi bi-pencil-fill"></i>&ensp;Editar
                                                                </button>
                                                                <button className="btn btn-sm btn-danger" data-bs-toggle="modal" data-bs-target="#excluirAluno" onClick={() => setAlunoSelecionado(aluno)} >
                                                                    <i className="bi bi-trash3-fill"></i>&ensp;Excluir
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="text-center">
                                                        Nenhum aluno encontrado.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <p>Mostrando {indiceInicial + 1} até {paginaAtual * itensPorPagina} de {alunosFiltradosEOrdenados.length} resultados</p>
                                    <ul className="pagination">
                                        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numeroPagina) => (
                                            <li key={numeroPagina} className={`page-item ${paginaAtual === numeroPagina ? 'active' : ''}`}>
                                                <button className="page-link" onClick={() => manipularTrocaDePagina(numeroPagina)}>
                                                    {numeroPagina}
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

            {/* Modal: Cadastrar Aluno */}
            <div className="modal fade" id="cadastrarAluno" tabIndex="-1" aria-labelledby="cadastrarAlunoLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className="d-flex align-items-center gap-2">
                                    <i className="bi bi-person-arms-up fs-3"></i>
                                    <h4 className="m-0 fs-4">Estudantes</h4>
                                </span>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Cadastrar</h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form onSubmit={cadastrarAluno}>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label htmlFor="matricula" className="form-label">Matrícula <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" id="matricula" name="matricula" required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="nome" className="form-label">Nome <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" id="nome" name="nome" required />
                                </div>
                                <div className="mb-3 d-flex gap-4">
                                    <div>
                                        <label htmlFor="serie" className="form-label">Série <span className="text-danger">*</span></label>
                                        <select className="form-select" id="serie" name="serie" required >
                                            <option value="">Selecione...</option>
                                            <option value="1º ano">1º ano</option>
                                            <option value="2º ano">2º ano</option>
                                            <option value="3º ano">3º ano</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="turma" className="form-label">Turma <span className="text-danger">*</span></label>
                                        <select className="form-select" id="turma" name="turma" required >
                                            <option value="">Selecione...</option>
                                            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(turma => (
                                                <option key={turma} value={turma}>{turma}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" className="btn btn-primary" data-bs-dismiss="modal"><i className="bi bi-person-add"></i>&ensp;Cadastrar</button>
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
                                <span className="d-flex align-items-center gap-2">
                                    <i className="bi bi-person-arms-up fs-3"></i>
                                    <h4 className="m-0 fs-4">Estudantes</h4>
                                </span>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Redefinir senha</h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form onSubmit={redefinirSenha}>
                            <div className="modal-body">
                                <p>Você está prestes a redefinir a senha do(a) aluno(a) <b>{alunoSelecionado.nome}</b>, com matrícula <b>{alunoSelecionado.matricula}</b>. Esta ação não pode ser desfeita. Deseja prosseguir?<br />Senha padrão: <b>{senhaPadrao}</b></p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" className="btn btn-primary" data-bs-dismiss="modal"><i className="bi bi-key-fill"></i>&ensp;Redefinir</button>
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
                                <span className="d-flex align-items-center gap-2">
                                    <i className="bi bi-person-arms-up fs-3"></i>
                                    <h3 className="m-0 fs-4">Estudantes</h3>
                                </span>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h4 className="m-0">Editar</h4>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <EditarAluno matricula={alunoSelecionado.matricula} />  
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
                                <span className="d-flex align-items-center gap-2">
                                    <i className="bi bi-person-arms-up fs-3"></i>
                                    <h4 className="m-0 fs-4">Estudantes</h4>
                                </span>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Excluir</h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form onSubmit={excluirAluno}>
                            <div className="modal-body">
                                <p>Você está prestes a excluir todos os dados do(a) aluno(a) <b>{alunoSelecionado.nome}</b>, com matrícula <b>{alunoSelecionado.matricula}</b>. Esta ação não pode ser desfeita. Deseja prosseguir?</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" className="btn btn-danger" data-bs-dismiss="modal"><i className="bi bi-trash3-fill"></i>&ensp;Excluir</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
