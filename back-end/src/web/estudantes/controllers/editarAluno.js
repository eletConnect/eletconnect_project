const supabase = require('../../../configs/supabase');

exports.editarAluno = async (request, response) => {
    const { matriculaAntiga, matriculaNova, nome, serie, turma, email, status, foto } = request.body;

    if (!matriculaAntiga || !matriculaNova || !nome || !turma || !status || !foto) {
        return response.status(400).json({ mensagem: 'Dados inválidos' });
    }

    try {
        // Verificar se a nova matrícula já existe e pertence a outro aluno
        const { data: matriculaExistente, error: errorVerificacao } = await supabase
            .from('alunos')
            .select('matricula')
            .eq('matricula', matriculaNova)
            .neq('matricula', matriculaAntiga)
            .single();

        if (errorVerificacao && errorVerificacao.code !== 'PGRST116') { // PGRST116: No rows found
            return response.status(500).json({ mensagem: 'Erro ao verificar matrícula', detalhe: errorVerificacao.message });
        }

        if (matriculaExistente) {
            return response.status(400).json({ mensagem: 'A nova matrícula já está em uso por outro aluno' });
        }

        // Atualiza o aluno com base na matrícula antiga
        const { data: alunoData, error: alunoError } = await supabase
            .from('alunos')
            .update({ matricula: matriculaNova, nome, serie, turma, email, status, foto })
            .eq('matricula', matriculaAntiga);

        if (alunoError) {
            return response.status(500).json({ mensagem: 'Erro ao editar o aluno', detalhe: alunoError.message });
        }

        return response.status(200).json({ alunoData, novaMatricula: matriculaNova });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao editar o aluno', detalhe: error.message });
    }
};
