const supabase = require('../../../configs/supabase');
const bcrypt = require('bcrypt');

exports.login = async (request, response) => {
    const { matricula, senha } = request.body;
    console.log('Matrícula e senha recebidas:', matricula, senha);

    try {
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

        const senhaValida = await bcrypt.compare(senha, aluno.senha);
        if (!senhaValida) {
            console.warn('Senha inválida para a matrícula:', matricula);
            return response.status(400).send({ mensagem: 'Matrícula ou senha inválida' });
        }

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
            senha_temporaria: aluno.senha_temporaria,
            cargo: aluno.cargo,
        };

        console.log('Sessão configurada no login:', request.session);

        return response.status(200).send({ mensagem: 'Login realizado com sucesso' });
    } catch (error) {
        console.error('[Auth: login] Erro ao processar login:', error.message);
        return response.status(500).send({ mensagem: 'Erro ao realizar login' });
    }
};
