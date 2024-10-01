const supabase = require('../../../configs/supabase');
const bcrypt = require('bcrypt');

// Função para validar e cadastrar alunos a partir da planilha
exports.cadastrarAlunoPlanilha = async (request, response) => {
    const { dados, instituicao } = request.body;

    if (!dados || dados.length === 0 || !instituicao) {
        return response.status(400).json({ mensagem: 'Dados inválidos ou instituição não informada. Verifique e tente novamente.' });
    }

    try {
        let totalCadastrados = 0, totalDuplicados = 0, totalDadosIncompletos = 0, totalErrosInternos = 0;
        const camposFaltantes = { matricula: 0, nome: 0, serie: 0, turma: 0 };
        const detalhesDadosIncompletos = [];
        const alunosParaCadastro = [];

        // Função auxiliar para ajustar e validar os dados do aluno
        const validarAluno = (aluno) => {
            let { matricula, nome, serie, turma } = aluno;
            let motivo = '';

            if (!matricula) {
                camposFaltantes.matricula += 1;
                motivo += 'Matrícula ausente; ';
            }

            // Verificar se o nome é uma string e tem no mínimo 3 caracteres
            if (!nome || typeof nome !== 'string' || nome.length < 3 || /[0-9]/.test(nome)) {
                camposFaltantes.nome += 1;
                motivo += 'Nome inválido (deve ter ao menos 3 caracteres e não pode conter números); ';
            }

            // Verificar se a série é válida (1, 2, ou 3) e normalizar para '1º ano', '2º ano', etc.
            if (serie === undefined || serie === null || !['1', '2', '3'].includes(serie.toString())) {
                camposFaltantes.serie += 1;
                motivo += 'Série inválida (deve ser "1", "2" ou "3"); ';
            } else {
                // Normalizar a série para '1º ano', '2º ano', etc.
                serie = `${serie}º ano`;
            }

            // Verificar se a turma é uma letra de 'A' a 'H'
            if (!turma || !/^[A-H]$/i.test(turma.toString().toUpperCase())) {
                camposFaltantes.turma += 1;
                motivo += 'Turma inválida (deve ser uma letra maiúscula de "A" a "H"); ';
            }

            // Se algum campo está faltando ou é inválido, registra o erro e retorna falso
            if (motivo) {
                const descricaoAluno = nome ? nome : `Aluno com matrícula ${matricula || 'desconhecida'}`;
                detalhesDadosIncompletos.push({ matricula: matricula || 'N/A', nome: descricaoAluno, motivo: motivo.trim() });
                return false;
            }

            // Normalizar valores de matrícula, nome e turma
            matricula = matricula.toString().trim();
            nome = nome.toString().trim();
            turma = turma.toString().trim().toUpperCase();

            return { matricula, nome, serie, turma };
        };

        // Validação e preparação dos alunos para cadastro
        dados.forEach((aluno) => {
            const alunoValidado = validarAluno(aluno);
            if (!alunoValidado) {
                totalDadosIncompletos += 1;
                return;
            }
            alunosParaCadastro.push(alunoValidado);
        });

        // Se não houver alunos válidos para cadastro, retorna a resposta
        if (alunosParaCadastro.length === 0) {
            return response.status(400).json({
                mensagem: 'Nenhum aluno válido para cadastro. Verifique os erros nos dados e tente novamente.',
                detalhesDadosIncompletos
            });
        }

        // Obter as matrículas dos alunos para verificar duplicados
        const matriculas = alunosParaCadastro.map((aluno) => aluno.matricula);
        const { data: alunosExistentes, error: erroConsulta } = await supabase
            .from('alunos')
            .select('matricula')
            .in('matricula', matriculas)
            .eq('instituicao', instituicao);

        if (erroConsulta) {
            return response.status(500).json({ mensagem: 'Erro ao verificar duplicidade de matrículas.', detalhe: erroConsulta.message });
        }

        // Filtrar alunos que já existem no banco de dados
        const matriculasExistentes = alunosExistentes.map((aluno) => aluno.matricula);
        const novosAlunos = alunosParaCadastro.filter((aluno) => !matriculasExistentes.includes(aluno.matricula));

        // Criptografar a senha padrão para todos os alunos novos
        const senhaPadrao = '01234567';
        const senhaCriptografada = await bcrypt.hash(senhaPadrao, 10);

        // Adicionar a senha criptografada e status para cada aluno novo
        const alunosComSenha = novosAlunos.map((aluno) => ({
            ...aluno,
            senha: senhaCriptografada,
            status: 'Ativo',
            instituicao
        }));

        // Inserir os alunos novos no banco de dados de uma única vez
        const { error: erroInsercao } = await supabase
            .from('alunos')
            .insert(alunosComSenha);

        if (erroInsercao) {
            return response.status(500).json({ mensagem: 'Erro ao inserir novos alunos no banco de dados.', detalhe: erroInsercao.message });
        }

        totalCadastrados = alunosComSenha.length;
        totalDuplicados = matriculasExistentes.length;

        // Mensagem final detalhada com o resumo das operações
        const mensagem = `
            || Processo de cadastro concluído! || \n
            - Total de alunos processados: ${dados.length}\n
            - Alunos cadastrados com sucesso: ${totalCadastrados}\n
            - Matrículas duplicadas (ignoradas): ${totalDuplicados}\n
            - Alunos ignorados por dados incompletos: ${totalDadosIncompletos}\n
        `;

        return response.status(201).json({
            mensagem: mensagem.trim(),
            resumo: { totalCadastrados, duplicados: totalDuplicados, dadosIncompletos: totalDadosIncompletos, errosInternos: totalErrosInternos, detalhesDadosIncompletos }
        });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro interno ao processar o cadastro dos alunos. Contate o suporte.', detalhe: error.message });
    }
};
