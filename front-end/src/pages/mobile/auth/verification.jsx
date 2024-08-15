import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap';
axios.defaults.withCredentials = true;

export default function Verification() {
    const [isLoading, setIsLoading] = useState(true);
    const [mensagem, setMensagem] = useState('Verificando...');
    const [subMensagem, setSubMensagem] = useState('');

    // Função para verificar se o usuário está logado
    useEffect(() => {
        const checkSession = async () => {
            try {
                const responseSession = await axios.get('http://localhost:3001/m/auth/check-session');
                if (responseSession.status === 200) {
                    sessionStorage.setItem('aluno', JSON.stringify(responseSession.data));
                    handlePasswordCheck(responseSession.data);
                }
            } catch (error) {
                handleError(error, 'Redirecionando...');
            }
        };

        checkSession();
    }, []);

    // Função para verificar se o aluno alterou a senha
    const handlePasswordCheck = (userData) => {
        setIsLoading(false);
        if (userData.senha_temporaria) {
            console.log('Usuário deve alterar a senha');
            window.location.href = '/m/change-password';
        } else {
            console.log('Usuário logado');
            window.location.href = '/m/home';
        }
    };

    // Função para tratar erros e redirecionar
    const handleError = (error, subMsg) => {
        setMensagem('Ocorreu um erro');
        setSubMensagem(subMsg);
        sessionStorage.clear();
        setTimeout(() => {
            window.location.href = '/m/login';
        }, 2000);
    };

    if (isLoading) {
        return (
            <div className='position-absolute top-50 start-50 translate-middle text-center'>
                <div className="spinner-grow text-primary" style={{ width: '5rem', height: '5rem' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <div>
                    <p id="mensagem">{mensagem}</p>
                    <p id='sub-mensagem'>{subMensagem}</p>
                </div>
            </div>
        );
    }

    return null;
};
