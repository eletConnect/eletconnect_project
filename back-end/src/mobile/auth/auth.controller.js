const supabase = require('../../configs/supabase');
const bcrypt = require('bcrypt');

exports.login = async (request, response) => {
    const { matricula, senha } = request.body;
    console.log(matricula, senha);

    try {
        // Verifica se a matrícula existe
        const { data: aluno, error } = await supabase
            .from('alunos')
            .select('*')
            .eq('matricula', matricula)
            .single();

        if (error) {
            return response.status(400).send({ mensagem: 'Erro ao realizar login' });
        }

        if (!aluno) {
            return response.status(400).send({ mensagem: 'Matrícula ou senha inválida' });
        }

        // Verifica a senha criptografada
        const senhaValida = await bcrypt.compare(senha, aluno.senha);
        if (!senhaValida) {
            return response.status(400).send({ mensagem: 'AMatrícula ou senha inválida' });
        }

        // Configura a sessão do usuário
        request.session.user = {
            matricula: aluno.matricula,
            nome: aluno.nome,
            email: aluno.email,
            turma: aluno.turma,
            instituicao: aluno.instituicao,
            foto: aluno.foto,
            status: aluno.status,
            senha_temporaria: aluno.senha_temporaria
        };

        return response.status(200).send({ mensagem: 'Login realizado com sucesso' });
    } catch (error) {
        console.error('[Auth: login]', error.message);
        response.status(500).send({ mensagem: 'Erro ao realizar login' });
    }
};

// Função para alterar a senha do usuário
exports.changePassword = async (request, response) => {
    const { matricula, senhaAtual, senhaNova } = request.body;

    try {
        // Verifica se a matrícula existe
        const { data: aluno, error } = await supabase
            .from('alunos')
            .select('senha')
            .eq('matricula', matricula)
            .single();

        if (error) {
            return response.status(400).send({ mensagem: 'Erro ao alterar a senha' });
        }

        if (!aluno) {
            return response.status(400).send({ mensagem: 'Matrícula inválida' });
        }

        // Verifica a senha criptografada
        const senhaValida = await bcrypt.compare(senhaAtual, aluno.senha);
        if (!senhaValida) {
            return response.status(400).send({ mensagem: 'Senha atual inválida' });
        }

        // Criptografa a nova senha
        const novaSenhaCriptografada = await bcrypt.hash(senhaNova, 10);

        // Atualiza a senha do usuário
        const { error: updateError } = await supabase
            .from('alunos')
            .update({ senha: novaSenhaCriptografada, senha_temporaria: false })
            .eq('matricula', matricula);

        if (updateError) {
            return response.status(400).send({ mensagem: 'Erro ao alterar a senha' });
        }

        return response.status(200).send({ mensagem: 'Senha alterada com sucesso' });
    } catch (error) {
        console.error('[Auth: changePassword]', error.message);
        response.status(500).send({ mensagem: 'Erro ao alterar a senha' });
    }
}

// Função para fazer o logout do usuário
exports.logout = async (request, response) => {
    try {
        request.session.destroy((error) => {
            if (error) {
                return response.status(500).json({ mensagem: 'Ocorreu um erro ao finalizar sua sessão. Por favor, tente novamente mais tarde.' });
            }

            return response.status(200).json({ mensagem: 'Logout efetuado com sucesso!' });
        });
    } catch (error) {
        console.error('[Auth: logout]', error.message);
        response.status(500).json({ mensagem: 'Ocorreu um problema ao tentar finalizar sua sessão. Por favor, tente novamente mais tarde.' });
    }
};

// Função para verificar a sessão do usuário
exports.checkSession = async (request, response) => {
    try {
        if (request.session.user) {
            response.status(200).json({
                matricula: request.session.user.matricula,
                nome: request.session.user.nome,
                email: request.session.user.email,
                turma: request.session.user.turma,
                instituicao: request.session.user.instituicao,
                foto: request.session.user.foto,
                status: request.session.user.status,
                senha_temporaria: request.session.user.senha_temporaria
            });
        } else {
            response.status(401).json({ mensagem: 'Nenhuma sessão ativa foi encontrada. Por favor, faça login para continuar.' });
        }
    } catch (error) {
        console.error('[Auth: check]', error.message);
        response.status(500).json({ mensagem: 'Ocorreu um problema ao tentar verificar sua sessão. Por favor, tente novamente mais tarde.' });
    }
};
