import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../../../components/header';
import axios from 'axios';
import showToast from '../../../utills/toasts';
import supabase from '../../../utills/supabase';

export default function VisualizarAluno() {
    const [searchParams] = useSearchParams();
    const matricula = searchParams.get('matricula');
    const [aNome, setANome] = useState('');
    const [aTurma, setATurma] = useState('');
    const [aEmail, setAEmail] = useState('');
    const [aStatus, setAStatus] = useState('');
    const [aFotoUrl, setAFotoUrl] = useState('');

    useEffect(() => {
        if (matricula) {
            getAluno();
        }
    }, [matricula]);

    const getAluno = async () => {
        try {
            const response = await axios.post(`http://localhost:3001/aluno/consultar`, { matricula });
            if (response.status === 200) {
                const aluno = response.data.alunoData[0];
                setANome(aluno.nome);
                setATurma(aluno.turma);
                setAEmail(aluno.email);
                setAStatus(aluno.status);
                setAFotoUrl(aluno.foto || 'https://th.bing.com/th/id/OIP.nIbVpOVMQV4rYGUVTKTbSQHaJ4?w=1200&h=1600&rs=1&pid=ImgDetMain');
            }
        } catch (error) {
            console.error(error);
            showToast('danger', 'Erro ao buscar aluno');
        }
    };

    return (
        <>
            <div id='toast-container' className="toast-container position-fixed bottom-0 end-0 p-3"></div>
            <div className="box">
                <div className='m-4 d-flex gap-4'>
                    <div className="d-flex flex-column align-items-center gap-3">
                        <img width={300} height={400} src={aFotoUrl} alt="Foto do aluno" />
                    </div>
                    <div className="w-100">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label htmlFor="matricula" className="form-label">Matricula</label>
                                <input type="text" className="form-control" id="matricula" value={matricula || ''} readOnly />
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="turma" className="form-label">Turma</label>
                                <input type="text" className="form-control" id="turma" value={aTurma} readOnly />
                            </div>
                            <div className="col-md-3">
                                <label htmlFor="status" className="form-label">Status</label>
                                <input type="text" className="form-control" id="status" value={aStatus} readOnly />
                            </div>
                            <div className="col-md-6">
                                <label htmlFor="nome" className="form-label">Nome completo</label>
                                <input type="text" className="form-control" id="nome" value={aNome} readOnly />
                            </div>
                            <div className="col-md-6">
                                <label htmlFor="email" className="form-label">E-mail</label>
                                <input type="email" className="form-control" id="email" value={aEmail} readOnly />
                            </div>
                            <h4>Eletivas:</h4>
                            {/* Adicionar código para exibir eletivas, se necessário */}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
