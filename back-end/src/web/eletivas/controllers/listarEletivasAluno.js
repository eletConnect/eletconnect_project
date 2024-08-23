const supabase = require('../../../configs/supabase');

// Função para listar as eletivas de um aluno
exports.listarEletivasAluno = async (request, response) => {
    const { matricula, instituicao } = request.body;

    console.log(request.body);

    // Verificar se os dados necessários estão presentes
    if (!matricula || !instituicao) {
        return response.status(400).json({ mensagem: 'Dados incompletos' });
    }

    try {
        // Consultar os códigos das eletivas associadas ao aluno
        const { data: alunoData, error: alunoError } = await supabase
            .from('aluno_eletiva')
            .select('codigo_eletiva')
            .eq('matricula_aluno', matricula)
            .eq('instituicao', instituicao);

        // Verificar se houve erro na consulta dos códigos
        if (alunoError) {
            return response.status(500).json({ mensagem: 'Erro ao listar as eletivas do aluno', detalhe: alunoError.message });
        }

        // Extrair os códigos das eletivas
        const codigos = alunoData.map(item => item.codigo_eletiva);

        // Consultar os dados completos das eletivas usando os códigos
        const { data: eletivasData, error: eletivasError } = await supabase
            .from('eletivas')
            .select('*')
            .in('codigo', codigos);

        // Verificar se houve erro na consulta dos dados das eletivas
        if (eletivasError) {
            return response.status(500).json({ mensagem: 'Erro ao listar as eletivas do aluno', detalhe: eletivasError.message });
        }

        // Retornar os dados das eletivas encontradas
        return response.status(200).json(eletivasData);
    } catch (error) {
        // Capturar e retornar erros inesperados
        return response.status(500).json({ mensagem: 'Erro interno ao listar as eletivas do aluno', detalhe: error.message });
    }
};