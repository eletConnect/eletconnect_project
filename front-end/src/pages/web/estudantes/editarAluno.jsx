import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from '../../../configs/axios';
import showToast from '../../../utills/toasts';
import supabase from '../../../configs/supabase';

export default function EditarAluno() {
    const [searchParams] = useSearchParams();
    const matricula = searchParams.get('matricula') || '';

    const [dadosAluno, setDadosAluno] = useState({
        matricula: matricula,
        instituicao: '',
        nome: '',
        serie: '',
        turma: '',
        email: '',
        status: 'Ativo',
        foto: null,
        fotoUrl: '',
    });

    const [carregando, setCarregando] = useState(false);
    const [eletivasAluno, setEletivasAluno] = useState([]);

    useEffect(() => {
        if (dadosAluno.matricula) {
            carregarDadosAluno();
        }
    }, [dadosAluno.matricula]);

    useEffect(() => {
        if (dadosAluno.instituicao) {
            carregarEletivasAluno();
        }
    }, [dadosAluno.instituicao]);

    const carregarDadosAluno = async () => {
        try {
            const resposta = await axios.post(`/estudantes/consultar`, { matricula: dadosAluno.matricula });
            
            // Verificação se o dado existe e possui conteúdo
            if (resposta.status === 200 && resposta.data && resposta.data.alunoData && resposta.data.alunoData.length > 0) {
                const aluno = resposta.data.alunoData[0];
                setDadosAluno(prevDados => ({
                    ...prevDados,
                    instituicao: aluno.instituicao || '',
                    nome: aluno.nome || '',
                    serie: aluno.serie || '',
                    turma: aluno.turma || '',
                    email: aluno.email || '',
                    status: aluno.status || 'Ativo',
                    fotoUrl: aluno.foto || 'https://th.bing.com/th/id/OIP.nIbVpOVMQV4rYGUVTKTbSQHaJ4?w=1200&h=1600&rs=1&pid=ImgDetMain',
                }));
            } else {
                showToast('warning', 'Aluno não encontrado ou resposta inválida.');
            }
        } catch (erro) {
            console.error('Erro ao buscar dados do aluno:', erro);
            showToast('danger', 'Erro ao buscar dados do aluno.');
        }
    };
    

    const carregarEletivasAluno = async () => {
        try {
            const resposta = await axios.post(`/eletivas/listarEletivasAluno`, { matricula: dadosAluno.matricula, instituicao: dadosAluno.instituicao });
            if (resposta.status === 200 && resposta.data.length > 0) {
                setEletivasAluno(resposta.data);
            } else {
                setEletivasAluno([]); // Reseta a lista de eletivas
            }
        } catch (erro) {
            console.error(erro);
            showToast('danger', 'Erro ao buscar as eletivas do aluno');
        }
    };

    const aoMudarFoto = (evento) => {
        const arquivo = evento.target.files[0];
        if (arquivo) {
            setDadosAluno(prevDados => ({
                ...prevDados,
                foto: arquivo,
                fotoUrl: URL.createObjectURL(arquivo)
            }));
        }
    };

    const armazenarFoto = async () => {
        if (!dadosAluno.foto) return dadosAluno.fotoUrl;

        const caminhoFoto = `FOTO_${Date.now()}`;

        try {
            const { data, error } = await supabase.storage.from('studentPhoto').upload(caminhoFoto, dadosAluno.foto);
            if (error) {
                showToast('danger', error.message);
                return null;
            }

            const { publicUrl, error: erroPublicUrl } = await supabase.storage.from('studentPhoto').getPublicUrl(caminhoFoto);
            if (erroPublicUrl) {
                showToast('danger', erroPublicUrl.message);
                return null;
            }

            return publicUrl.publicUrl; // Corrige o retorno da URL pública
        } catch (erro) {
            showToast('danger', 'Erro ao armazenar a foto.');
            return null;
        }
    };

    const aoSalvar = async () => {
        setCarregando(true);
        try {
            const urlFoto = await armazenarFoto();
            if (!urlFoto) {
                setCarregando(false);
                return;
            }

            const resposta = await axios.post(`/estudantes/editar`, {
                matricula: dadosAluno.matricula,
                nome: dadosAluno.nome,
                serie: dadosAluno.serie,
                turma: dadosAluno.turma,
                email: dadosAluno.email,
                status: dadosAluno.status,
                foto: urlFoto
            });

            if (resposta.status === 200) {
                showToast('success', 'Aluno atualizado com sucesso');
            } else {
                showToast('warning', 'Ocorreu um problema ao atualizar o aluno');
            }
        } catch (erro) {
            console.error(erro);
            showToast('danger', 'Erro ao atualizar aluno');
        } finally {
            setCarregando(false);
        }
    };

    const obterClasseBadge = (tipo) => {
        switch (tipo) {
            case 'Trilha':
                return 'text-bg-primary';
            case 'Eletiva':
                return 'text-bg-success';
            case 'Projeto de Vida':
                return 'text-bg-danger';
            default:
                return 'text-bg-secondary';
        }
    };

    return (
        <>
            <div id='toast-container' className="toast-container position-absolute bottom-0 start-50 translate-middle-x"></div>
            <div className="box">
                <div className='m-4 d-flex gap-4'>
                    <div className="d-flex flex-column align-items-center gap-3">
                        <img width={300} height={400} src={dadosAluno.fotoUrl || 'https://th.bing.com/th/id/OIP.nIbVpOVMQV4rYGUVTKTbSQHaJ4?w=1200&h=1600&rs=1&pid=ImgDetMain'} alt="Foto do aluno" />
                        <input type="file" onChange={aoMudarFoto} />
                    </div>
                    <div className="w-75">
                        <form className="row g-3">
                            <div className="col-md-4">
                                <label htmlFor="matricula" className="form-label">Matrícula</label>
                                <input type="text" className="form-control" id="matricula" value={dadosAluno.matricula || ''} onChange={e => setDadosAluno({ ...dadosAluno, matricula: e.target.value })} required aria-required="true" readOnly />
                            </div>

                            <div className="col-md-4">
                                <div className="mb-3 d-flex gap-4">
                                    <div>
                                        <label htmlFor="serie" className="form-label">Série <span className="text-danger">*</span></label>
                                        <select className="form-select" id="serie" value={dadosAluno.serie || ''} onChange={e => setDadosAluno({ ...dadosAluno, serie: e.target.value })} required aria-required="true" >
                                            <option value="" disabled>Selecione...</option>
                                            <option value="1º ano">1º ano</option>
                                            <option value="2º ano">2º ano</option>
                                            <option value="3º ano">3º ano</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="turma" className="form-label">Turma <span className="text-danger">*</span></label>
                                        <select className="form-select" id="turma" value={dadosAluno.turma || ''} onChange={e => setDadosAluno({ ...dadosAluno, turma: e.target.value })} required aria-required="true" >
                                            <option value="" disabled>Selecione...</option>
                                            <option value="A">A</option>
                                            <option value="B">B</option>
                                            <option value="C">C</option>
                                            <option value="D">D</option>
                                            <option value="E">E</option>
                                            <option value="F">F</option>
                                            <option value="G">G</option>
                                            <option value="H">H</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="nomeCompleto" className="form-label">Nome completo</label>
                                <input type="text" className="form-control" id="nomeCompleto" value={dadosAluno.nome || ''} onChange={e => setDadosAluno({ ...dadosAluno, nome: e.target.value })} required aria-required="true" />
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="email" className="form-label">E-mail</label>
                                <input type="email" className="form-control" id="email" value={dadosAluno.email || ''} onChange={e => setDadosAluno({ ...dadosAluno, email: e.target.value })} />
                            </div>
                        </form>

                        <h5 className="mt-4">Eletivas</h5>
                        <div>
                            {eletivasAluno.length > 0 ? (
                                eletivasAluno.map((eletiva, index) => (
                                    <span key={index} className={`badge ${obterClasseBadge(eletiva.tipo)} me-1`} style={{ fontSize: '1rem' }}>
                                        {eletiva.nome}
                                    </span>
                                ))
                            ) : (
                                <p className='text-muted'>Nenhuma eletiva encontrada</p>
                            )}
                        </div>
                    </div>
                </div>
                <button className='btn btn-primary position-absolute bottom-0 end-0' onClick={aoSalvar} disabled={carregando}>
                    {carregando ? 'Salvando...' : 'Salvar alterações'}
                </button>
            </div>
        </>
    );
}
