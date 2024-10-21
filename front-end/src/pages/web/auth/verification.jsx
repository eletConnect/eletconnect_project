import React, { useState, useEffect } from 'react';
import axios from '../../../configs/axios';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap';
axios.defaults.withCredentials = true;

export default function Verification() {
    const [isLoading, setIsLoading] = useState(true);
    const [mensagem, setMensagem] = useState('Verificando...');
    const [subMensagem, setSubMensagem] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const verifyUserFromStorageOrSession = async () => {
            // Verifica se o usuário veio da página /first-access
            const isFirstAccess = location.pathname === '/first-access';
            console.log('Verificando origem, é first-access?', isFirstAccess);

            try {
                let user = null;

                if (isFirstAccess) {
                    // Tenta obter o usuário do sessionStorage
                    const storedUser = sessionStorage.getItem('user');
                    console.log('Usuário armazenado no sessionStorage:', storedUser);

                    if (storedUser) {
                        user = JSON.parse(storedUser);
                    } else {
                        throw new Error('Usuário não encontrado no sessionStorage');
                    }
                } else {
                    // Caso não venha da página /first-access, faz a verificação da sessão via API
                    const responseSession = await axios.get('/auth/check-session');
                    console.log('Resposta da verificação de sessão:', responseSession);

                    if (responseSession.status === 200) {
                        user = responseSession.data;
                        if (user.status === 'Inativo') {
                            handleError(new Error('Usuário inativo'), 'Redirecionando para login...');
                            return;
                        }
                        sessionStorage.setItem('user', JSON.stringify(user));
                    } else {
                        throw new Error('Sessão inválida');
                    }
                }

                // Checa a instituição após verificar o usuário
                await checkInstituicao(user.id);
            } catch (error) {
                handleError(error, 'Redirecionando...');
            }
        };

        verifyUserFromStorageOrSession();
    }, [navigate, location]);

    const checkInstituicao = async (userId) => {
        try {
            console.log('Verificando instituição para o usuário:', userId);
            const responseEscola = await axios.post('/instituicao/verificar', { id: userId });
            console.log('Resposta da verificação da instituição:', responseEscola);

            const userData = responseEscola.data.userData;
            if (!userData?.instituicao) {
                console.log('Instituição não encontrada, salvando no sessionStorage.');
                sessionStorage.setItem('escola', JSON.stringify(responseEscola.data));
                navigateUser(false);
            } else if (responseEscola.status === 200) {
                console.log('Instituição verificada com sucesso.');
                sessionStorage.setItem('escola', JSON.stringify(responseEscola.data));
                navigateUser(true);
            } else {
                throw new Error('Erro ao verificar instituição');
            }
        } catch (error) {
            console.error('Erro ao verificar instituição:', error);
            handleError(error, 'Redirecionando...');
        }
    };

    const navigateUser = (hasInstitution) => {
        console.log('Navegando usuário, tem instituição?', hasInstitution);
        setIsLoading(false); 
        if (hasInstitution) {
            navigate('/home');
        } else {
            navigate('/first-access');
        }
    };

    const handleError = (error, subMsg) => {
        console.error('Erro ocorrido:', error);
        const errorMessage = error.response?.data?.mensagem || error.message;
        setMensagem(errorMessage);
        setSubMensagem(subMsg || 'Redirecionando...');
        sessionStorage.clear();
        setTimeout(() => {
            navigate('/login');
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
}
