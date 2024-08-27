const supabase = require('../../../configs/supabase');

exports.desmatricularAluno = async (request, response) => {
    const { matricula, codigo, tipo, instituicao } = request.body;

    // Verificar se os dados necessários estão presentes
    if (!matricula || !codigo || !tipo || !instituicao) {
        console.error('Dados incompletos:', { matricula, codigo, tipo, instituicao });
        return response.status(400).json({ mensagem: 'Dados incompletos' });
    }

    try {
        // Consultar a eletiva para verificar se ela existe e obter dados relevantes
        const { data: eletivaData, error: eletivaError } = await supabase
            .from('eletivas')
            .select('alunos_cadastrados')
            .eq('codigo', codigo)
            .eq('instituicao', instituicao)
            .single();

        // Verificar se houve erro na consulta da eletiva
        if (eletivaError) {
            console.error('Erro ao consultar a eletiva:', eletivaError);
            return response.status(500).json({ mensagem: 'Erro ao desmatricular o aluno da eletiva', detalhe: eletivaError.message });
        }

        // Verificar se a eletiva foi encontrada
        if (!eletivaData) {
            console.error('Eletiva não encontrada:', { codigo, instituicao });
            return response.status(404).json({ mensagem: 'Eletiva não encontrada' });
        }

        let { alunos_cadastrados } = eletivaData;

        // Verificar se o aluno está associado à eletiva
        const { data: associacaoData, error: associacaoError } = await supabase
            .from('aluno_eletiva')
            .select('*')
            .eq('matricula_aluno', matricula)
            .eq('codigo_eletiva', codigo)
            .eq('instituicao', instituicao)
            .single();

        // Verificar se houve erro na consulta da associação
        if (associacaoError && associacaoError.code !== 'PGRST116') {
            console.error('Erro ao consultar associação:', associacaoError);
            return response.status(500).json({ mensagem: 'Erro ao desmatricular o aluno da eletiva', detalhe: associacaoError.message });
        }

        // Verificar se o aluno não está associado à eletiva
        if (!associacaoData) {
            console.warn('Aluno não está matriculado nesta eletiva:', { matricula, codigo, instituicao });
            return response.status(404).json({ mensagem: 'Aluno não está matriculado nesta eletiva' });
        }

        // Remover a associação do aluno à eletiva
        const { error: desmatriculaError } = await supabase
            .from('aluno_eletiva')
            .delete()
            .eq('matricula_aluno', matricula)
            .eq('codigo_eletiva', codigo)
            .eq('instituicao', instituicao);

        // Verificar se houve erro na remoção da associação
        if (desmatriculaError) {
            console.error('Erro ao desmatricular o aluno da eletiva:', desmatriculaError);
            return response.status(500).json({ mensagem: 'Erro ao desmatricular o aluno da eletiva', detalhe: desmatriculaError.message });
        }

        // Decrementar o contador de alunos cadastrados na eletiva, se maior que zero
        if (alunos_cadastrados > 0) {
            const { error: updateError } = await supabase
                .from('eletivas')
                .update({ alunos_cadastrados: alunos_cadastrados - 1 })
                .eq('codigo', codigo)
                .eq('instituicao', instituicao);

            // Verificar se houve erro na atualização do contador
            if (updateError) {
                console.error('Erro ao atualizar o contador de alunos cadastrados:', updateError);
                return response.status(500).json({ mensagem: 'Erro ao atualizar o contador de alunos cadastrados na eletiva', detalhe: updateError.message });
            }
        }

        // Decrementar o contador de eletivas, trilhas ou projetos de vida do aluno baseado no tipo de eletiva
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

        // Consultar a quantidade atual do tipo de eletiva para o aluno
        const { data: alunoData, error: alunoError } = await supabase
            .from('alunos')
            .select(tipoEletivaField)
            .eq('matricula', matricula)
            .eq('instituicao', instituicao)
            .single();

        // Verificar se houve erro na consulta do aluno
        if (alunoError) {
            console.error('Erro ao consultar o aluno para decrementar o tipo de eletiva:', alunoError);
            return response.status(500).json({ mensagem: 'Erro ao consultar o aluno', detalhe: alunoError.message });
        }

        // Decrementar a quantidade do tipo de eletiva, garantindo que não fique negativa
        const novaQuantidade = Math.max((alunoData[tipoEletivaField] || 0) - 1, 0);

        const { error: alunoUpdateError } = await supabase
            .from('alunos')
            .update({ [tipoEletivaField]: novaQuantidade })
            .eq('matricula', matricula)
            .eq('instituicao', instituicao);

        // Verificar se houve erro na atualização do contador de eletivas do aluno
        if (alunoUpdateError) {
            console.error('Erro ao atualizar o contador de eletivas/trilhas/projetos de vida do aluno:', alunoUpdateError);
            return response.status(500).json({ mensagem: 'Erro ao atualizar o contador de eletivas/trilhas/projetos de vida do aluno', detalhe: alunoUpdateError.message });
        }

        // Retornar sucesso na desmatrícula
        console.log('Aluno desmatriculado da eletiva com sucesso:', { matricula, codigo, instituicao });
        return response.status(200).json({ mensagem: 'Aluno desmatriculado da eletiva com sucesso' });
    } catch (error) {
        // Capturar e retornar erros inesperados
        console.error('Erro inesperado ao desmatricular o aluno da eletiva:', error);
        return response.status(500).json({ mensagem: 'Erro interno ao desmatricular o aluno da eletiva', detalhe: error.message });
    }
};
