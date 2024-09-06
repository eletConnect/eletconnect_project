const supabase = require('../../../configs/supabase');

exports.editarColaborador = async (request, response) => {
    const { matriculaAntiga, matriculaNova, nome, cargo, email, status, foto } = request.body;
    console.log(request.body);

    if (!matriculaAntiga || !matriculaNova || !nome || !cargo || !status || !foto) {
        return response.status(400).json({ mensagem: 'Dados inválidos' });
    }

    try {
        // Verificar se a nova matrícula já existe e pertence a outro colaborador
        const { data: matriculaExistente, error: errorVerificacao } = await supabase
            .from('usuarios')
            .select('matricula')
            .eq('matricula', matriculaNova)
            .neq('matricula', matriculaAntiga)
            .single();

        if (errorVerificacao && errorVerificacao.code !== 'PGRST116') { // PGRST116: No rows found
            return response.status(500).json({ mensagem: 'Erro ao verificar matrícula', detalhe: errorVerificacao.message });
        }

        if (matriculaExistente) {
            return response.status(400).json({ mensagem: 'A nova matrícula já está em uso por outro colaborador' });
        }

        // Atualiza o colaborador com base na matrícula antiga
        const { data: colaboradorData, error: colaboradorError } = await supabase
            .from('usuarios')
            .update({ matricula: matriculaNova, nome, cargo, email, status, foto })
            .eq('matricula', matriculaAntiga);

        if (colaboradorError) {
            return response.status(500).json({ mensagem: 'Erro ao editar o colaborador', detalhe: colaboradorError.message });
        }

        return response.status(200).json({ colaboradorData, novaMatricula: matriculaNova });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao editar o colaborador', detalhe: error.message });
    }
};
