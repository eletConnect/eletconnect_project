const supabase = require('../../../configs/supabase');

exports.verificarDados = async (request, response) => {
    const { dados, instituicao } = request.body;

    if (!dados || dados.length === 0 || !instituicao) {
        return response.status(400).json({ mensagem: 'Dados inválidos ou instituição não informada. Verifique e tente novamente.' });
    }

    try {
        const erros = {};
        const matriculasRecebidas = dados.map((aluno) => aluno.matricula);

        // Consultar todas as matrículas já existentes no banco para a instituição
        const { data: alunosExistentes, error: erroConsulta } = await supabase
            .from('alunos')
            .select('matricula')
            .in('matricula', matriculasRecebidas)
            .eq('instituicao', instituicao);

        if (erroConsulta) {
            return response.status(500).json({ mensagem: `Erro ao consultar banco de dados: ${erroConsulta.message}` });
        }

        // Extrair apenas as matrículas existentes para facilitar a verificação
        const matriculasExistentes = alunosExistentes.map((aluno) => aluno.matricula);

        // Funções auxiliares para validação
        const isNumero = (valor) => /^\d+$/.test(valor);
        const isNomeValido = (valor) => /^[a-zA-Z\s]+$/.test(valor) && valor.length >= 3;
        const isTurmaValida = (valor) => /^[A-Z]$/.test(valor.trim().toUpperCase());

        // Dicionário para contar duplicidade de matrículas localmente
        const contadorMatriculas = {};

        // Validar cada linha recebida
        dados.forEach((row, index) => {
            const errosLinha = {};

            // Validação de série: não deve conter letras e deve ser "1", "2" ou "3"
            const serie = row['serie']?.toString().trim();
            if (serie) {
                if (!isNumero(serie)) {
                    errosLinha['serie'] = 'Série inválida. Deve ser "1", "2" ou "3", sem letras ou outros caracteres.';
                } else if (!['1', '2', '3'].includes(serie)) {
                    errosLinha['serie'] = 'Série inválida. Deve ser "1", "2" ou "3".';
                } else {
                    row['serie'] = `${serie}º ano`;  // Ajustar a série para o formato desejado
                }
            } else {
                errosLinha['serie'] = 'Série é obrigatória.';
            }

            // Validação de matrícula
            const matricula = row['matricula']?.toString().trim();
            if (!matricula) {
                errosLinha['matricula'] = 'Matrícula é obrigatória.';
            } else if (!isNumero(matricula)) {
                errosLinha['matricula'] = 'Matrícula deve conter apenas números.';
            } else {
                // Verificar duplicidade localmente
                contadorMatriculas[matricula] = (contadorMatriculas[matricula] || 0) + 1;

                // Se a matrícula for duplicada localmente ou já existir no banco, adicionar erro
                if (contadorMatriculas[matricula] > 1) {
                    errosLinha['matricula'] = `Matrícula "${matricula}" está duplicada na planilha.`;
                } else if (matriculasExistentes.includes(matricula)) {
                    errosLinha['matricula'] = `Matrícula "${matricula}" já está registrada no sistema.`;
                }
            }

            // Validação de nome
            const nome = row['nome']?.toString().trim();
            if (!nome) {
                errosLinha['nome'] = 'Nome é obrigatório.';
            } else if (!isNomeValido(nome)) {
                errosLinha['nome'] = 'Nome deve ter pelo menos 3 caracteres e não pode conter números.';
            }

            // Validação de turma
            const turma = row['turma']?.toString().trim().toUpperCase();
            if (!turma) {
                errosLinha['turma'] = 'Turma é obrigatória.';
            } else if (!isTurmaValida(turma)) {
                errosLinha['turma'] = 'Turma inválida. Deve ser uma letra maiúscula (A-Z).';
            } else {
                row['turma'] = turma;
            }

            // Adicionar erros, se houver
            if (Object.keys(errosLinha).length > 0) {
                erros[index] = errosLinha;
            }
        });

        return response.status(200).json({ erros });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro interno ao validar dados. Contate o suporte.', detalhe: error.message });
    }
};
