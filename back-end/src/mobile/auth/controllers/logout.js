exports.logout = async (request, response) => {
    try {
        request.session.destroy((error) => {
            if (error) {
                console.error('Erro ao destruir a sessão:', error.message);
                return response.status(500).json({ mensagem: 'Ocorreu um erro ao finalizar sua sessão. Por favor, tente novamente mais tarde.' });
            }

            console.log('Logout realizado com sucesso');
            return response.status(200).json({ mensagem: 'Logout efetuado com sucesso!' });
        });
    } catch (error) {
        console.error('[Auth: logout] Erro ao processar logout:', error.message);
        return response.status(500).json({ mensagem: 'Ocorreu um problema ao tentar finalizar sua sessão. Por favor, tente novamente mais tarde.' });
    }
};
