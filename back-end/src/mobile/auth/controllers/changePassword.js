const supabase = require('../../../configs/supabase');
const bcrypt = require('bcrypt');

exports.changePassword = async (request, response) => {
    const { matricula, senhaAtual, senhaNova } = request.body;

    try {
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

        const senhaValida = await bcrypt.compare(senhaAtual, aluno.senha);
        if (!senhaValida) {
            console.warn('Senha atual inválida para a matrícula:', matricula);
            return response.status(400).send({ mensagem: 'Senha atual inválida' });
        }

        const novaSenhaCriptografada = await bcrypt.hash(senhaNova, 10);

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
};
