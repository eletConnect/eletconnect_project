const supabase = require('../../../configs/supabase');

exports.obterPeriodo = async (request, response) => {
    const { instituicao } = request.body;

    if (!instituicao) {
        return response.status(400).json({ mensagem: 'Dados incompletos' });
    }

    try {
        // Busca o período de inscrições na tabela "escolas" com base na instituição
        const { data, error } = await supabase
            .from('escolas')
            .select('data_fim')
            .eq('cnpj', instituicao)
            .single();

        if (error) {
            throw error;
        }

        // Retorna a data de encerramento como string
        console.log('Data de encerramento:', data.data_fim);
        return response.status(200).json({ dataEncerramento: data.data_fim });
    } catch (error) {
        console.error('Erro ao obter o período de inscrições:', error);
        return response.status(500).json({ mensagem: 'Erro ao obter o período de inscrições.', detalhe: error.message });
    }
};
