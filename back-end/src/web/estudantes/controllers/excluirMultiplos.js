const supabase = require('../../../configs/supabase');

exports.excluirMultiplos = async (request, response) => {
    const { matriculas, instituicao } = request.body; // Recebendo um array de matrículas e a instituição

    // Verificação dos parâmetros recebidos
    if (!matriculas || !Array.isArray(matriculas) || matriculas.length === 0 || !instituicao) {
        return response.status(400).json({ mensagem: 'Matrículas e instituição são obrigatórias e matrículas devem ser um array não vazio' });
    }

    try {
        // Excluir todos os alunos cujas matrículas estão no array fornecido e que pertencem à instituição informada
        const { data: alunosExcluidos, error: exclusaoError } = await supabase
            .from('alunos')
            .delete()
            .in('matricula', matriculas) // Exclui todas as matrículas fornecidas
            .eq('instituicao', instituicao); // Filtra pela instituição

        // Verificar se houve erro durante a exclusão
        if (exclusaoError) {
            return response.status(500).json({ mensagem: 'Erro ao excluir os alunos', detalhe: exclusaoError.message });
        }

        // Retornar sucesso e os dados dos alunos excluídos
        return response.status(200).json({
            mensagem: 'Alunos excluídos com sucesso',
            alunosExcluidos
        });
    } catch (error) {
        // Tratar erros inesperados
        return response.status(500).json({
            mensagem: 'Erro inesperado ao excluir os alunos',
            detalhe: error.message
        });
    }
};
