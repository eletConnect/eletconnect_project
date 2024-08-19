import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from '../../../configs/axios';
import showToast from '../../../utills/toasts';

export default function EditarEletiva() {
    const [searchParams] = useSearchParams();
    const codigo = searchParams.get('codigo');

    const [nome, setNome] = useState('');
    const [tipo, setTipo] = useState('');
    const [professor, setProfessor] = useState('');
    const [sala, setSala] = useState('');
    const [dia, setDia] = useState('');
    const [horario, setHorario] = useState('');
    const [totalAlunos, setTotalAlunos] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const user = JSON.parse(sessionStorage.getItem('user'));

    useEffect(() => {
        if (codigo && user?.instituicao) {
            buscarEletiva();
        }
    }, []);

    const buscarEletiva = async () => {
        try {
            const response = await axios.post('/eletivas/buscar', { codigo, instituicao: user.instituicao });
            if (response.status === 200) {
                const eletiva = response.data[0];
                setNome(eletiva.nome);
                setTipo(eletiva.tipo);
                setSala(eletiva.sala);
                setDia(eletiva.dia);
                setHorario(eletiva.horario);
                setProfessor(eletiva.professor);
                setTotalAlunos(eletiva.total_alunos);
                setStatus(eletiva.status);
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
                nome,
                tipo,
                dia,
                horario,
                sala,
                professor,
                total_alunos: totalAlunos,
                status
            });
            if (response.status === 200) {
                showToast('success', 'Eletiva editada com sucesso');
                buscarEletiva();
            }
        } catch (error) {
            console.error(error);
            showToast('danger', 'Erro ao editar a eletiva');
        }

        setLoading(false);
    };

    return (
        <>
            <div id='toast-container' className="toast-container position-absolute bottom-0 start-50 translate-middle-x"></div>
            <div className="p-4 ">
                <form className="row g-3">
                    <div className="col-md-6">
                        <label htmlFor="nome" className="form-label">Nome <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" id="nome" value={nome || ""} onChange={(e) => setNome(e.target.value)} required />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="professor" className="form-label">Professor <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" id="professor" value={professor || ""} onChange={(e) => setProfessor(e.target.value)} required />
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="tipo" className="form-label">Tipo <span className="text-danger">*</span></label>
                        <select className="form-select" id="tipo" value={tipo || ""} onChange={(e) => setTipo(e.target.value)} required>
                            <option value="Eletiva">Eletiva</option>
                            <option value="Projeto de Vida">Projeto de Vida</option>
                            <option value="Trilha">Trilha</option>
                        </select>
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="sala" className="form-label">Sala <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" id="sala" value={sala || ""} onChange={(e) => setSala(e.target.value)} required />
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="totalAlunos" className="form-label">Total de Alunos <span className="text-danger">*</span></label>
                        <input type="number" className="form-control" id="totalAlunos" value={totalAlunos || ""} onChange={(e) => setTotalAlunos(e.target.value)} required />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="dia" className="form-label">Dia da Semana <span className="text-danger">*</span></label>
                        <select className="form-select" id="dia" value={dia || ""} onChange={(e) => setDia(e.target.value)} required>
                            <option value="Terça-feira">Terça-feira</option>
                            <option value="Quinta-feira">Quinta-feira</option>
                            <option value="Terça-feira e Quinta-feira">Terça-feira e Quinta-feira</option>
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="horario" className="form-label">Horário <span className="text-danger">*</span></label>
                        <select className="form-select" id="horario" value={horario || ""} onChange={(e) => setHorario(e.target.value)} required>
                            <option value="1º e 2º horário">1º e 2º horário</option>
                            <option value="3º e 4º horário">3º e 4º horário</option>
                            <option value="5º e 6º horário">5º e 6º horário</option>
                            <option value="1º, 2º, 3º e 4º horário">1º, 2º, 3º e 4º horário</option>
                            <option value="3º, 4º, 5º e 6º horário">3º, 4º, 5º e 6º horário</option>
                        </select>
                    </div>
                </form>
                <button className='btn btn-primary position-absolute bottom-0 end-0' onClick={editarEletiva} disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar alterações'}
                </button>
            </div>
        </>
    );
}
