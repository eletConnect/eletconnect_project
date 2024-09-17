const supabase = require('../../../configs/supabase');
const { verifyToken } = require('../services/tokenService');

exports.confirmRegistration = async (request, response) => {
    const { token } = request.body;

    // Verificar a validade do token
    const { status, message } = await verifyToken(token);
    if (status !== true) {
        return response.status(401).json({ mensagem: message });
    }

    try {
        // Verificar se o token corresponde a um usuário
        const { data: user, error: userERROR } = await supabase
            .from('usuarios')
            .select('confirmed_at, id, status')
            .eq('token', token)
            .single();

        if (!user) {
            return response.status(401).json({ mensagem: 'Token inválido.' });
        }

        // Verificar se o e-mail já foi confirmado
        if (user.confirmed_at) {
            return response.status(401).json({ mensagem: 'E-mail já verificado.' });
        }

        if (userERROR) {
            return response.status(401).json({ mensagem: 'Erro ao verificar o token.' });
        }

        // Atualizar o status para 'Ativo' e a data de confirmação
        const { error } = await supabase
            .from('usuarios')
            .update({
                confirmed_at: new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }),
                status: 'Ativo' // Atualiza o status para "Ativo"
            })
            .eq('id', user.id);

        if (error) {
            return response.status(500).json({ mensagem: 'Erro ao atualizar a confirmação do e-mail e status do usuário.' });
        }

        return response.status(200).json({ mensagem: 'E-mail verificado com sucesso! Sua conta está agora ativa.' });
    } catch (error) {
        console.error('[Auth: confirm]', error.message);
        response.status(500).json({ mensagem: 'Erro ao tentar validar sua conta.' });
    }
};
