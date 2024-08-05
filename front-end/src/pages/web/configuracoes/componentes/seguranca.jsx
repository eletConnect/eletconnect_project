import React, { useEffect, useState } from 'react';
import axios from 'axios';
import showToast from '../../../../utills/toasts';

export default function Home() {
    const user = JSON.parse(sessionStorage.getItem('user'));

    useEffect(() => {
        if (!user) {
            window.location.href = '/verification';
        }
    }, [user]);

    const [id] = useState(user?.id || '');
    const [username, setUsername] = useState(user?.username || ''); // Campo de nome de usuário adicionado
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
            const response = await axios.post('http://localhost:3001/auth/update-password', { id, senhaAtual, novaSenha });
            if (response.status === 200) {
                showToast('success', 'Senha alterada com sucesso.');
                setSenhaAtual('');
                setNovaSenha('');
                setConfirmarSenha('');
            }
        } catch (error) {
            console.error('Erro ao alterar a senha', error);
            showToast('danger', error.response ? error.response.data.mensagem : 'Erro ao atualizar a senha.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div id='toast-container' className="toast-container position-absolute bottom-0 start-50 translate-middle-x p-3"></div>
            <form onSubmit={alterarSenha} className='m-4'>
                {/* Campo de nome de usuário oculto */}
                <input type="text" name="username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" style={{ display: 'none' }} />
                <div className="mb-3">
                    <label htmlFor="senhaAtual" className="form-label">Senha atual</label>
                    <input type="password" className="form-control" id="senhaAtual" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} autoComplete="current-password" />
                </div>
                <div className="row">
                    <div className="col">
                        <label htmlFor="novaSenha" className="form-label">Senha nova</label>
                        <input type="password" className="form-control" id="novaSenha" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} autoComplete="new-password" />
                    </div>
                    <div className="col">
                        <label htmlFor="confirmarSenha" className="form-label">Confirmar senha</label>
                        <input type="password" className="form-control" id="confirmarSenha" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} autoComplete="new-password" />
                    </div>
                </div>
                <button type='submit' className="btn btn-secondary m-3 position-absolute bottom-0 end-0" disabled={loading}>
                    {loading ? 'Alterando...' : 'Alterar senha'}
                </button>
            </form>
        </>
    );
}
