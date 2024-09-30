import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from '../../../configs/axios';
import Header from '../../../components/header';
import showToast from '../../../utills/toasts';
import EditarAluno from './editarAluno';
import * as XLSX from 'xlsx';

export default function Alunos() {
    const [ordenacao, setOrdenacao] = useState({ coluna: '', asc: true });
    const [textoFiltro, setTextoFiltro] = useState('');
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [alunos, setAlunos] = useState([]);
    const [alunoSelecionado, setAlunoSelecionado] = useState({ matricula: '', nome: '' });
    const [carregando, setCarregando] = useState(true);
    const [planilha, setPlanilha] = useState(null);
    const [dados, setDados] = useState([]);
    const [planilhaEnviada, setPlanilhaEnviada] = useState(false);
    const [loading, setLoading] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [alunosSelecionados, setAlunosSelecionados] = useState([]);
    const [exclusaoModalAberto, setExclusaoModalAberto] = useState(false); // Estado para controlar o modal de exclusão

    const itensPorPagina = 10;
    const senhaPadrao = '76543210';
    const escola = JSON.parse(sessionStorage.getItem('escola'));

    const carregarAlunos = useCallback(async () => {
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
            showToast('danger', 'Erro ao listar alunos!');
        } finally {
            setCarregando(false);
        }
    }, [escola.cnpj]);

    const listarEletivasDoAluno = useCallback(async (matricula) => {
        try {
            const resposta = await axios.post('/eletivas/listar-eletivas-aluno', { matricula, instituicao: escola.cnpj });
            return resposta.status === 200 ? resposta.data : [];
        } catch (erro) {
            showToast('danger', 'Erro ao listar as eletivas do aluno!');
            return [];
        }
    }, [escola.cnpj]);

    useEffect(() => {
        carregarAlunos();
    }, [carregarAlunos]);

    const alternarOrdenacao = (coluna) => {
        setOrdenacao((prevOrdenacao) => ({
            coluna,
            asc: prevOrdenacao.coluna === coluna ? !prevOrdenacao.asc : true,
        }));
        setPaginaAtual(1);
    };

    const compararValores = useCallback(
        (a, b) => {
            const valorA = a[ordenacao.coluna] || '';
            const valorB = b[ordenacao.coluna] || '';

            if (!isNaN(valorA) && !isNaN(valorB)) {
                return ordenacao.asc ? valorA - valorB : valorB - valorA;
            }
            return ordenacao.asc ? valorA.localeCompare(valorB) : valorB.localeCompare(valorA);
        },
        [ordenacao]
    );

    const alunosFiltradosEOrdenados = useMemo(() => {
        return alunos
            .filter(({ nome, matricula }) =>
                nome.toLowerCase().includes(textoFiltro.toLowerCase()) ||
                matricula.toLowerCase().includes(textoFiltro.toLowerCase())
            )
            .sort(compararValores);
    }, [alunos, textoFiltro, compararValores]);

    const alunosPaginados = useMemo(() => {
        const indiceInicial = (paginaAtual - 1) * itensPorPagina;
        return alunosFiltradosEOrdenados.slice(indiceInicial, indiceInicial + itensPorPagina);
    }, [alunosFiltradosEOrdenados, paginaAtual]);

    const totalPaginas = Math.ceil(alunosFiltradosEOrdenados.length / itensPorPagina);

    const manipularEntradaFiltro = (e) => {
        setTextoFiltro(e.target.value);
        setPaginaAtual(1);
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        setPlanilha(file);
        lerArquivo(file);
    };

    const lerArquivo = (file) => {
        setLoading(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            let jsonData = XLSX.utils.sheet_to_json(worksheet);

            jsonData = jsonData.map(({ __rowNum__, ...rest }) => rest);

            console.log('Dados extraídos da planilha sem __rowNum__:', jsonData);
            setDados(jsonData);
            setLoading(false);
        };
        reader.readAsBinaryString(file);
    };

    const cadastrarPlanilha = async () => {
        setEnviando(true);
        setPlanilhaEnviada(false); // Resetar estado de envio antes de começar a nova operação

        try {
            // Enviar dados da planilha para a API
            const response = await axios.post('/estudantes/cadastrar-planilha', { dados, instituicao: escola.cnpj });

            // Verificar se a resposta foi bem-sucedida e contém os dados esperados
            if (response.status === 201) {
                const { mensagem, resumo, detalhes } = response.data;

                // Verificar se 'detalhes' está definido e possui a propriedade 'alunosFalhos'
                const alunosFalhos = detalhes?.alunosFalhos ?? [];

                // Construção de uma mensagem de sucesso detalhada para o usuário
                let detalhesCadastro = `${mensagem}`;

                // Detalha cada falha individualmente se houver falhas
                if (alunosFalhos.length > 0) {
                    detalhesCadastro += `\nFalhas no Cadastro:\n`;
                    alunosFalhos.forEach((falha) => {
                        detalhesCadastro += `- ${falha.nome || 'Aluno desconhecido'} (Matrícula: ${falha.matricula || 'N/A'}) - Motivo: ${falha.motivo}\n`;
                    });
                }

                // Exibir mensagem detalhada no alert e no toast
                alert(detalhesCadastro.trim()); // Exibe a mensagem detalhada no alert
                showToast('success', `${mensagem}`);
                setPlanilhaEnviada(true);

                // Recarrega os dados dos alunos após um breve intervalo
                setTimeout(() => {
                    carregarAlunos(); // Assumindo que há uma função para recarregar os alunos sem refresh da página
                }, 2000);
            } else {
                // Mensagem de erro padrão para status não 201
                const mensagemErro = `Erro inesperado no cadastro. Código de status: ${response.status}`;
                alert(mensagemErro); // Exibe o erro no alert
                showToast('danger', mensagemErro);
            }
        } catch (error) {
            // Tratamento de erro mais detalhado e descritivo
            let mensagemErro = 'Erro de rede ou o servidor não respondeu. Verifique sua conexão e tente novamente.';

            // Verificar se o erro é um erro esperado com resposta do servidor
            if (error.response) {
                console.error('Erro detalhado retornado pela API:', error.response.data);
                mensagemErro = `Erro no cadastro: ${error.response.data.mensagem || 'Erro inesperado no servidor'}`;

                // Caso a resposta tenha sido recebida com sucesso mas ainda cause erro
                if (error.response.status === 201) {
                    mensagemErro = 'Cadastro realizado, mas houve um problema ao receber a resposta do servidor.';
                    alert('Atenção: O cadastro foi realizado com sucesso, mas houve um problema ao receber a resposta do servidor.');
                    showToast('warning', 'Cadastro realizado, mas houve um problema ao receber a resposta.');
                }
            } else if (error.message) {
                console.error('Erro de rede ou falta de resposta do servidor:', error.message);
                mensagemErro = `Erro: ${error.message}`;
            } else {
                console.error('Erro desconhecido:', error);
            }

            // Exibe a mensagem de erro tanto no alert quanto no toast
            alert(mensagemErro);
            showToast('danger', `<strong>Erro:</strong> ${mensagemErro}`);
        } finally {
            // Finaliza o estado de envio e prepara o sistema para novas operações
            setEnviando(false);
        }
    };

    const cadastrarAluno = async (e) => {
        e.preventDefault();
        const matricula = e.target.matricula.value;
        if (alunos.some((aluno) => aluno.matricula === matricula)) {
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
            if (resposta.status === 201) {
                e.target.reset();
                showToast('success', 'O cadastro do aluno foi realizado com sucesso.');
                carregarAlunos();
            }
        } catch (erro) {
            showToast('danger', erro.response?.data.mensagem || 'Erro ao cadastrar o aluno');
        }
    };

    const redefinirSenha = async (e) => {
        e.preventDefault();
        try {
            const resposta = await axios.post('/estudantes/redefinir-senha', { matricula: alunoSelecionado.matricula, senha: senhaPadrao });
            if (resposta.status === 200) {
                showToast('success', 'A senha do aluno foi redefinida com sucesso.');
                carregarAlunos();
            }
        } catch (erro) {
            showToast('danger', 'Erro ao redefinir senha do aluno!');
        }
    };

    const excluirAluno = async (e) => {
        e.preventDefault();
        try {
            const resposta = await axios.post('/estudantes/excluir', { matricula: alunoSelecionado.matricula });
            if (resposta.status === 200) {
                showToast('success', 'O cadastro do aluno foi excluído com sucesso.');
                carregarAlunos();
            }
        } catch (erro) {
            showToast('danger', 'Erro ao excluir aluno!');
        }
    };

    const toggleSelectAluno = (matricula) => {
        setAlunosSelecionados((prevSelecionados) =>
            prevSelecionados.includes(matricula)
                ? prevSelecionados.filter((item) => item !== matricula)
                : [...prevSelecionados, matricula]
        );
    };

    const handleSelectAll = (e) => {
        const selecionarTodos = e.target.checked;
        const alunosPaginaAtual = alunosPaginados.map((aluno) => aluno.matricula);
        setAlunosSelecionados(selecionarTodos ? alunosPaginaAtual : []);
    };

    const excluirSelecionados = async () => {
        try {
            const resposta = await axios.post('/estudantes/excluir-multiplos', { matriculas: alunosSelecionados, instituicao: escola.cnpj });
            if (resposta.status === 200) {
                showToast('success', 'Os alunos selecionados foram excluídos com sucesso.');
                setAlunosSelecionados([]); // Limpar a seleção após exclusão
                carregarAlunos(); // Recarregar lista de alunos
                setExclusaoModalAberto(false); // Fechar modal
            }
        } catch (erro) {
            showToast('danger', erro.response?.data.mensagem || 'Erro ao excluir alunos!');
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
                            <span className='d-flex align-items-center gap-2'>
                                <button className='btn fw-normal text-secondary p-0' data-bs-toggle="modal" data-bs-target="#cadastrarLista">
                                    <i className="bi bi-file-earmark-arrow-up fs-4"></i>
                                </button>
                                <button className="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#cadastrarAluno">
                                    <i className="bi bi-person-add"></i>&ensp;Cadastrar
                                </button>
                                {alunosSelecionados.length > 0 && (
                                    <button className='btn btn-danger' data-bs-toggle="modal" data-bs-target="#excluirSelecionadosModal">
                                        <i className="bi bi-trash3-fill"></i>&ensp;Excluir selecionados
                                    </button>
                                )}
                            </span>
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
                                <div className="table-responsive">
                                    <table className="table table-sm table-striped table-hover align-middle">
                                        <thead>
                                            <tr>
                                                <th>
                                                    <span className='form-check m-0'>
                                                        <input className="form-check-input" type="checkbox" onChange={handleSelectAll} checked={alunosPaginados.length > 0 && alunosSelecionados.length === alunosPaginados.length} />
                                                    </span>
                                                </th>
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
                                                        <td className='align-middle'>
                                                            <span className='form-check m-0'>
                                                                <input className="form-check-input" type="checkbox" checked={alunosSelecionados.includes(aluno.matricula)} onChange={() => toggleSelectAluno(aluno.matricula)} />
                                                            </span>
                                                        </td>
                                                        <td className='align-middle'>{aluno.matricula}</td>
                                                        <td className='align-middle'>{aluno.nome}</td>
                                                        <td className='align-middle'>{`${aluno.serie} ${aluno.turma}`}</td>
                                                        <td className='align-middle' colSpan="2">
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
                                                        <td className="d-flex justify-content-end gap-2">
                                                            <button className="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#redefinirSenha" onClick={() => setAlunoSelecionado(aluno)} >
                                                                <i className="bi bi-key-fill"></i>&ensp;Redefinir Senha
                                                            </button>
                                                            <button className="btn btn-sm btn-success" data-bs-toggle="modal" data-bs-target="#editarAluno" onClick={() => setAlunoSelecionado(aluno)} >
                                                                <i className="bi bi-pencil-fill"></i>&ensp;Editar
                                                            </button>
                                                            <button className="btn btn-sm btn-danger" data-bs-toggle="modal" data-bs-target="#excluirAluno" onClick={() => setAlunoSelecionado(aluno)} >
                                                                <i className="bi bi-trash3-fill"></i>&ensp;Excluir
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="7" className="text-center text-muted">
                                                        Nenhum aluno cadastrado.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <p>Mostrando {paginaAtual === 1 ? 1 : (paginaAtual - 1) * itensPorPagina + 1} até {Math.min(paginaAtual * itensPorPagina, alunosFiltradosEOrdenados.length)} de {alunosFiltradosEOrdenados.length} resultados</p>
                                    <ul className="pagination">
                                        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numeroPagina) => (
                                            <li key={numeroPagina} className={`page-item ${paginaAtual === numeroPagina ? 'active' : ''}`}>
                                                <button className="page-link" onClick={() => setPaginaAtual(numeroPagina)}>
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
                <div className="modal-dialog modal-lg">
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
                                <div className="row g-3">
                                    <div className="col-md-3">
                                        <label htmlFor="matricula" className="form-label">Matrícula <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control" id="matricula" name="matricula" required />
                                    </div>
                                    <div className="col-md-9">
                                        <label htmlFor="nome" className="form-label">Nome completo <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control" id="nome" name="nome" required />
                                    </div>

                                    <div className='col-md-6'>
                                        <label htmlFor="serie" className="form-label">Série <span className="text-danger">*</span></label>
                                        <select className="form-select" id="serie" name="serie" required >
                                            <option value="">Selecione...</option>
                                            <option value="1º ano">1º ano</option>
                                            <option value="2º ano">2º ano</option>
                                            <option value="3º ano">3º ano</option>
                                        </select>
                                    </div>
                                    <div className='col-md-6'>
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

            {/* Modal: Cadastrar via planilha */}
            <div className="modal fade" id="cadastrarLista" tabIndex="-1" aria-labelledby="definirPeriodoLabel" aria-hidden="true">
                <div className={`modal-dialog ${loading || dados.length > 0 ? 'modal-dialog-scrollable modal-xl' : ''}`}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className="d-flex align-items-center gap-2">
                                    <i className="bi bi-person-arms-up fs-3"></i>
                                    <h4 className="m-0 fs-4">Estudantes</h4>
                                </span>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Cadastrar via <span className='text-success text-decoration-underline'>Planilha</span></h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>

                        <div className="modal-body">
                            <div className="container">
                                <input type="file" className="form-control" accept=".xls,.xlsx,.csv" onChange={handleFileUpload} />
                                <small className="form-text text-muted">Selecione um arquivo no formato .xls, .xlsx ou .csv</small>

                                {loading ? (
                                    <div className="text-center my-3">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Carregando...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {dados.length > 0 && (
                                            <>
                                                <h5 className="mt-4">Pré-visualização</h5>
                                                <div className="table-responsive">
                                                    <table className="table table-bordered table-hover mt-3">
                                                        <thead className="table-light">
                                                            <tr>
                                                                {Object.keys(dados[0]).map((key) => (
                                                                    <th key={key}>{key}</th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {dados.map((row, index) => (
                                                                <tr key={index}>
                                                                    {Object.values(row).map((value, i) => (
                                                                        <td key={i}>{value}</td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}

                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button className="btn btn-primary" onClick={cadastrarPlanilha} data-bs-dismiss="modal" disabled={enviando || dados.length === 0}>
                                <i className="bi bi-person-add"></i>&ensp;{enviando ? 'Cadastrando...' : 'Cadastrar'}
                            </button>
                        </div>
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
                        <EditarAluno matricula={alunoSelecionado.matricula} />
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

            {/* Modal: Confirmar exclusão dos alunos selecionados */}
            <div className="modal fade" id="excluirSelecionadosModal" tabIndex="-1" aria-labelledby="excluirSelecionadosModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="excluirSelecionadosModalLabel">Excluir Alunos Selecionados</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <p>Você está prestes a excluir os seguintes alunos:</p>
                            <ul>
                                {alunosSelecionados.map((matricula) => {
                                    const aluno = alunos.find((aluno) => aluno.matricula === matricula);
                                    return <li key={matricula}>{aluno?.nome || 'Nome não encontrado'} (Matrícula: {matricula})</li>;
                                })}
                            </ul>
                            <p>Esta ação não pode ser desfeita. Deseja continuar?</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" className="btn btn-danger" onClick={excluirSelecionados} data-bs-dismiss="modal">Excluir</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

const obterClasseBadge = (tipo) => {
    const classes = {
        'Trilha': 'text-bg-primary',
        'Eletiva': 'text-bg-success',
        'Projeto de Vida': 'text-bg-danger',
        'default': 'text-bg-secondary',
    };
    return classes[tipo] || classes['default'];
};
