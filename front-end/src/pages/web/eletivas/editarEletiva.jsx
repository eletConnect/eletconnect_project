import React, { useState, useEffect } from 'react';
import axios from '../../../configs/axios';
import showToast from '../../../utills/toasts';

export default function EditarEletiva({ codigo }) {
    const [eletiva, setEletiva] = useState({});
    const [loading, setLoading] = useState(false);
    const [isExclusiva, setIsExclusiva] = useState(false); // Estado para controlar a exclusividade da eletiva

    const user = JSON.parse(sessionStorage.getItem('user'));

    useEffect(() => {
        if (codigo && user?.instituicao) {
            buscarEletiva();
        }
    }, [codigo]);

    const buscarEletiva = async () => {
        try {
            const response = await axios.post('/eletivas/buscar', { codigo, instituicao: user.instituicao });
            if (response.status === 200) {
                const eletivaData = response.data[0] || {};
                setEletiva(eletivaData);
                setIsExclusiva(!!eletivaData.serie); // Define se a eletiva é exclusiva com base se a série está preenchida
            }
        } catch (error) {
            console.error(error);
            showToast('danger', 'Erro ao buscar a eletiva');
        }
    };

    const editarEletiva = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('/eletivas/editar', {
                codigo,
                instituicao: user.instituicao,
                ...eletiva,
                total_alunos: parseInt(eletiva.total_alunos, 10), // Garantir que seja numérico
                serie: isExclusiva ? eletiva.serie : null, // Define série como null se não for exclusiva
                turma: isExclusiva ? eletiva.turma : null, // Define turma como null se não for exclusiva
                exclusiva: isExclusiva // Define exclusividade como true ou false
            });
            if (response.status === 200) {
                showToast('success', 'A eletiva foi editada com sucesso');
                buscarEletiva();  // Recarregar os dados da eletiva após a edição
            }
        } catch (error) {
            console.error(error);
            showToast('danger', 'Erro ao editar a eletiva');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setEletiva(prevEletiva => ({
            ...prevEletiva,
            [id]: id === 'total_alunos' ? parseInt(value, 10) : value // Converte total_alunos para número
        }));
    };

    return (
        <>
            <div id='toast-container' className="toast-container position-absolute bottom-0 start-50 translate-middle-x"></div>
            <div className="p-4">
                <form className="row g-3" onSubmit={editarEletiva}>
                    <div className="col-md-6">
                        <label htmlFor="nome" className="form-label">Nome <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" id="nome" value={eletiva.nome || ""} onChange={handleChange} required />
                    </div>
                    {/* Tipo usando radio buttons */}
                    <div className="col-md-6">
                        <label htmlFor="tipo" className="form-label">Tipo <span className="text-danger">*</span></label>
                        <div className="d-flex justify-content-between">
                            <div className="form-check">
                                <input className="form-check-input" type="radio" id="eletivaRadio" name="tipo" value="Eletiva" checked={eletiva.tipo === 'Eletiva'} onChange={handleChange} required />
                                <label className="form-check-label" htmlFor="eletivaRadio">Eletiva</label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="radio" id="projetoVidaRadio" name="tipo" value="Projeto de Vida" checked={eletiva.tipo === 'Projeto de Vida'} onChange={handleChange} />
                                <label className="form-check-label" htmlFor="projetoVidaRadio">Projeto de Vida</label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="radio" id="trilhaRadio" name="tipo" value="Trilha" checked={eletiva.tipo === 'Trilha'} onChange={handleChange} />
                                <label className="form-check-label" htmlFor="trilhaRadio">Trilha</label>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="professor" className="form-label">Professor <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" id="professor" value={eletiva.professor || ""} onChange={handleChange} required />
                    </div>
                    <div className="col-md-3">
                        <label htmlFor="sala" className="form-label">Sala <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" id="sala" value={eletiva.sala || ""} onChange={handleChange} required />
                    </div>
                    <div className="col-md-3">
                        <label htmlFor="total_alunos" className="form-label">Total de Alunos <span className="text-danger">*</span></label>
                        <input type="number" className="form-control" id="total_alunos" value={eletiva.total_alunos || ""} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="dia" className="form-label">Dia da Semana <span className="text-danger">*</span></label>
                        <select className="form-select" id="dia" value={eletiva.dia || ""} onChange={handleChange} required>
                            <option value="Terça-feira">Terça-feira</option>
                            <option value="Quinta-feira">Quinta-feira</option>
                            <option value="Terça-feira e Quinta-feira">Terça-feira e Quinta-feira</option>
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="horario" className="form-label">Horário <span className="text-danger">*</span></label>
                        <select className="form-select" id="horario" value={eletiva.horario || ""} onChange={handleChange} required>
                            <option value="1º e 2º horário">1º e 2º horário</option>
                            <option value="3º e 4º horário">3º e 4º horário</option>
                            <option value="5º e 6º horário">5º e 6º horário</option>
                        </select>
                    </div>

                    {/* Exclusiva para uma turma */}
                    <div className="form-check form-switch col-md-12">
                        <input className="form-check-input" type="checkbox" role="switch" id="exclusivaSwitch" checked={isExclusiva} onChange={e => setIsExclusiva(e.target.checked)} />
                        <label className="form-check-label" htmlFor="exclusivaSwitch">Exclusiva para uma turma?</label>
                    </div>

                    {/* Série e Turma */}
                    {isExclusiva && (
                        <div className="col-md-12">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label htmlFor="serie" className="form-label">Série <span className="text-danger">*</span></label>
                                    <select className="form-select" id="serie" value={eletiva.serie || ""} onChange={handleChange} required>
                                        <option value="">Selecione...</option>
                                        <option value="1º ano">1º ano</option>
                                        <option value="2º ano">2º ano</option>
                                        <option value="3º ano">3º ano</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="turma" className="form-label">Turma <span className="text-danger">*</span></label>
                                    <select className="form-select" id="turma" value={eletiva.turma || ""} onChange={handleChange} required>
                                        <option value="">Selecione...</option>
                                        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(turma => (
                                            <option key={turma} value={turma}>{turma}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="col-md-12">
                        <label htmlFor="descricao" className="form-label">Descrição</label>
                        <textarea className="form-control" id="descricao" value={eletiva.descricao || ""} onChange={handleChange} rows="3"></textarea>
                    </div>
                    <div className="text-end">
                        <button type="submit" className="btn btn-success" disabled={loading}>
                            <i className="bi bi-pencil-fill"></i>&ensp;{loading ? 'Editando...' : 'Editar'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
