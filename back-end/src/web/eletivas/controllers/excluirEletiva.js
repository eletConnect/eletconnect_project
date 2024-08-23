const supabase = require('../../../configs/supabase');

// Função para excluir uma eletiva
exports.excluirEletiva = async (request, response) => {
    const { codigo, instituicao } = request.body;

    if (!codigo || !instituicao) {
        return response.status(400).json({ mensagem: 'Dados incompletos' });
    }

    try {
        const { data: eletivaData, error: eletivaError } = await supabase
            .from('eletivas')
            .delete()
            .eq('codigo', codigo)
            .eq('instituicao', instituicao);

        if (eletivaError) {
            return response.status(500).json({ mensagem: 'Erro ao excluir a eletiva', detalhe: eletivaError.message });
        }

        return response.status(200).json({ mensagem: 'Eletiva excluída com sucesso' });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao excluir a eletiva', detalhe: error.message });
    }
};