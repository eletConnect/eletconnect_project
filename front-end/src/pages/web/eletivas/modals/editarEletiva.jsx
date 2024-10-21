import React, { useState, useEffect } from 'react';
import axios from '../../../../configs/axios';
import showToast from '../../../../utills/toasts';

export default function ModalEditarEletiva({ codigo, instituicao }) {
    const [eletiva, setEletiva] = useState({
        nome: '',
        tipo: '',
        dia: '',
        horario: '',
        professor: '',
        sala: '',
        total_alunos: '',
        descricao: '',
        serie: '',
        turma: '',
        status: 'Ativo'
    });
    const [isExclusiva, setIsExclusiva] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        // Checar se há mensagem de sucesso no sessionStorage
        const mensagemSucesso = sessionStorage.getItem('mensagemSucesso');
        if (mensagemSucesso) {
            showToast('success', mensagemSucesso);
            sessionStorage.removeItem('mensagemSucesso'); // Remover mensagem após exibir
        }

        if (codigo && instituicao) {
            buscarEletiva();
        }
    }, [codigo, instituicao]);

    const buscarEletiva = async () => {
        if (!codigo) return;

        setCarregando(true);
        try {
            const response = await axios.post('/eletivas/buscar', {
                codigo,
                instituicao
            });

            if (response.status === 200 && response.data.length > 0) {
                const dadosEletiva = response.data[0];
                setEletiva({
                    nome: dadosEletiva.nome || '',
                    tipo: dadosEletiva.tipo || '',
                    dia: dadosEletiva.dia || '',
                    horario: dadosEletiva.horario || '',
                    professor: dadosEletiva.professor || '',
                    sala: dadosEletiva.sala || '',
                    total_alunos: dadosEletiva.total_alunos || '',
                    descricao: dadosEletiva.descricao || '',
                    serie: dadosEletiva.serie || '',
                    turma: dadosEletiva.turma || '',
                    status: dadosEletiva.status || 'Ativo'
                });
                setIsExclusiva(!!dadosEletiva.serie);
            }
        } catch (error) {
            showToast('danger', error.response?.data?.mensagem || 'Erro ao buscar dados da eletiva.');
        } finally {
            setCarregando(false);
        }
    };

    const editarEletiva = async (e) => {
        e.preventDefault();
        setEnviando(true);

        try {
            const response = await axios.post('/eletivas/editar', {
                codigo,
                instituicao,
                ...eletiva,
                total_alunos: parseInt(eletiva.total_alunos, 10),
                serie: isExclusiva ? eletiva.serie : null,
                turma: isExclusiva ? eletiva.turma : null,
                exclusiva: isExclusiva
            });

            if (response.status === 200) {
                sessionStorage.setItem('mensagemSucesso', 'Eletiva atualizada com sucesso.');
                window.location.reload(); // Recarrega a página para aplicar a alteração e exibir a mensagem de sucesso
            }
        } catch (error) {
            showToast('danger', error.response?.data?.mensagem || 'Erro ao editar a eletiva.');
        } finally {
            setEnviando(false);
        }
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setEletiva((prevEletiva) => ({
            ...prevEletiva,
            [id]: id === 'total_alunos' ? parseInt(value, 10) : value
        }));
    };

    const handleRadioChange = (e) => {
        setEletiva((prevEletiva) => ({
            ...prevEletiva,
            tipo: e.target.value
        }));
    };

    return (
        <div className="modal fade" id="editarEletiva" tabIndex="-1" aria-labelledby="editarEletivaLabel" aria-hidden="true">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-journal-bookmark-fill fs-3"></i>
                            <h4 className="m-0 fs-4">Eletivas</h4>
                            <i className="bi bi-arrow-right-short fs-4"></i>
                            <h5 className="m-0">Editar</h5>
                        </div>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <form onSubmit={editarEletiva}>
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
                                        value={eletiva.nome}
                                        onChange={handleChange}
                                        pattern="[A-Za-zÀ-ÿ\s]+" // Aceita letras com acentos e espaços
                                        maxLength="76"  
                                        title="Apenas letras e espaços são permitidos"
                                        required
                                    />
                                    {eletiva.nome.length > 75 && (
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
                                                checked={eletiva.tipo === 'Eletiva'}
                                                onChange={handleRadioChange}
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
                                                checked={eletiva.tipo === 'Projeto de Vida'}
                                                onChange={handleRadioChange}
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
                                                checked={eletiva.tipo === 'Trilha'}
                                                onChange={handleRadioChange}
                                            />
                                            <label className="form-check-label" htmlFor="trilhaRadio">Trilha</label>
                                        </div>
                                    </div>
                                </div>

                                {/* Dia da Semana */}
                                <div className="col-md-6">
                                    <label htmlFor="dia" className="form-label">
                                        Dia da Semana <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className="form-select"
                                        id="dia"
                                        value={eletiva.dia}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="Terça-feira">Terça-feira</option>
                                        <option value="Quinta-feira">Quinta-feira</option>
                                        <option value="Terça-feira e Quinta-feira">Terça-feira e Quinta-feira</option>
                                    </select>
                                </div>

                                {/* Horário */}
                                <div className="col-md-6">
                                    <label htmlFor="horario" className="form-label">
                                        Horário <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className="form-select"
                                        id="horario"
                                        value={eletiva.horario}
                                        onChange={handleChange}
                                        required
                                    >
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
                                        value={eletiva.professor}
                                        onChange={handleChange}
                                        pattern="[A-Za-zÀ-ÿ\s]+" // Apenas letras e espaços
                                        maxLength="51" // Limite de 50 caracteres
                                        title="Apenas letras e espaços são permitidos"
                                        required
                                    />
                                    {eletiva.professor.length > 50 && (
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
                                        value={eletiva.sala}
                                        onChange={handleChange}
                                        pattern="[A-Za-z0-9\s]+" // Letras e números
                                        maxLength="11" // Limite de 10 caracteres
                                        title="Apenas letras e números são permitidos"
                                        required
                                    />
                                    {eletiva.sala.length > 10 && (
                                        <div className="text-danger mt-1">
                                            <small>A sala não pode ultrapassar 10 caracteres.</small>
                                        </div>
                                    )}
                                </div>

                                {/* Total de Alunos */}
                                <div className="col-md-3">
                                    <label htmlFor="total_alunos" className="form-label">
                                        Total de Alunos <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="total_alunos"
                                        value={eletiva.total_alunos}
                                        onChange={handleChange}
                                        min="1" // Limite mínimo
                                        max="101" // Limite máximo
                                        required
                                    />
                                    {(eletiva.total_alunos > 100 || eletiva.total_alunos < 1) && (
                                        <div className="text-danger mt-1">
                                            <small>O total de alunos deve estar entre 1 e 100.</small>
                                        </div>
                                    )}
                                </div>

                                {/* Descrição */}
                                <div className="col-md-12">
                                    <label htmlFor="descricao" className="form-label">Descrição</label>
                                    <textarea
                                        className="form-control"
                                        id="descricao"
                                        value={eletiva.descricao}
                                        onChange={handleChange}
                                        rows="3"
                                        maxLength="501" // Limite de 500 caracteres
                                    />
                                    {eletiva.descricao.length > 500 && (
                                        <div className="text-danger mt-1">
                                            <small>A descrição não pode ultrapassar 500 caracteres.</small>
                                        </div>
                                    )}
                                </div>

                                {/* Exclusividade */}
                                <div className="col-md-12">
                                    <div className="form-check form-switch">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="exclusivaSwitch"
                                            checked={isExclusiva}
                                            onChange={(e) => setIsExclusiva(e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="exclusivaSwitch">Exclusiva para uma turma?</label>
                                    </div>
                                </div>

                                {/* Série e Turma (Exclusiva) */}
                                {isExclusiva && (
                                    <div className="col-md-12">
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label htmlFor="serie" className="form-label">Série <span className="text-danger">*</span></label>
                                                <select
                                                    className="form-select"
                                                    id="serie"
                                                    value={eletiva.serie}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    <option value="">Selecione...</option>
                                                    <option value="1º ano">1º ano</option>
                                                    <option value="2º ano">2º ano</option>
                                                    <option value="3º ano">3º ano</option>
                                                    <option value="4º ano">4º ano</option>
                                                </select>
                                            </div>

                                            <div className="col-md-6">
                                                <label htmlFor="turma" className="form-label">Turma <span className="text-danger">*</span></label>
                                                <select
                                                    className="form-select"
                                                    id="turma"
                                                    value={eletiva.turma}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    <option value="">Selecione...</option>
                                                    {[...Array(26)].map((_, i) => {
                                                        const turma = String.fromCharCode(65 + i); // Gera opções de 'A' a 'Z'
                                                        return <option key={turma} value={turma}>{turma}</option>;
                                                    })}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="submit" className="btn btn-success" disabled={enviando || carregando}>
                                {enviando ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Editando...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-pencil-fill"></i>&ensp;Editar
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
