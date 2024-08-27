const supabase = require('../../../configs/supabase');

exports.matricularAluno = async (request, response) => {
    const { matricula, codigo, tipo, instituicao } = request.body; // Usando as variáveis atualizadas

    // Verificar se os dados necessários estão presentes
    if (!matricula || !codigo || !tipo || !instituicao) {
        console.error('Dados incompletos:', { matricula, codigo, tipo, instituicao });
        return response.status(400).json({ mensagem: 'Dados incompletos' });
    }

    try {
        // Consultar a eletiva para verificar se ela existe e obter dados relevantes
        const { data: eletivaData, error: eletivaError } = await supabase
            .from('eletivas')
            .select('alunos_cadastrados, total_alunos')
            .eq('codigo', codigo)
            .eq('instituicao', instituicao)
            .single();

        // Verificar se houve erro na consulta da eletiva
        if (eletivaError) {
            console.error('Erro ao consultar a eletiva:', eletivaError);
            return response.status(500).json({ mensagem: 'Erro ao associar o aluno à eletiva', detalhe: eletivaError.message });
        }

        // Verificar se a eletiva foi encontrada
        if (!eletivaData) {
            console.error('Eletiva não encontrada:', { codigo, instituicao });
            return response.status(404).json({ mensagem: 'Eletiva não encontrada' });
        }

        let { alunos_cadastrados, total_alunos } = eletivaData;

        // Verificar se a eletiva atingiu o número máximo de alunos
        if (alunos_cadastrados >= total_alunos) {
            console.warn('Número máximo de alunos atingido para esta eletiva:', { codigo, instituicao });
            return response.status(400).json({ mensagem: 'Número máximo de alunos atingido para esta eletiva' });
        }

        // Consultar o aluno para verificar se ele existe
        const { data: alunoData, error: alunoError } = await supabase
            .from('alunos')
            .select('*')
            .eq('matricula', matricula)
            .eq('instituicao', instituicao)
            .single();

        // Verificar se houve erro na consulta do aluno
        if (alunoError) {
            console.error('Erro ao consultar o aluno:', alunoError);
            return response.status(500).json({ mensagem: 'Erro ao associar o aluno à eletiva', detalhe: alunoError.message });
        }

        // Verificar se o aluno foi encontrado
        if (!alunoData) {
            console.error('Aluno não encontrado:', { matricula, instituicao });
            return response.status(404).json({ mensagem: 'Aluno não encontrado' });
        }

        // Verificar se o aluno já está associado à eletiva
        const { data: associacaoData, error: associacaoError } = await supabase
            .from('aluno_eletiva')
            .select('*')
            .eq('matricula_aluno', matricula)
            .eq('codigo_eletiva', codigo)
            .eq('instituicao', instituicao)
            .single();

        // Verificar se houve erro na consulta da associação
        if (associacaoError && associacaoError.code !== 'PGRST116') { // Ignorar erro "PGRST116" (no rows returned)
            console.error('Erro ao consultar associação:', associacaoError);
            return response.status(500).json({ mensagem: 'Erro ao associar o aluno à eletiva', detalhe: associacaoError.message });
        }

        // Verificar se o aluno já está associado à eletiva
        if (associacaoData) {
            console.warn('Aluno já associado à eletiva:', { matricula, codigo, instituicao });
            return response.status(400).json({ mensagem: 'Aluno já associado à eletiva' });
        }

        // Associar o aluno à eletiva
        const { error: associacaoError2 } = await supabase
            .from('aluno_eletiva')
            .insert([{ matricula_aluno: matricula, codigo_eletiva: codigo, instituicao }]);

        // Verificar se houve erro na associação
        if (associacaoError2) {
            console.error('Erro ao associar o aluno à eletiva:', associacaoError2);
            return response.status(500).json({ mensagem: 'Erro ao associar o aluno à eletiva', detalhe: associacaoError2.message });
        }

        // Incrementar o contador de alunos cadastrados na eletiva
        alunos_cadastrados = parseInt(alunos_cadastrados, 10); // Garantir que alunos_cadastrados seja numérico
        const { error: updateError } = await supabase
            .from('eletivas')
            .update({ alunos_cadastrados: alunos_cadastrados + 1 })
            .eq('codigo', codigo)
            .eq('instituicao', instituicao);

        // Verificar se houve erro na atualização do contador
        if (updateError) {
            console.error('Erro ao atualizar o contador de alunos cadastrados:', updateError);
            return response.status(500).json({ mensagem: 'Erro ao atualizar o contador de alunos cadastrados na eletiva', detalhe: updateError.message });
        }

        // Incrementar o contador de eletivas, trilhas ou projetos de vida do aluno baseado no tipo de eletiva
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
                console.error('Tipo de eletiva desconhecido:', tipo);
                return response.status(400).json({ mensagem: 'Tipo de eletiva desconhecido' });
        }

        const { data: alunoUpdateData, error: alunoUpdateError } = await supabase
            .from('alunos')
            .update({ [tipoEletivaField]: parseInt(alunoData[tipoEletivaField] || 0, 10) + 1 })
            .eq('matricula', matricula)
            .eq('instituicao', instituicao);

        // Verificar se houve erro na atualização do contador de eletivas do aluno
        if (alunoUpdateError) {
            console.error('Erro ao atualizar o contador de eletivas/trilhas/projetos de vida do aluno:', alunoUpdateError);
            return response.status(500).json({ mensagem: 'Erro ao atualizar o contador de eletivas/trilhas/projetos de vida do aluno', detalhe: alunoUpdateError.message });
        }

        // Retornar sucesso na associação
        console.log('Aluno associado à eletiva com sucesso:', { matricula, codigo, instituicao });
        return response.status(201).json({ mensagem: 'Aluno associado à eletiva com sucesso' });
    } catch (error) {
        // Capturar e retornar erros inesperados
        console.error('Erro inesperado ao associar o aluno à eletiva:', error);
        return response.status(500).json({ mensagem: 'Erro interno ao associar o aluno à eletiva', detalhe: error.message });
    }
};
