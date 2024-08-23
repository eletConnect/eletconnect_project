import axios from '../configs/axios';

export const updateSessao = async () => {
    const salvarPaginaAnterior = () => {
        sessionStorage.setItem('paginaAnterior', window.location.pathname);
    };

    try {
        const respostaSessao = await axios.get('/m/auth/update-session');
        if (respostaSessao.status === 200) {
            const paginaAnterior = sessionStorage.getItem('paginaAnterior');
            if (paginaAnterior) {
                window.location.href = paginaAnterior;
            } else {
                window.location.href = '/';
            }
        }
    } catch (erro) {
        console.error('Erro ao verificar a sessão:', erro);
        window.location.href = '/m/login';
    }
    
    salvarPaginaAnterior();
};
