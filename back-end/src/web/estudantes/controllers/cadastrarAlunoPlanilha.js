const supabase = require('../../../configs/supabase');
const bcrypt = require('bcrypt');

exports.cadastrarAlunoPlanilha = async (request, response) => {
    const { dados, instituicao } = request.body;

    if (!dados || dados.length === 0 || !instituicao) {
        return response.status(400).json({ mensagem: 'Dados inválidos ou instituição não informada. Verifique e tente novamente.' });
    }

    try {
        // Variáveis para rastrear o progresso do cadastro
        let totalAlunos = dados.length;
        let totalCadastrados = 0;
        let totalDuplicados = 0;
        let totalDadosIncompletos = 0;
        let totalErrosInternos = 0;

        // Objeto para rastrear campos ausentes
        let camposFaltantes = {
            matricula: 0,
            nome: 0,
            serie: 0,
            turma: 0,
        };

        // Lista de alunos com dados incompletos e o motivo
        let detalhesDadosIncompletos = [];

        for (const aluno of dados) {
            let { Matricula, Nome, Serie, Turma } = aluno;

            // Verificar se os campos obrigatórios estão presentes e são válidos
            let motivo = '';
            if (!Matricula) {
                camposFaltantes.matricula += 1;
                motivo += 'Matrícula ausente; ';
            }
            if (!Nome) {
                camposFaltantes.nome += 1;
                motivo += 'Nome ausente; ';
            }
            if (!Serie) {
                camposFaltantes.serie += 1;
                motivo += 'Série ausente; ';
            }
            if (!Turma) {
                camposFaltantes.turma += 1;
                motivo += 'Turma ausente; ';
            }

            // Se algum dos campos estiver faltando, adicionar aos detalhes de erro
            if (motivo) {
                const descricaoAluno = Nome ? Nome : `Aluno com matrícula ${Matricula || 'desconhecida'}`;
                detalhesDadosIncompletos.push({ matricula: Matricula || 'N/A', nome: descricaoAluno, motivo: motivo.trim() });
                totalDadosIncompletos += 1;
                continue; // Pula para o próximo aluno, pois este está com dados incompletos
            }

            // Normalização e ajustes nos valores
            Matricula = Matricula.toString().trim();
            Nome = Nome.toString().trim();
            Turma = Turma.toString().trim().toUpperCase();

            // Ajustar o formato da Série para '1º ano', '2º ano' ou '3º ano'
            Serie = Serie.toString().trim();
            if (['1', '2', '3'].includes(Serie)) {
                Serie = `${Serie}º ano`;
            } else {
                Serie = Serie.toUpperCase();
            }

            try {
                // Verificar se a matrícula já existe no banco de dados
                const { data: alunosExistentes, error: erroConsulta } = await supabase
                    .from('alunos')
                    .select('matricula')
                    .eq('matricula', Matricula)
                    .eq('instituicao', instituicao);

                if (erroConsulta) {
                    totalErrosInternos += 1;
                    console.error(`Erro ao verificar matrícula para o aluno ${Nome}: ${erroConsulta.message}`);
                    continue;
                }

                // Caso a matrícula já exista na instituição, registrar como duplicada
                if (alunosExistentes && alunosExistentes.length > 0) {
                    totalDuplicados += 1;
                    console.log(`Matrícula duplicada: ${Matricula} já cadastrada na instituição ${instituicao}.`);
                    continue;
                }

                // Criptografar a senha padrão do aluno antes de inseri-lo no banco
                const senha = '01234567';
                const senhaCriptografada = await bcrypt.hash(senha, 10);

                // Inserir o aluno no banco de dados
                const { error: alunoError } = await supabase
                    .from('alunos')
                    .insert([
                        {
                            matricula: Matricula,
                            nome: Nome,
                            serie: Serie,
                            turma: Turma,
                            senha: senhaCriptografada,
                            status: 'Ativo',
                            instituicao
                        }
                    ]);

                if (alunoError) {
                    totalErrosInternos += 1;
                    console.error(`Erro ao cadastrar o aluno ${Nome}: ${alunoError.message}`);
                    continue;
                }

                // Incrementa o contador de alunos cadastrados com sucesso
                totalCadastrados += 1;
                console.log(`Aluno ${Nome} (Matrícula: ${Matricula}) cadastrado com sucesso.`);

            } catch (erroInterno) {
                // Captura erros internos no processo de cada aluno e incrementa o contador de falhas internas
                totalErrosInternos += 1;
                console.error(`Erro interno ao cadastrar o aluno ${Nome} (Matrícula: ${Matricula}): ${erroInterno.message}`);
                continue;
            }
        }

        // Mensagem final detalhada com o resumo das operações
        let mensagem = `
            || Processo de cadastro concluído! || \n
            - Total de alunos processados: ${totalAlunos}\n
            - Alunos cadastrados com sucesso: ${totalCadastrados}\n
            - Erros internos: ${totalErrosInternos}\n
            - Matrículas duplicadas (ignoradas): ${totalDuplicados}\n
            - Alunos ignorados por dados incompletos: ${totalDadosIncompletos}\n
            - Matrículas ausentes: ${camposFaltantes.matricula}\n
            - Nomes ausentes: ${camposFaltantes.nome}\n
            - Séries ausentes: ${camposFaltantes.serie}\n
            - Turmas ausentes: ${camposFaltantes.turma}\n`;

        console.log('Resumo do cadastro:', {
            totalAlunos,
            totalCadastrados,
            totalDuplicados,
            totalDadosIncompletos,
            camposFaltantes,
            totalErrosInternos,
            detalhesDadosIncompletos
        });

        // Retorna uma resposta com o resumo das operações e os detalhes dos campos faltantes
        return response.status(201).json({
            mensagem: mensagem.trim(),
            resumo: {
                totalAlunos,
                cadastrados: totalCadastrados,
                duplicados: totalDuplicados,
                dadosIncompletos: totalDadosIncompletos,
                errosInternos: totalErrosInternos,
                camposFaltantes,
                detalhesDadosIncompletos
            }
        });
    } catch (error) {
        // Captura erros inesperados no processo e responde com uma mensagem detalhada
        console.error('Erro ao processar o cadastro dos alunos:', error);
        return response.status(500).json({ mensagem: 'Erro interno ao processar o cadastro dos alunos. Contate o suporte.', detalhe: error.message });
    }
};
