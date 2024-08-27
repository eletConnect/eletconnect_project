const supabase = require('../../../configs/supabase');
const { desmatricularAluno } = require('./desmatricularAluno'); // Importa a função existente

// Função para excluir uma eletiva e desmatricular todos os alunos
exports.excluirEletiva = async (request, response) => {
    const { codigo, instituicao, tipo } = request.body;
    console.log('Excluindo eletiva:', { codigo, instituicao, tipo });

    if (!codigo || !instituicao || !tipo) {
        return response.status(400).json({ mensagem: 'Dados incompletos. Certifique-se de fornecer o código, instituição e tipo.' });
    }

    try {
        // Buscar todos os alunos matriculados na eletiva
        const { data: alunosData, error: alunosError } = await supabase
            .from('aluno_eletiva')
            .select('matricula_aluno')
            .eq('codigo_eletiva', codigo)
            .eq('instituicao', instituicao);

        if (alunosError) {
            console.error('Erro ao buscar alunos matriculados:', alunosError);
            return response.status(500).json({ mensagem: 'Erro ao buscar alunos matriculados', detalhe: alunosError.message });
        }

        if (!alunosData || alunosData.length === 0) {
            console.warn('Nenhum aluno encontrado para a eletiva:', { codigo, instituicao });
            return response.status(404).json({ mensagem: 'Nenhum aluno encontrado para a eletiva' });
        }

        // Desmatricular cada aluno usando a função existente
        for (const aluno of alunosData) {
            const desmatriculaRequest = {
                body: {
                    matricula: aluno.matricula_aluno,
                    codigo,
                    tipo, // Tipo fornecido diretamente
                    instituicao,
                }
            };

            const desmatriculaResponse = {
                status: (statusCode) => ({
                    json: (jsonData) => {
                        if (statusCode >= 400) {
                            console.error(`Erro ao desmatricular o aluno ${aluno.matricula_aluno}:`, jsonData);
                            throw new Error(jsonData.mensagem || 'Erro desconhecido na desmatrícula');
                        }
                    }
                })
            };

            try {
                await desmatricularAluno(desmatriculaRequest, desmatriculaResponse);
            } catch (desmatriculaError) {
                console.error(`Erro ao desmatricular o aluno ${aluno.matricula_aluno}:`, desmatriculaError);
                return response.status(500).json({ mensagem: `Erro ao desmatricular o aluno ${aluno.matricula_aluno}`, detalhe: desmatriculaError.message });
            }
        }

        // Depois, excluir a eletiva
        const { error: eletivaError } = await supabase
            .from('eletivas')
            .delete()
            .eq('codigo', codigo)
            .eq('instituicao', instituicao);

        if (eletivaError) {
            return response.status(500).json({ mensagem: 'Erro ao excluir a eletiva', detalhe: eletivaError.message });
        }

        return response.status(200).json({ mensagem: 'Eletiva excluída e alunos desmatriculados com sucesso' });
    } catch (error) {
        console.error('Erro inesperado ao excluir a eletiva:', error);
        return response.status(500).json({ mensagem: 'Erro interno ao excluir a eletiva', detalhe: error.message });
    }
};
