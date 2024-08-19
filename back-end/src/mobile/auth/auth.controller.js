const supabase = require('../../configs/supabase');
const bcrypt = require('bcrypt');

exports.login = async (request, response) => {
    const { matricula, senha } = request.body;
    console.log('Matrícula e senha recebidas:', matricula, senha);

    try {
        // Verifica se a matrícula existe
        const { data: aluno, error } = await supabase
            .from('alunos')
            .select('*')
            .eq('matricula', matricula)
            .single();

        console.log('Resultado da consulta ao Supabase:', aluno);

        if (error) {
            console.error('Erro ao consultar o Supabase:', error.message);
            return response.status(500).send({ mensagem: 'Erro ao consultar o banco de dados' });
        }

        if (!aluno) {
            console.warn('Matrícula não encontrada:', matricula);
            return response.status(400).send({ mensagem: 'Matrícula ou senha inválida' });
        }

        // Verifica a senha criptografada
        const senhaValida = await bcrypt.compare(senha, aluno.senha);
        if (!senhaValida) {
            console.warn('Senha inválida para a matrícula:', matricula);
            return response.status(400).send({ mensagem: 'Matrícula ou senha inválida' });
        }

        // Configura a sessão do usuário
        request.session.user = {
            matricula: aluno.matricula,
            nome: aluno.nome,
            email: aluno.email,
            serie: aluno.serie,
            turma: aluno.turma,
            instituicao: aluno.instituicao,
            foto: aluno.foto,
            status: aluno.status,
            qnt_eletiva: aluno.qnt_eletiva,
            qnt_trilha: aluno.qnt_trilha,
            qnt_projetoVida: aluno.qnt_projetoVida,
            senha_temporaria: aluno.senha_temporaria
        };

        console.log('Sessão configurada no login:', request.session);

        return response.status(200).send({ mensagem: 'Login realizado com sucesso' });
    } catch (error) {
        console.error('[Auth: login] Erro ao processar login:', error.message);
        return response.status(500).send({ mensagem: 'Erro ao realizar login' });
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
            console.error('Erro ao consultar o Supabase:', error.message);
            return response.status(500).send({ mensagem: 'Erro ao consultar o banco de dados' });
        }

        if (!aluno) {
            console.warn('Matrícula não encontrada:', matricula);
            return response.status(400).send({ mensagem: 'Matrícula inválida' });
        }

        // Verifica a senha criptografada
        const senhaValida = await bcrypt.compare(senhaAtual, aluno.senha);
        if (!senhaValida) {
            console.warn('Senha atual inválida para a matrícula:', matricula);
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
            console.error('Erro ao atualizar a senha no Supabase:', updateError.message);
            return response.status(500).send({ mensagem: 'Erro ao alterar a senha' });
        }

        console.log('Senha alterada com sucesso para a matrícula:', matricula);
        return response.status(200).send({ mensagem: 'Senha alterada com sucesso' });
    } catch (error) {
        console.error('[Auth: changePassword] Erro ao alterar senha:', error.message);
        return response.status(500).send({ mensagem: 'Erro ao alterar a senha' });
    }
}

// Função para fazer o logout do usuário
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

// Função para verificar a sessão do usuário
exports.checkSession = async (request, response) => {
    try {
        console.log('Sessão atual no checkSession:', request.session);
        if (request.session && request.session.user) {
            console.log('Sessão ativa encontrada:', request.session.user);
            return response.status(200).json(request.session.user);
        } else {
            console.warn('Nenhuma sessão ativa foi encontrada');
            return response.status(401).json({ mensagem: 'Nenhuma sessão ativa foi encontrada. Por favor, faça login para continuar.' });
        }
    } catch (error) {
        console.error('[Auth: checkSession] Erro ao verificar sessão:', error.message);
        return response.status(500).json({ mensagem: 'Ocorreu um problema ao tentar verificar sua sessão. Por favor, tente novamente mais tarde.' });
    }
};
