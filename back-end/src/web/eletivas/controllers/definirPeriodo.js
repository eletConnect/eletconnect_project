const supabase = require('../../../configs/supabase');

exports.definirPeriodo = async (request, response) => {
    const { instituicao, dataInicio, dataFim } = request.body;

    console.log('Definindo período de inscrições:', instituicao, dataInicio, dataFim);

    if (!instituicao || !dataFim) {
        return response.status(400).json({ mensagem: 'Dados incompletos' });
    }

    try {
        // Armazena as datas como texto no formato ISO 8601
        const dataInicioTexto = new Date(dataInicio).toISOString(); // Converte para ISO 8601
        const dataFimTexto = new Date(dataFim).toISOString(); // Converte para ISO 8601

        // Atualiza as informações da instituição no banco de dados
        const { data, error } = await supabase
            .from('escolas')
            .update({
                data_inicio: dataInicioTexto,
                data_fim: dataFimTexto
            })
            .eq('cnpj', instituicao);

        if (error) {
            throw error;
        }

        return response.status(200).json({ mensagem: 'Período de inscrições definido com sucesso!' });
    } catch (error) {
        console.error('Erro ao definir o período de inscrições:', error);
        return response.status(500).json({ mensagem: 'Erro ao definir o período de inscrições.', detalhe: error.message });
    }
};
