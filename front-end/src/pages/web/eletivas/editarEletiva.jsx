import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import showToast from '../../../utills/toasts';

export default function EditarEletiva() {
    const [searchParams] = useSearchParams();
    const codigo = searchParams.get('codigo');

    const [nome, setNome] = useState('');
    const [tipo, setTipo] = useState('');
    const [professor, setProfessor] = useState('');
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
            const response = await axios.post('http://localhost:3001/eletivas/buscar', { codigo, instituicao: user.instituicao });
            if (response.status === 200) {
                const eletiva = response.data[0];
                setNome(eletiva.nome);
                setTipo(eletiva.tipo);
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
            const response = await axios.post('http://localhost:3001/eletivas/editar', {
                codigo,
                instituicao: user.instituicao,
                nome,
                tipo,
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
    }

    return (
        <>
            <div id='toast-container' className="toast-container position-absolute bottom-0 start-50 translate-middle-x"></div>
            <div className="box">
                <div className="box-content">
                    <form onSubmit={editarEletiva}>
                        <div>
                            <div className="mb-3">
                                <label htmlFor="nome" className="form-label">Nome</label>
                                <input type="text" className="form-control" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="tipo" className="form-label">Tipo</label>
                                <input type="text" className="form-control" id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="professor" className="form-label">Professor</label>
                                <input type="text" className="form-control" id="professor" value={professor} onChange={(e) => setProfessor(e.target.value)} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="totalAlunos" className="form-label">Total de Alunos</label>
                                <input type="text" className="form-control" id="totalAlunos" value={totalAlunos} onChange={(e) => setTotalAlunos(e.target.value)} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="status" className="form-label">Status</label>
                                <input type="text" className="form-control" id="status" value={status} onChange={(e) => setStatus(e.target.value)} />
                            </div>
                        </div>
                        <button className='btn btn-primary position-absolute bottom-0 end-0' type="submit" disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar alterações'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
