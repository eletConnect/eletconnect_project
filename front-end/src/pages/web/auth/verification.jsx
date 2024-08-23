import React, { useState, useEffect } from 'react';
import axios from '../../../configs/axios';
import 'bootstrap';
axios.defaults.withCredentials = true;

export default function Verification() {
    const [isLoading, setIsLoading] = useState(true);
    const [mensagem, setMensagem] = useState('Verificando...');
    const [subMensagem, setSubMensagem] = useState('');

    // Função para verificar se o usuário está logado
    useEffect(() => {
        const checkSessionAndInstitution = async () => {
            try {
                const responseSession = await axios.get('/auth/check-session');
                if (responseSession.status === 200) {
                    sessionStorage.setItem('user', JSON.stringify(responseSession.data));
                    await checkInstituicao(responseSession.data.id);
                }
            } catch (error) {
                handleError(error, 'Redirecionando...');
            }
        };

        checkSessionAndInstitution();
    }, []);

    // Função para verificar se o usuário está vinculado a alguma instituição
    const checkInstituicao = async (userId) => {
        try {
            const responseEscola = await axios.post('/instituicao/verificar', { id: userId });
            console.log(responseEscola);

            if (responseEscola.data.userData?.instituicao === null) {
                sessionStorage.setItem('escola', JSON.stringify(responseEscola.data));
                navigateUser(false);
            } else if (responseEscola.status === 200) {
                sessionStorage.setItem('escola', JSON.stringify(responseEscola.data));
                navigateUser(true);
            }
        } catch (error) {
            handleError(error, 'B Redirecionando...');
        }
    };

    // Função para navegação do usuário com base na verificação
    const navigateUser = (hasInstitution) => {
        setIsLoading(false);
        if (hasInstitution) {
            console.log('Usuário logado e com instituição associada');
            window.location.href = '/home';
        } else {
            console.log('Usuário logado, mas sem instituição associada');
            window.location.href = '/institution';
        }
    };

    // Função para tratar erros e redirecionar
    const handleError = (error, subMsg) => {
        setMensagem(error.message);
        setSubMensagem(subMsg);
        sessionStorage.clear();
        setTimeout(() => {
            window.location.href = '/login';
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