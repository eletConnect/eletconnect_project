const supabase = require('../../../configs/supabase');

exports.quantidades = async (request, response) => {
    const { instituicao } = request.body;

    if (!instituicao) {
        return response.status(400).json({ mensagem: 'Instituição não informada' });
    }

    try {
        // Consulta a quantidade total de alunos
        const { data: alunos, error: alunosError } = await supabase
            .from('alunos')
            .select('matricula')
            .eq('instituicao', instituicao);

        if (alunosError) {
            return response.status(500).json({ mensagem: 'Erro ao consultar os alunos', detalhe: alunosError.message });
        }

        // Consulta a quantidade de alunos do 1º ano
        const { data: alunos1Ano, error: alunos1AnoError } = await supabase
            .from('alunos')
            .select('matricula')
            .eq('instituicao', instituicao)
            .eq('serie', '1º ano'); // Ajuste para "1º ano"

        if (alunos1AnoError) {
            return response.status(500).json({ mensagem: 'Erro ao consultar os alunos do 1º ano', detalhe: alunos1AnoError.message });
        }

        // Consulta a quantidade de alunos do 2º ano
        const { data: alunos2Ano, error: alunos2AnoError } = await supabase
            .from('alunos')
            .select('matricula')
            .eq('instituicao', instituicao)
            .eq('serie', '2º ano'); // Ajuste para "2º ano"

        if (alunos2AnoError) {
            return response.status(500).json({ mensagem: 'Erro ao consultar os alunos do 2º ano', detalhe: alunos2AnoError.message });
        }

        // Consulta a quantidade de alunos do 3º ano
        const { data: alunos3Ano, error: alunos3AnoError } = await supabase
            .from('alunos')
            .select('matricula')
            .eq('instituicao', instituicao)
            .eq('serie', '3º ano'); // Ajuste para "3º ano"

        if (alunos3AnoError) {
            return response.status(500).json({ mensagem: 'Erro ao consultar os alunos do 3º ano', detalhe: alunos3AnoError.message });
        }

        // Consulta a quantidade de eletivas
        const { data: eletivas, error: eletivasError } = await supabase
            .from('eletivas')
            .select('codigo')  // Substitua 'codigo' pelo campo relevante na tabela 'eletivas'
            .eq('instituicao', instituicao);

        if (eletivasError) {
            return response.status(500).json({ mensagem: 'Erro ao consultar as eletivas', detalhe: eletivasError.message });
        }

        // Verifica se há alunos ou eletivas
        const qtdAlunos = alunos ? alunos.length : 0;
        const qtdEletivas = eletivas ? eletivas.length : 0;
        const qtdAlunos1Ano = alunos1Ano ? alunos1Ano.length : 0;
        const qtdAlunos2Ano = alunos2Ano ? alunos2Ano.length : 0;
        const qtdAlunos3Ano = alunos3Ano ? alunos3Ano.length : 0;

        if (qtdAlunos === 0 && qtdEletivas === 0) {
            return response.status(404).json({ mensagem: 'Nenhum aluno ou eletiva encontrado' });
        }

        // Retorna a quantidade de alunos por ano e a quantidade de eletivas
        return response.status(200).json({
            quantidadeAlunos: qtdAlunos,
            quantidadeAlunos1Ano: qtdAlunos1Ano,
            quantidadeAlunos2Ano: qtdAlunos2Ano,
            quantidadeAlunos3Ano: qtdAlunos3Ano,
            quantidadeEletivas: qtdEletivas,
            totalAlunos: '1300'
        });

    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao consultar os dados', detalhe: error.message });
    }
};
