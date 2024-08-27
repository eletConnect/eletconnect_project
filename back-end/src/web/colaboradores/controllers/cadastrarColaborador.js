exports.cadastrarColaborador = async (request, response) => {
    try {
        // Verifica se há uma sessão ativa e se os dados do usuário estão presentes
        if (request.session && request.session.user) {
            const { id, matricula, nome, email, avatar, cargo, status, instituicao } = request.session.user;

            // Retorna os dados do usuário na resposta
            return response.status(200).json({
                id,
                matricula,
                nome,
                email,
                avatar,
                cargo,
                status,
                instituicao
            });
        } else {
            // Retorna erro se não houver sessão ativa
            return response.status(401).json({ mensagem: 'Nenhuma sessão ativa foi encontrada.' });
        }
    } catch (error) {
        console.error('[Colaboradores: cadastrar]', error.message);
        return response.status(500).json({ mensagem: 'Erro ao tentar cadastrar o colaborador.' });
    }
}
