const supabase = require('../../../configs/supabase');

exports.editarColaborador = async (request, response) => {
    const { matriculaAntiga, matricula, nome, cargo, email, status, foto } = request.body;

    // Verifica se os dados obrigatórios estão presentes
    if (!matriculaAntiga || !nome || !cargo || !status) {
        return response.status(400).json({ mensagem: 'Dados inválidos' });
    }

    try {
        // Se a matrícula for diferente, verificar se a nova matrícula já existe para outro colaborador
        if (matricula !== matriculaAntiga) {
            const { data: matriculaExistente, error: errorVerificacao } = await supabase
                .from('usuarios')
                .select('matricula')
                .eq('matricula', matricula)
                .neq('matricula', matriculaAntiga)
                .single();

            if (errorVerificacao && errorVerificacao.code !== 'PGRST116') { // PGRST116: No rows found
                return response.status(500).json({ mensagem: 'Erro ao verificar matrícula', detalhe: errorVerificacao.message });
            }

            if (matriculaExistente) {
                return response.status(400).json({ mensagem: 'A nova matrícula já está em uso por outro colaborador' });
            }
        }

        // Atualiza os dados do colaborador com base na matrícula antiga
        const { data: colaboradorData, error: colaboradorError } = await supabase
            .from('usuarios')
            .update({
                matricula,  // Aqui atualiza com a nova matrícula (ou mantém a antiga)
                nome,
                cargo,
                email,
                status,
                foto
            })
            .eq('matricula', matriculaAntiga);

        if (colaboradorError) {
            return response.status(500).json({ mensagem: 'Erro ao editar o colaborador', detalhe: colaboradorError.message });
        }

        return response.status(200).json({ colaboradorData, novaMatricula: matricula });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao editar o colaborador', detalhe: error.message });
    }
};
