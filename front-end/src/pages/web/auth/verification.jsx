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
                    const user = responseSession.data;

                    // Verifica se o usuário está "Inativo"
                    if (user.status === 'Inativo') {
                        handleError(new Error('Usuário inativo'), 'Redirecionando para login...');
                        return;
                    }

                    sessionStorage.setItem('user', JSON.stringify(user));
                    console.log('Usuário logado:', user);
                    await checkInstituicao(user.id);
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
            handleError(error, 'Redirecionando...');
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
            window.location.href = '/settings/institution';
        }
    };

    // Função para tratar erros e redirecionar
    const handleError = (error, subMsg) => {
        const errorMessage = error.response?.data?.mensagem || error.message;
        setMensagem(errorMessage);
        setSubMensagem(subMsg || 'Redirecionando...');
        sessionStorage.clear();
        setTimeout(() => {
            window.location.href = '/login'; // Redireciona para a página de login
        }, 2000);
    };

    if (isLoading) {
        return (
            <div className='position-absolute top-50 start-50 translate-middle'>
                <div className="d-flex align-items-center gap-4">
                    <strong role="status"><p id='sub-mensagem' className='m-0'>{subMensagem}</p></strong>
                    <div className="spinner-border" aria-hidden="true"></div>
                </div>
                <div>
                    <p id='mensagem' className='m-0'>{mensagem}</p>
                </div>
            </div>
        );
    }

    return null;
};
