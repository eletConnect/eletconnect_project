const supabase = require('../../../configs/supabase');

exports.editarEletiva = async (request, response) => {
    const { codigo, instituicao, nome, descricao, tipo, professor, dia, horario, sala, total_alunos, status, serie, turma, exclusiva } = request.body;

    if (!codigo || !instituicao || !nome || !tipo || !professor || !dia || !horario || !sala || !total_alunos || !status) {
        return response.status(400).json({ mensagem: 'Dados incompletos' });
    }

    // Validação adicional se a eletiva for exclusiva
    if (exclusiva && (!serie || !turma)) {
        return response.status(400).json({ mensagem: 'Dados da série e turma são necessários para eletivas exclusivas' });
    }

    try {
        // Atualização da eletiva no banco de dados
        const { data: eletivaData, error: eletivaError } = await supabase
            .from('eletivas')
            .update({
                nome,
                descricao,
                tipo,
                professor,
                horario,
                dia,
                total_alunos,
                sala,
                status,
                exclusiva, // Atualiza a exclusividade
                serie,  // Se for exclusiva, atualiza série, senão define como null
                turma   // Se for exclusiva, atualiza turma, senão define como null
            })
            .eq('codigo', codigo)
            .eq('instituicao', instituicao);

        // Verificação de erro
        if (eletivaError) {
            return response.status(500).json({ mensagem: 'Erro ao editar a eletiva', detalhe: eletivaError.message });
        }

        // Sucesso
        return response.status(200).json({ mensagem: 'Eletiva editada com sucesso', eletiva: eletivaData });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao editar a eletiva', detalhe: error.message });
    }
};
