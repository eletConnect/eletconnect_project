import React, { useState } from 'react';
import showToast from '../../../../utills/toasts';
import axios from '../../../../configs/axios';

export default function ModalCadastrarEletiva({ usuario }) {
    const [isExclusiva, setIsExclusiva] = useState(false);
    const [enviando, setEnviando] = useState(false); // Estado para indicar envio
    const [nome, setNome] = useState('');
    const [tipo, setTipo] = useState('');
    const [dia, setDia] = useState('');
    const [horario, setHorario] = useState('');
    const [professor, setProfessor] = useState('');
    const [sala, setSala] = useState('');
    const [totalAlunos, setTotalAlunos] = useState('');
    const [serie, setSerie] = useState('');
    const [turma, setTurma] = useState('');

    const cadastrarEletiva = async (e) => {
        e.preventDefault();
        setEnviando(true); // Define estado de envio

        const novaEletiva = {
            instituicao: usuario.instituicao,
            nome,
            tipo,
            dia,
            horario,
            professor,
            sala,
            total_alunos: totalAlunos,
            status: 'Ativo',
            exclusiva: isExclusiva,
            serie: isExclusiva ? serie : null,
            turma: isExclusiva ? turma : null,
        };

        try {
            const resposta = await axios.post('/eletivas/cadastrar', novaEletiva);
            if (resposta.status === 201) {
                sessionStorage.setItem('mensagemSucesso', resposta.data.mensagem); // Armazenar a mensagem de sucesso
                window.location.reload(); // Recarregar a página para aplicar a alteração
            }
        } catch (erro) {
            showToast('danger', erro.response?.data.mensagem || 'Erro ao cadastrar a eletiva');
        } finally {
            setEnviando(false); // Libera o botão de envio
        }
    };

    return (
        <div className="modal fade" id="cadastrarEletiva" tabIndex="-1" aria-labelledby="cadastrarEletivaLabel" aria-hidden="true">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-journal-bookmark-fill fs-3"></i>
                            <h4 className='m-0 fs-4'>Eletivas</h4>
                            <i className="bi bi-arrow-right-short fs-4"></i>
                            <h5 className="m-0">Cadastrar</h5>
                        </div>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <form onSubmit={cadastrarEletiva}>
                        <div className="modal-body">
                            <div className="row g-3">
                                {/* Nome da Eletiva */}
                                <div className="col-md-6">
                                    <label htmlFor="nome" className="form-label">
                                        Nome da Eletiva <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="nome"
                                        value={nome}
                                        onChange={(e) => setNome(e.target.value)}
                                        pattern="[A-Za-zÀ-ÿ\s]+" // Aceita apenas letras com acentos e espaços
                                        maxLength="76" // Limite de 75 caracteres
                                        title="Apenas letras e espaços são permitidos"
                                        required
                                    />
                                    {nome.length > 75 && (
                                        <div className="text-danger mt-1">
                                            <small>O nome não pode ultrapassar 75 caracteres.</small>
                                        </div>
                                    )}
                                </div>

                                {/* Tipo de Eletiva */}
                                <div className="col-md-6">
                                    <label htmlFor="tipo" className="form-label">
                                        Tipo <span className="text-danger">*</span>
                                    </label>
                                    <div className="d-flex justify-content-between">
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                id="eletivaRadio"
                                                name="tipo"
                                                value="Eletiva"
                                                checked={tipo === 'Eletiva'}
                                                onChange={(e) => setTipo(e.target.value)}
                                                required
                                            />
                                            <label className="form-check-label" htmlFor="eletivaRadio">Eletiva</label>
                                        </div>
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                id="projetoVidaRadio"
                                                name="tipo"
                                                value="Projeto de Vida"
                                                checked={tipo === 'Projeto de Vida'}
                                                onChange={(e) => setTipo(e.target.value)}
                                            />
                                            <label className="form-check-label" htmlFor="projetoVidaRadio">Projeto de Vida</label>
                                        </div>
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                id="trilhaRadio"
                                                name="tipo"
                                                value="Trilha"
                                                checked={tipo === 'Trilha'}
                                                onChange={(e) => setTipo(e.target.value)}
                                            />
                                            <label className="form-check-label" htmlFor="trilhaRadio">Trilha</label>
                                        </div>
                                    </div>
                                </div>

                                {/* Dia e Horário */}
                                <div className="col-md-6">
                                    <label htmlFor="dia" className="form-label">
                                        Dia da semana <span className="text-danger">*</span>
                                    </label>
                                    <select className="form-select" id="dia" value={dia} onChange={(e) => setDia(e.target.value)} required>
                                        <option value="">Selecione...</option>
                                        <option value="Terça-feira">Terça-feira</option>
                                        <option value="Quinta-feira">Quinta-feira</option>
                                        <option value="Terça-feira e Quinta-feira">Terça-feira e Quinta-feira</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="horario" className="form-label">
                                        Horário <span className="text-danger">*</span>
                                    </label>
                                    <select className="form-select" id="horario" value={horario} onChange={(e) => setHorario(e.target.value)} required>
                                        <option value="">Selecione...</option>
                                        <option value="1º e 2º horário">1º e 2º horário</option>
                                        <option value="3º e 4º horário">3º e 4º horário</option>
                                        <option value="5º e 6º horário">5º e 6º horário</option>
                                    </select>
                                </div>

                                {/* Professor */}
                                <div className="col-md-6">
                                    <label htmlFor="professor" className="form-label">
                                        Professor <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="professor"
                                        value={professor}
                                        onChange={(e) => setProfessor(e.target.value)}
                                        pattern="[A-Za-zÀ-ÿ\s]+" // Apenas letras e espaços
                                        maxLength="51" // Limite de 50 caracteres
                                        title="Apenas letras e espaços são permitidos"
                                        required
                                    />
                                    {professor.length > 50 && (
                                        <div className="text-danger mt-1">
                                            <small>O nome do professor não pode ultrapassar 50 caracteres.</small>
                                        </div>
                                    )}
                                </div>

                                {/* Sala */}
                                <div className="col-md-3">
                                    <label htmlFor="sala" className="form-label">
                                        Sala <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="sala"
                                        value={sala}
                                        onChange={(e) => setSala(e.target.value)}
                                        pattern="[A-Za-z0-9\s]+" // Letras e números
                                        maxLength="11" // Limite de 10 caracteres
                                        title="Apenas letras e números são permitidos"
                                        required
                                    />
                                    {sala.length > 10 && (
                                        <div className="text-danger mt-1">
                                            <small>A sala não pode ultrapassar 10 caracteres.</small>
                                        </div>
                                    )}
                                </div>

                                {/* Total de Alunos */}
                                <div className="col-md-3">
                                    <label htmlFor="totalAlunos" className="form-label">
                                        Total de Alunos <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="totalAlunos"
                                        value={totalAlunos}
                                        onChange={(e) => setTotalAlunos(e.target.value)}
                                        min="1" // Limite mínimo
                                        max="101" // Limite máximo
                                        required
                                    />
                                    {(totalAlunos > 100 || totalAlunos < 1) && (
                                        <div className="text-danger mt-1">
                                            <small>O total de alunos deve estar entre 1 e 100.</small>
                                        </div>
                                    )}
                                </div>

                                {/* Exclusiva para turma */}
                                <div className="col-md-12">
                                    <div className="form-check form-switch">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="exclusivaSwitch"
                                            checked={isExclusiva === true}
                                            onChange={() => setIsExclusiva(isExclusiva === true ? false : true)}
                                        />
                                        <label className="form-check-label" htmlFor="exclusivaSwitch">Exclusiva para uma turma?</label>
                                    </div>

                                    {isExclusiva && (
                                        <div className="row">
                                            <div className="col-md-6">
                                                <label htmlFor="serie" className="form-label">Série <span className="text-danger">*</span></label>
                                                <select className="form-select" id="serie" value={serie} onChange={(e) => setSerie(e.target.value)} required>
                                                    <option value="">Selecione...</option>
                                                    <option value="1º ano">1º ano</option>
                                                    <option value="2º ano">2º ano</option>
                                                    <option value="3º ano">3º ano</option>
                                                </select>
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="turma" className="form-label">Turma <span className="text-danger">*</span></label>
                                                <select className="form-select" id="turma" value={turma} onChange={(e) => setTurma(e.target.value)} required>
                                                    <option value="">Selecione...</option>
                                                    {[...Array(26)].map((_, i) => {
                                                        const turmaLetra = String.fromCharCode(65 + i); // Turmas de 'A' a 'Z'
                                                        return (
                                                            <option key={turmaLetra} value={turmaLetra}>
                                                                {turmaLetra}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="submit" className="btn btn-primary" disabled={enviando}>
                                {enviando ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Cadastrando...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-clipboard-plus"></i>&ensp;Cadastrar
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    );
}
