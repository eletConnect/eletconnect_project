const supabase = require('../../../configs/supabase');

// Função para listar os alunos de uma eletiva
exports.listarAlunosEletiva = async (request, response) => {
    const { codigo, instituicao } = request.body;

    // Verificar se os dados necessários estão presentes
    if (!codigo || !instituicao) {
        return response.status(400).json({ mensagem: 'Dados incompletos' });
    }

    try {
        const { data: alunoEletivaData, error: alunoEletivaError } = await supabase
            .from('aluno_eletiva')
            .select('matricula_aluno')
            .eq('codigo_eletiva', codigo)
            .eq('instituicao', instituicao);

        // Verificar se houve erro na consulta
        if (alunoEletivaError) {
            return response.status(500).json({ mensagem: 'Erro ao listar as matrículas dos alunos da eletiva', detalhe: alunoEletivaError.message });
        }

        // Retorna array vazio se não houver alunos
        if (!alunoEletivaData || alunoEletivaData.length === 0) {
            return response.status(200).json([]); // Retorna um array vazio com status 200
        }

        // Extrair as matrículas dos alunos
        const matriculas = alunoEletivaData.map(item => item.matricula_aluno);

        // Consultar os dados completos dos alunos usando as matrículas
        const { data: alunosData, error: alunosError } = await supabase
            .from('alunos')
            .select('*')
            .in('matricula', matriculas);

        // Verificar se houve erro na consulta dos dados dos alunos
        if (alunosError) {
            return response.status(500).json({ mensagem: 'Erro ao listar os alunos da eletiva', detalhe: alunosError.message });
        }

        // Retornar os dados dos alunos encontrados
        return response.status(200).json(alunosData);
    } catch (error) {
        // Capturar e retornar erros inesperados
        return response.status(500).json({ mensagem: 'Erro interno ao listar os alunos da eletiva', detalhe: error.message });
    }
};