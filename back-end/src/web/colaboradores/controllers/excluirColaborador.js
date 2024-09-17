const supabase = require('../../../configs/supabase');

exports.excluirColaborador = async (request, response) => {
    const { matricula, instituicao } = request.body;

    if (!matricula || !instituicao) {
        return response.status(400).json({ mensagem: 'Matrícula e instituição não informadas' });
    }

    try {
        const { data: colaboradorData, error: colaboradorError } = await supabase
            .from('usuarios') // Supondo que a tabela de colaboradores seja 'usuarios'
            .delete()
            .eq('matricula', matricula)
            .eq('instituicao', instituicao); // Verificação adicional para a instituição

        if (colaboradorError) {
            return response.status(500).json({ mensagem: 'Erro ao excluir o colaborador', detalhe: colaboradorError.message });
        }

        return response.status(200).json({ colaboradorData });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao excluir o colaborador', detalhe: error.message });
    }
};
