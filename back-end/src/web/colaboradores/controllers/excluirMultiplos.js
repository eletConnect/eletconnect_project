const supabase = require('../../../configs/supabase');

exports.excluirMultiplos = async (request, response) => {
    const { matriculas, instituicao } = request.body;

    // Verifica se as matrículas e a instituição foram informadas corretamente
    if (!matriculas || !Array.isArray(matriculas) || matriculas.length === 0 || !instituicao) {
        return response.status(400).json({ mensagem: 'Matrículas e instituição são obrigatórias' });
    }

    try {
        // Exclui os colaboradores cujas matrículas foram fornecidas
        const { error: colaboradorError } = await supabase
            .from('usuarios')  // Supondo que a tabela de colaboradores seja 'usuarios'
            .delete()
            .in('matricula', matriculas)  // Exclui todas as matrículas fornecidas
            .eq('instituicao', instituicao);  // Verifica a instituição

        // Verifica se houve erro durante a exclusão
        if (colaboradorError) {
            return response.status(500).json({ mensagem: 'Erro ao excluir os colaboradores', detalhe: colaboradorError.message });
        }

        // Retorna sucesso após a exclusão
        return response.status(200).json({
            mensagem: 'Colaboradores excluídos com sucesso'
        });

    } catch (error) {
        // Trata erros inesperados
        return response.status(500).json({
            mensagem: 'Erro inesperado ao excluir os colaboradores',
            detalhe: error.message
        });
    }
};
