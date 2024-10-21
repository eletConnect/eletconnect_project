import React, { useEffect, useState } from 'react';
import axios from '../../../../configs/axios';
import showToast from '../../../../utills/toasts';
import supabase from '../../../../configs/supabase';

export default function SettingsPerfil() {
    const user = JSON.parse(sessionStorage.getItem('user'));

    const [id] = useState(user?.id || '');
    const [uMatricula] = useState(user?.matricula || '');
    const [uNome, setUNome] = useState(user?.nome || '');
    const [uEmail, setUEmail] = useState(user?.email || '');
    const [uCargo] = useState(user?.cargo || '');
    const [foto, setFoto] = useState(null);
    const [fotoUrl, setFotoUrl] = useState(user?.foto || '');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user || !user.id) window.location.href = '/verification';
    }, [user]);

    const alterarFoto = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFoto(file);
            const previewUrl = URL.createObjectURL(file);
            setFotoUrl(previewUrl);
        }
    };

    const armazenarFoto = async () => {
        if (!foto) return fotoUrl;

        const caminhoFoto = `FOTO_${Date.now()}`;

        try {
            const { error } = await supabase.storage.from('avatar').upload(caminhoFoto, foto);
            if (error) {
                showToast('danger', error.message);
                return null;
            }

            const { data, error: publicUrlError } = supabase.storage.from('avatar').getPublicUrl(caminhoFoto);
            if (publicUrlError) {
                showToast('danger', publicUrlError.message);
                return null;
            }

            return data.publicUrl;
        } catch (error) {
            showToast('danger', 'Erro ao armazenar a foto.');
            return null;
        }
    };

    const alterarPerfil = async (e) => {
        e.preventDefault();
        setLoading(true); 

        const fotoUrlAtualizado = await armazenarFoto();
        if (!fotoUrlAtualizado) {
            setLoading(false); 
            return;
        }

        try {
            const response = await axios.post('/auth/update-profile', { id, nome: uNome, email: uEmail, foto: fotoUrlAtualizado });
            if (response.status === 200) {
                sessionStorage.setItem('user', JSON.stringify({ ...user, nome: uNome, email: uEmail, foto: fotoUrlAtualizado }));
                sessionStorage.setItem('mensagemSucesso', 'Perfil atualizado com sucesso.');
                window.location.reload(); // Recarrega a página para aplicar as alterações
            }
        } catch (error) {
            showToast('danger', error.response?.data?.mensagem || 'Erro ao atualizar o perfil.');
        } finally {
            setLoading(false); // Desativa o loading após a conclusão da operação
        }
    };

    return (
        <>
            <div id='toast-container' className="toast-container position-absolute bottom-0 start-50 translate-middle-x p-3"></div>
            <div className="d-flex gap-4">
                <div className="d-flex flex-column align-items-center gap-3">
                    <img width={250} height={250} src={fotoUrl || 'https://www.gov.br/cdn/sso-status-bar/src/image/user.png'} alt="Foto do usuário" />
                    <input type="file" onChange={alterarFoto} />
                </div>
                <form onSubmit={alterarPerfil} className="w-100">
                    <div className="row g-3">
                        {/* Matrícula - Campo desativado */}
                        <div className="col-md-3">
                            <label className="form-label">Matrícula</label>
                            <input type="text" className="form-control" id="idMatricula" name='nameMatricula' value={uMatricula} disabled />
                        </div>

                        {/* Nome completo - Valida apenas letras e espaços */}
                        <div className="col-md-9">
                            <label className="form-label">Nome completo</label>
                            <input
                                type="text"
                                className="form-control"
                                id="idNome"
                                name='nameNome'
                                value={uNome}
                                onChange={(e) => setUNome(e.target.value)}
                                pattern="[A-Za-zÀ-ÿ\s]+" // Valida letras, acentos e espaços
                                maxLength="76" // Limita o nome a 75 caracteres
                                title="Apenas letras e espaços são permitidos"
                                required
                            />
                            {uNome.length > 75 && (
                                <div className="text-danger mt-1">
                                    <small>O nome não pode ultrapassar 75 caracteres.</small>
                                </div>
                            )}
                        </div>

                        {/* E-mail - Valida formato de e-mail */}
                        <div className="col-md-8">
                            <label className="form-label">E-mail</label>
                            <input
                                type="email"
                                className="form-control"
                                id="idEmail"
                                name='nameEmail'
                                value={uEmail}
                                onChange={(e) => setUEmail(e.target.value)}
                                maxLength="101" // Limite de caracteres
                                required
                            />
                            {uEmail.length > 100 && (
                                <div className="text-danger mt-1">
                                    <small>O e-mail não pode ultrapassar 100 caracteres.</small>
                                </div>
                            )}
                        </div>

                        {/* Cargo - Campo desativado */}
                        <div className="col-md-4">
                            <label className="form-label">Cargo</label>
                            <input type="text" className="form-control" id="idCargo" name='nameCargo' value={uCargo} disabled />
                        </div>
                    </div>

                    {/* Botão de submit */}
                    <div className='pt-5 d-flex justify-content-end gap-2 mt-5'>
                        <button type='submit' className="btn btn-success" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Editando...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-pencil"></i>&ensp;Editar
                                </>
                            )}
                        </button>
                    </div>
                </form>

            </div>
        </>
    );
}
