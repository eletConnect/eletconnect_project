import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import showToast from '../../../utills/toasts';
import supabase from '../../../utills/supabase'; // Assuming supabase is properly configured and exported from this file

export default function EditarAluno() {
    const [searchParams] = useSearchParams();
    const matricula = searchParams.get('matricula');
    const [aMatricula, setAMatricula] = useState(matricula || '');
    const [aNome, setANome] = useState('');
    const [aTurma, setATurma] = useState('');
    const [aEmail, setAEmail] = useState('');
    const [aStatus, setAStatus] = useState('');
    const [aFoto, setAFoto] = useState(null);
    const [aFotoUrl, setAFotoUrl] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (aMatricula) {
            getAluno();
        }
    }, [aMatricula]);

    const getAluno = async () => {
        try {
            const response = await axios.post(`http://localhost:3001/estudantes/consultar`, { matricula });
            if (response.status === 200) {
                const aluno = response.data.alunoData[0];
                setANome(aluno.nome);
                setATurma(aluno.turma);
                setAEmail(aluno.email);
                setAStatus(aluno.status || 'Ativo');
                setAFotoUrl(aluno.foto || 'https://th.bing.com/th/id/OIP.nIbVpOVMQV4rYGUVTKTbSQHaJ4?w=1200&h=1600&rs=1&pid=ImgDetMain');
            }
        } catch (error) {
            console.error(error);
            showToast('danger', 'Erro ao buscar aluno');
        }
    };

    const fotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAFoto(file);
            const previewUrl = URL.createObjectURL(file);
            setAFotoUrl(previewUrl);
        }
    };

    const armazenarFoto = async () => {
        if (!aFoto) return aFotoUrl;

        const pathF = `FOTO_${Date.now()}`;

        try {
            const { data, error } = await supabase.storage.from('studentPhoto').upload(pathF, aFoto);
            if (error) {
                showToast('danger', error.message);
                return null;
            }

            const { publicUrl, error: publicUrlError } = await supabase.storage.from('studentPhoto').getPublicUrl(pathF);
            if (publicUrlError) {
                showToast('danger', publicUrlError.message);
                return null;
            }

            return publicUrl;
        } catch (error) {
            showToast('danger', 'Erro ao armazenar a foto.');
            return null;
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const fotoUrl = await armazenarFoto();
            if (!fotoUrl) {
                setLoading(false);
                return;
            }

            const response = await axios.post(`http://localhost:3001/estudantes/editar`, {
                matricula: aMatricula,
                nome: aNome,
                turma: aTurma,
                email: aEmail,
                status: aStatus,
                foto: fotoUrl // Ensure the correct URL is used
            });

            if (response.status === 200) {
                showToast('success', 'Aluno atualizado com sucesso');
            }
        } catch (error) {
            console.error(error);
            showToast('danger', 'Erro ao atualizar aluno');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div id='toast-container' className="toast-container position-absolute bottom-0 start-50 translate-middle-x"></div>
            <div className="box">
                <div className='m-4 d-flex gap-4'>
                    <div className="d-flex flex-column align-items-center gap-3">
                        <img width={300} height={400} src={aFotoUrl || 'https://th.bing.com/th/id/OIP.nIbVpOVMQV4rYGUVTKTbSQHaJ4?w=1200&h=1600&rs=1&pid=ImgDetMain'} alt="Foto do aluno" />
                        <input type="file" onChange={fotoChange} />
                    </div>
                    <div className="w-75">
                        <form className="row g-3">
                            <div className="col-md-4">
                                <label htmlFor="validationCustom01" className="form-label">Matricula</label>
                                <input type="text" className="form-control" id="validationCustom01" value={aMatricula} onChange={e => setAMatricula(e.target.value)} required />
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="validationCustom02" className="form-label">Turma</label>
                                <input type="text" className="form-control" id="validationCustom02" value={aTurma} onChange={e => setATurma(e.target.value)} required />
                            </div>
                            <div className="col-md-3">
                                <label htmlFor="validationCustom04" className="form-label">Status</label>
                                <select className="form-select" id="validationCustom04" value={aStatus} onChange={e => setAStatus(e.target.value)} required >
                                    <option value="Ativo" >Ativo</option>
                                    <option value="Inativo">Inativo</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label htmlFor="validationCustom02" className="form-label">Nome completo</label>
                                <input type="text" className="form-control" id="validationCustom02" value={aNome} onChange={e => setANome(e.target.value)} required />
                            </div>
                            <div className="col-md-6">
                                <label htmlFor="validationCustom03" className="form-label">E-mail</label>
                                <input type="text" className="form-control" id="validationCustom03" value={aEmail} onChange={e => setAEmail(e.target.value)} />
                            </div>
                            {/* Removed the misplaced heading for eletivas */}
                        </form>
                    </div>
                </div>
                <button className='btn btn-primary position-absolute bottom-0 end-0' onClick={handleSave} disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar alterações'}
                </button>
            </div>

        </>
    );
}
