const supabase = require('../../../configs/supabase');

// Função para editar uma eletiva
exports.editarEletiva = async (request, response) => {
    const { codigo, instituicao, nome, tipo, professor, dia, horario, sala, total_alunos, status } = request.body;

    if (!codigo || !instituicao || !nome || !tipo || !professor || !dia || !horario || !sala || !total_alunos || !status) {
        return response.status(400).json({ mensagem: 'Dados incompletos' });
    }

    try {
        const { data: eletivaData, error: eletivaError } = await supabase
            .from('eletivas')
            .update({
                nome,
                tipo,
                professor,
                horario,
                dia,
                total_alunos,
                sala,
                status
            })
            .eq('codigo', codigo)
            .eq('instituicao', instituicao);

        if (eletivaError) {
            return response.status(500).json({ mensagem: 'Erro ao editar a eletiva', detalhe: eletivaError.message });
        }

        return response.status(200).json({ mensagem: 'Eletiva editada com sucesso' });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao editar a eletiva', detalhe: error.message });
    }
};