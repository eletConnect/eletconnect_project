import React, { useEffect, useState } from 'react';
import axios from '../../../configs/axios';
import showToast from '../../../utills/toasts';

export default function Home() {
    const user = JSON.parse(sessionStorage.getItem('user'));

    useEffect(() => {
        if (!user) {
            window.location.href = '/verification';
        }
    }, [user]);

    const [id] = useState(user?.id || '');
    const [username, setUsername] = useState(user?.username || '');
    const [senhaAtual, setSenhaAtual] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [loading, setLoading] = useState(false);

    const alterarSenha = async (event) => {
        event.preventDefault();

        if (!senhaAtual || !novaSenha || !confirmarSenha) {
            showToast('danger', 'Preencha todos os campos.');
            return;
        }

        if (novaSenha !== confirmarSenha) {
            showToast('danger', 'As senhas não coincidem.');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('/auth/change-password', { id, senhaAtual, novaSenha });
            if (response.status === 200) {
                sessionStorage.setItem('mensagemSucesso', response.data.mensagem);
                window.location.reload();
            }
        } catch (error) {
            showToast('danger', error.response?.data?.mensagem || 'Erro ao alterar a senha.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div id='toast-container' className="toast-container position-absolute bottom-0 start-50 translate-middle-x p-3"></div>
            <form onSubmit={alterarSenha}>
                {/* Campo de nome de usuário oculto */}
                <input
                    type="text"
                    name="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    style={{ display: 'none' }}
                />

                {/* Senha Atual */}
                <div className="mb-3">
                    <label htmlFor="senhaAtual" className="form-label">Senha atual</label>
                    <input
                        type="password"
                        className="form-control"
                        id="senhaAtual"
                        value={senhaAtual}
                        onChange={(e) => setSenhaAtual(e.target.value)}
                        autoComplete="current-password"
                        minLength="6" // Mínimo de 6 caracteres
                        title="A senha atual deve ter no mínimo 6 caracteres."
                        required
                    />
                </div>

                <div className="row">
                    {/* Nova Senha */}
                    <div className="col">
                        <label htmlFor="novaSenha" className="form-label">Senha nova</label>
                        <input
                            type="password"
                            className="form-control"
                            id="novaSenha"
                            value={novaSenha}
                            onChange={(e) => setNovaSenha(e.target.value)}
                            autoComplete="new-password"
                            pattern="(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}" // Requer uma letra maiúscula, uma minúscula e um número
                            title="A nova senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas e números."
                            required
                        />
                        {/* Validação de força da senha */}
                        {novaSenha.length > 0 && novaSenha.length < 8 && (
                            <div className="text-danger mt-1">
                                <small>A senha deve ter pelo menos 8 caracteres.</small>
                            </div>
                        )}
                    </div>

                    {/* Confirmar Nova Senha */}
                    <div className="col">
                        <label htmlFor="confirmarSenha" className="form-label">Confirmar senha</label>
                        <input
                            type="password"
                            className="form-control"
                            id="confirmarSenha"
                            value={confirmarSenha}
                            onChange={(e) => setConfirmarSenha(e.target.value)}
                            autoComplete="new-password"
                            pattern={novaSenha} // Verifica se a senha corresponde à nova senha
                            title="As senhas não coincidem."
                            required
                        />
                        {/* Verifica se a senha de confirmação coincide com a nova senha */}
                        {confirmarSenha && confirmarSenha !== novaSenha && (
                            <div className="text-danger mt-1">
                                <small>As senhas não coincidem.</small>
                            </div>
                        )}
                    </div>
                </div>

                <div className='text-end pt-4'>
                    <button type='submit' className="btn btn-success" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Alterando...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-key-fill"></i>&ensp;Alterar senha
                            </>
                        )}
                    </button>
                </div>
            </form>

        </>
    );
}
