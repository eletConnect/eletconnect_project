const supabase = require('../../../configs/supabase');

exports.matricularAluno = async (request, response) => {
    const { matricula, codigo, tipo, instituicao } = request.body;

    if (!matricula || !codigo || !tipo || !instituicao) {
        return response.status(400).json({ mensagem: 'Dados incompletos' });
    }

    try {
        const { data: eletivaData, error: eletivaError } = await supabase
            .from('eletivas')
            .select('alunos_cadastrados, total_alunos')
            .eq('codigo', codigo)
            .eq('instituicao', instituicao)
            .single();

        if (eletivaError || !eletivaData) {
            const mensagem = eletivaError ? eletivaError.message : 'Eletiva não encontrada';
            return response.status(eletivaError ? 500 : 404).json({ mensagem: 'Erro ao associar o aluno à eletiva', detalhe: mensagem });
        }

        let alunosCadastrados = parseInt(eletivaData.alunos_cadastrados, 10);
        const totalAlunos = parseInt(eletivaData.total_alunos, 10);

        if (isNaN(alunosCadastrados) || isNaN(totalAlunos)) {
            return response.status(500).json({ mensagem: 'Valores inválidos para o total de alunos ou alunos cadastrados' });
        }

        if (alunosCadastrados >= totalAlunos) {
            return response.status(400).json({ mensagem: 'Número máximo de alunos atingido para esta eletiva' });
        }

        const { data: alunoData, error: alunoError } = await supabase
            .from('alunos')
            .select('matricula, qnt_eletiva, qnt_trilha, qnt_projetoVida')
            .eq('matricula', matricula)
            .eq('instituicao', instituicao)
            .single();

        if (alunoError || !alunoData) {
            const mensagem = alunoError ? alunoError.message : 'Aluno não encontrado';
            return response.status(alunoError ? 500 : 404).json({ mensagem: 'Erro ao associar o aluno à eletiva', detalhe: mensagem });
        }

        const { data: associacaoData, error: associacaoError } = await supabase
            .from('aluno_eletiva')
            .select('*')
            .eq('matricula_aluno', matricula)
            .eq('codigo_eletiva', codigo)
            .eq('instituicao', instituicao)
            .single();

        if (associacaoError && associacaoError.code !== 'PGRST116') {
            return response.status(500).json({ mensagem: 'Erro ao associar o aluno à eletiva', detalhe: associacaoError.message });
        }

        if (associacaoData) {
            return response.status(400).json({ mensagem: 'Aluno já associado à eletiva' });
        }

        const { error: associacaoError2 } = await supabase
            .from('aluno_eletiva')
            .insert([{ matricula_aluno: matricula, codigo_eletiva: codigo, instituicao }]);

        if (associacaoError2) {
            return response.status(500).json({ mensagem: 'Erro ao associar o aluno à eletiva', detalhe: associacaoError2.message });
        }

        alunosCadastrados += 1;

        const { error: updateError } = await supabase
            .from('eletivas')
            .update({ alunos_cadastrados: alunosCadastrados })
            .eq('codigo', codigo)
            .eq('instituicao', instituicao);

        if (updateError) {
            return response.status(500).json({ mensagem: 'Erro ao atualizar o contador de alunos cadastrados na eletiva', detalhe: updateError.message });
        }

        let tipoEletivaField = '';
        switch (tipo) {
            case 'Eletiva':
                tipoEletivaField = 'qnt_eletiva';
                break;
            case 'Trilha':
                tipoEletivaField = 'qnt_trilha';
                break;
            case 'Projeto de Vida':
                tipoEletivaField = 'qnt_projetoVida';
                break;
            default:
                return response.status(400).json({ mensagem: 'Tipo de eletiva desconhecido' });
        }

        const { error: alunoUpdateError } = await supabase
            .from('alunos')
            .update({ [tipoEletivaField]: parseInt(alunoData[tipoEletivaField] || 0, 10) + 1 })
            .eq('matricula', matricula)
            .eq('instituicao', instituicao);

        if (alunoUpdateError) {
            return response.status(500).json({ mensagem: 'Erro ao atualizar o contador de eletivas/trilhas/projetos de vida do aluno', detalhe: alunoUpdateError.message });
        }

        return response.status(201).json({ mensagem: 'Aluno associado à eletiva com sucesso' });

    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro interno ao associar o aluno à eletiva', detalhe: error.message });
    }
};
