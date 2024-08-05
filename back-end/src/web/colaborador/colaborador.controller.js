const supabase = require('../../_configs/supabase');

// Função para listar os colaboradores cadastrados
exports.listarColaboradores = async (request, response) => {
    const { instituicao } = request.body;

    if (!instituicao) {
        return response.status(400).json({ mensagem: 'Instituição não informada' });
    }

    try {
        const { data: colaboradoresData, error: colaboradoresError } = await supabase
            .from('colaboradores')
            .select('matricula, nome, cargo')
            .eq('instituicao', instituicao);

        if (colaboradoresError) {
            return response.status(500).json({ mensagem: 'Erro ao listar os colaboradores', detalhe: colaboradoresError.message });
        }

        if (!colaboradoresData) {
            return response.status(404).json({ mensagem: 'Nenhum colaborador encontrado' });
        }

        return response.status(200).json({ colaboradoresData });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao listar os colaboradores', detalhe: error.message });
    }
}; 