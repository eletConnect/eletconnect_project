const bcrypt = require('bcrypt');
const supabase = require('../../../configs/supabase');

exports.login = async (request, response) => {
    const { email, senha } = request.body;

    console.log('Tentativa de login:', email);

    try {
        // Consultar o usuário no banco de dados
        const { data: user, error: userERROR } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .single();

        // Verificar se houve erro na consulta
        if (userERROR) {
            console.error('Erro ao consultar o usuário:', userERROR.message);
            return response.status(500).json({ mensagem: 'Erro ao tentar fazer login. Por favor, tente novamente mais tarde.' });
        }

        // Verificar se o usuário existe
        if (!user) {
            console.warn('Usuário não encontrado para o email:', email);
            return response.status(401).json({ mensagem: 'Credenciais inválidas.' });
        }

        // Verificar se a senha está correta
        const senhaValida = await bcrypt.compare(senha, user.senha);
        if (!senhaValida) {
            console.warn('Senha incorreta para o email:', email);
            return response.status(401).json({ mensagem: 'Credenciais inválidas.' });
        }

        // Verificar se o e-mail foi confirmado
        if (!user.confirmed_at) {
            console.warn('E-mail não confirmado para o usuário:', email);
            return response.status(406).json({ mensagem: 'Seu e-mail ainda não foi confirmado.' });
        }

        // Verificar se o status do usuário é "Aguardando"
        if (user.status === 'Aguardando') {
            console.warn('Tentativa de login de usuário com status "Aguardando":', email);
            return response.status(403).json({ mensagem: 'Sua conta está aguardando confirmação. Verifique sua caixa de entrada para ativar sua conta.' });
        }

        // Verificar se o status do usuário é "Inativo"
        if (user.status === 'Inativo') {
            console.warn('Tentativa de login de usuário inativo:', email);
            return response.status(403).json({ mensagem: 'Sua conta está inativa. Entre em contato com o administrador.' });
        }

        // Configurar a sessão do usuário com a foto correta
        request.session.user = {
            id: user.id,
            matricula: user.matricula,
            nome: user.nome,
            email,
            status: user.status,
            cargo: user.cargo,
            foto: user.foto,
            instituicao: user.instituicao
        };

        console.log('Login bem-sucedido para o usuário:', email);
        return response.status(200).json({ mensagem: 'Login efetuado com sucesso!' });

    } catch (error) {
        console.error('Erro inesperado ao tentar fazer login:', error.message);
        return response.status(500).json({ mensagem: 'Erro ao tentar fazer login. Por favor, tente novamente mais tarde.' });
    }
};
