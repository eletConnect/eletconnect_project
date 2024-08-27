exports.updateSession = async (request, response) => {
    try {
        console.log('Sessão atual no updateSession:', request.session);
        if (request.session && request.session.user) {
            console.log('Sessão ativa encontrada:', request.session.user);
            return response.status(200).json(request.session.user);
        } else {
            console.warn('Nenhuma sessão ativa foi encontrada');
            return response.status(401).json({ mensagem: 'Nenhuma sessão ativa foi encontrada. Por favor, faça login para continuar.' });
        }
    } catch (error) {
        console.error('[Auth: updateSession] Erro ao verificar sessão:', error.message);
        return response.status(500).json({ mensagem: 'Ocorreu um problema ao tentar verificar sua sessão. Por favor, tente novamente mais tarde.' });
    }
};
