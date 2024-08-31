import React, { useState, useEffect } from 'react';
import axios from '../../../../../configs/axios';
import showToast from '../../../../../utills/toasts';
import supabase from '../../../../../configs/supabase';

export default function EditarColaborador({ matricula }) { 
    const escola = JSON.parse(sessionStorage.getItem('escola'));

    const [dadosColaborador, setDadosColaborador] = useState({
        matricula: '',
        instituicao: '',
        nome: '',
        cargo: '',
        email: '',
        status: 'Ativo',
        foto: null,
        fotoUrl: '',
    });

    const [carregando, setCarregando] = useState(false);

    useEffect(() => {
        if (matricula) {
            carregarDadosColaborador(matricula);
        }
    }, [matricula]);

    const carregarDadosColaborador = async (matricula) => {
        try {
            const resposta = await axios.post(`/colaboradores/consultar`, { matricula, instituicao: escola.cnpj });

            if (resposta.status === 200 && resposta.data && resposta.data.colaboradorData.length > 0) {
                const colaborador = resposta.data.colaboradorData[0]; // Verifique se é necessário acessar o primeiro item do array
                console.log(colaborador); // Debugging
                setDadosColaborador({
                    matricula: colaborador.matricula || '',
                    instituicao: colaborador.instituicao || '',
                    nome: colaborador.nome || '',
                    cargo: colaborador.cargo || '',
                    email: colaborador.email || '',
                    status: colaborador.status || 'Ativo',
                    fotoUrl: colaborador.foto || 'https://th.bing.com/th/id/OIP.nIbVpOVMQV4rYGUVTKTbSQHaJ4?w=1200&h=1600&rs=1&pid=ImgDetMain',
                    foto: null,
                });
            } else {
                showToast('warning', 'Colaborador não encontrado ou resposta inválida.');
            }
        } catch (erro) {
            console.error('Erro ao buscar dados do colaborador:', erro);
            showToast('danger', 'Erro ao buscar dados do colaborador.');
        }
    };

    const aoMudarFoto = (evento) => {
        const arquivo = evento.target.files[0];
        if (arquivo) {
            setDadosColaborador(prevDados => ({
                ...prevDados,
                foto: arquivo,
                fotoUrl: URL.createObjectURL(arquivo)
            }));
        }
    };

    const armazenarFoto = async () => {
        if (!dadosColaborador.foto) return dadosColaborador.fotoUrl;

        const caminhoFoto = `FOTO_${Date.now()}`;

        try {
            const { data, error } = await supabase.storage.from('colaboradorPhoto').upload(caminhoFoto, dadosColaborador.foto);
            if (error) {
                showToast('danger', error.message);
                return null;
            }

            const { publicUrl, error: erroPublicUrl } = await supabase.storage.from('colaboradorPhoto').getPublicUrl(caminhoFoto);
            if (erroPublicUrl) {
                showToast('danger', erroPublicUrl.message);
                return null;
            }

            return publicUrl;
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

            const resposta = await axios.post(`/colaboradores/editar`, {
                matriculaAntiga: matricula, // Usa a matrícula passada como prop
                matriculaNova: dadosColaborador.matricula,  // Use a nova matrícula que o usuário pode ter editado
                nome: dadosColaborador.nome,
                cargo: dadosColaborador.cargo,
                email: dadosColaborador.email,
                status: dadosColaborador.status,
                foto: urlFoto
            });

            if (resposta.status === 200) {
                showToast('success', 'Colaborador atualizado com sucesso');
                setDadosColaborador(prevDados => ({ ...prevDados, matricula: resposta.data.novaMatricula || prevDados.matricula }));
            } else {
                showToast('warning', 'Ocorreu um problema ao atualizar o colaborador');
            }
        } catch (erro) {
            console.error('Erro ao atualizar colaborador:', erro);
            showToast('danger', 'Erro ao atualizar colaborador');
        } finally {
            setCarregando(false);
        }
    };

    return (
        <>
            <div id='toast-container' className="toast-container position-absolute bottom-0 start-50 translate-middle-x"></div>
            <div className="box">
                <div className='m-4 d-flex gap-4'>
                    <div className="d-flex flex-column align-items-center gap-3">
                        <img width={300} height={400} src={dadosColaborador.fotoUrl} alt="Foto do colaborador" />
                        <input type="file" onChange={aoMudarFoto} aria-label="Alterar foto do colaborador" />
                    </div>
                    <div className="w-75">
                        <form className="row g-3">
                            <div className="col-md-4">
                                <label htmlFor="matricula" className="form-label">Matrícula</label>
                                <input type="text" className="form-control" id="matricula" value={dadosColaborador.matricula} onChange={e => setDadosColaborador({ ...dadosColaborador, matricula: e.target.value })} required aria-required="true" />
                            </div>

                            <div className="col-md-4">
                                <div className="mb-3 d-flex gap-4">
                                    <div>
                                        <label htmlFor="cargo" className="form-label">Cargo <span className="text-danger">*</span></label>
                                        <select className="form-select" id="cargo" value={dadosColaborador.cargo} onChange={e => setDadosColaborador({ ...dadosColaborador, cargo: e.target.value })} required aria-required="true">
                                            <option value="" disabled>Selecione...</option>
                                            <option value="Admin">Admin</option>
                                            <option value="Diretor">Diretor</option>
                                            <option value="Coordenador">Coordenador</option>
                                            <option value="Professor">Professor</option>
                                            <option value="Colaborador">Colaborador</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="nomeCompleto" className="form-label">Nome completo</label>
                                <input type="text" className="form-control" id="nomeCompleto" value={dadosColaborador.nome} onChange={e => setDadosColaborador({ ...dadosColaborador, nome: e.target.value })} required aria-required="true" />
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="email" className="form-label">E-mail</label>
                                <input type="email" className="form-control" id="email" value={dadosColaborador.email} onChange={e => setDadosColaborador({ ...dadosColaborador, email: e.target.value })} />
                            </div>
                        </form>
                    </div>
                </div>
                <button className='btn btn-primary position-absolute bottom-0 end-0' onClick={aoSalvar} disabled={carregando}>
                    {carregando ? 'Salvando...' : 'Salvar alterações'}
                </button>
            </div>
        </>
    );
}
