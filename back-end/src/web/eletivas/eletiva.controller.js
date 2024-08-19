const supabase = require('../../configs/supabase');
const { v4: uuidv4 } = require('uuid');

// Função para criar um código único de 4 dígitos
function createCode() {
    const uuid = uuidv4();
    const numericPart = parseInt(uuid.replace(/-/g, '').slice(0, 8), 16);
    return String(numericPart % 10000).padStart(4, '0');
}

// Função para listar as eletivas cadastradas
exports.listarEletivas = async (request, response) => {
    const { instituicao } = request.body;

    if (!instituicao) {
        return response.status(400).json({ mensagem: 'Dados incompletos' });
    }

    try {
        const { data: eletivasData, error: eletivasError } = await supabase
            .from('eletivas')
            .select('*')
            .eq('instituicao', instituicao);

        if (eletivasError) {
            return response.status(500).json({ mensagem: 'Erro ao listar as eletivas', detalhe: eletivasError.message });
        }

        return response.status(200).json(eletivasData);
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao listar as eletivas', detalhe: error.message });
    }
};

// Função para cadastrar uma nova eletiva
exports.cadastrarEletiva = async (request, response) => {
    const { instituicao, nome, tipo, dia, horario, professor, sala, total_alunos } = request.body;

    console.log(request.body);

    if (!instituicao || !nome || !tipo || !professor || !total_alunos) {
        return response.status(400).json({ mensagem: 'Dados incompletos' });
    }

    try {
        const { data: eletivaData, error: eletivaError } = await supabase
            .from('eletivas')
            .insert([{
                codigo: createCode(),
                instituicao,
                nome,
                tipo,
                dia,
                sala,
                horario,
                professor,
                total_alunos,
                status: 'Ativa'
            }]);

        if (eletivaError) {
            return response.status(500).json({ mensagem: 'Erro ao cadastrar a eletiva', detalhe: eletivaError.message });
        }

        return response.status(201).json({ mensagem: 'Eletiva cadastrada com sucesso' });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao cadastrar a eletiva', detalhe: error.message });
    }
};

// Função para editar uma eletiva
exports.editarEletiva = async (request, response) => {
    const { codigo, instituicao, nome, tipo, professor, dia, horario, sala, total_alunos, status } = request.body;

    if (!codigo || !instituicao || !nome || !tipo || !professor || !dia || !horario || !sala || !total_alunos || !status) {
        return response.status(400).json({ mensagem: 'Dados incompletos' });
    }

    try {
        const { data: eletivaData, error: eletivaError } = await supabase
            .from('eletivas')
            .update({
                nome,
                tipo,
                professor,
                horario,
                dia,
                total_alunos,
                sala,
                status
            })
            .eq('codigo', codigo)
            .eq('instituicao', instituicao);

        if (eletivaError) {
            return response.status(500).json({ mensagem: 'Erro ao editar a eletiva', detalhe: eletivaError.message });
        }

        return response.status(200).json({ mensagem: 'Eletiva editada com sucesso' });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao editar a eletiva', detalhe: error.message });
    }
};

// Função para excluir uma eletiva
exports.excluirEletiva = async (request, response) => {
    const { codigo, instituicao } = request.body;

    if (!codigo || !instituicao) {
        return response.status(400).json({ mensagem: 'Dados incompletos' });
    }

    try {
        const { data: eletivaData, error: eletivaError } = await supabase
            .from('eletivas')
            .delete()
            .eq('codigo', codigo)
            .eq('instituicao', instituicao);

        if (eletivaError) {
            return response.status(500).json({ mensagem: 'Erro ao excluir a eletiva', detalhe: eletivaError.message });
        }

        return response.status(200).json({ mensagem: 'Eletiva excluída com sucesso' });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao excluir a eletiva', detalhe: error.message });
    }
};

// Função para buscar uma eletiva
exports.buscarEletiva = async (request, response) => {
    const { codigo, instituicao } = request.body;

    if (!codigo || !instituicao) {
        return response.status(400).json({ mensagem: 'Dados incompletos' });
    }

    try {
        const { data: eletivaData, error: eletivaError } = await supabase
            .from('eletivas')
            .select('*')
            .eq('codigo', codigo)
            .eq('instituicao', instituicao);

        if (eletivaError) {
            return response.status(500).json({ mensagem: 'Erro ao buscar a eletiva', detalhe: eletivaError.message });
        }

        return response.status(200).json(eletivaData);
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao buscar a eletiva', detalhe: error.message });
    }
};

// Função para listar os alunos de uma eletiva
exports.listarAlunosEletiva = async (request, response) => {
    const { codigo, instituicao } = request.body;

    console.log(request.body);

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


exports.matricularAluno = async (request, response) => {
    const { matricula, codigo, instituicao } = request.body;

    // Verificar se os dados necessários estão presentes
    if (!matricula || !codigo || !instituicao) {
        return response.status(400).json({ mensagem: 'Dados incompletos' });
    }

    try {
        // Consultar a eletiva para verificar se ela existe e obter dados relevantes
        const { data: eletivaData, error: eletivaError } = await supabase
            .from('eletivas')
            .select('alunos_cadastrados, total_alunos')
            .eq('codigo', codigo)
            .eq('instituicao', instituicao)
            .single(); // Usar .single() para garantir que só um registro seja retornado

        // Verificar se houve erro na consulta da eletiva
        if (eletivaError) {
            return response.status(500).json({ mensagem: 'Erro ao associar o aluno à eletiva', detalhe: eletivaError.message });
        }

        // Verificar se a eletiva foi encontrada
        if (!eletivaData) {
            return response.status(404).json({ mensagem: 'Eletiva não encontrada' });
        }

        const { alunos_cadastrados, total_alunos } = eletivaData;

        // Verificar se a eletiva atingiu o número máximo de alunos
        if (alunos_cadastrados >= total_alunos) {
            return response.status(400).json({ mensagem: 'Número máximo de alunos atingido para esta eletiva' });
        }

        // Consultar o aluno para verificar se ele existe
        const { data: alunoData, error: alunoError } = await supabase
            .from('alunos')
            .select('*')
            .eq('matricula', matricula)
            .eq('instituicao', instituicao)
            .single(); // Usar .single() para garantir que só um registro seja retornado

        // Verificar se houve erro na consulta do aluno
        if (alunoError) {
            return response.status(500).json({ mensagem: 'Erro ao associar o aluno à eletiva', detalhe: alunoError.message });
        }

        // Verificar se o aluno foi encontrado
        if (!alunoData) {
            return response.status(404).json({ mensagem: 'Aluno não encontrado' });
        }

        // Verificar se o aluno já está associado à eletiva
        const { data: associacaoData, error: associacaoError } = await supabase
            .from('aluno_eletiva')
            .select('*')
            .eq('matricula_aluno', matricula)
            .eq('codigo_eletiva', codigo)
            .eq('instituicao', instituicao)
            .single(); // Usar .single() para verificar se já existe uma associação

        // Verificar se houve erro na consulta da associação
        if (associacaoError && associacaoError.code !== 'PGRST116') { // Ignorar erro "PGRST116" (no rows returned)
            return response.status(500).json({ mensagem: 'Erro ao associar o aluno à eletiva', detalhe: associacaoError.message });
        }

        // Verificar se o aluno já está associado à eletiva
        if (associacaoData) {
            return response.status(400).json({ mensagem: 'Aluno já associado à eletiva' });
        }

        // Associar o aluno à eletiva
        const { error: associacaoError2 } = await supabase
            .from('aluno_eletiva')
            .insert([{ matricula_aluno: matricula, codigo_eletiva: codigo, instituicao }]);

        // Verificar se houve erro na associação
        if (associacaoError2) {
            return response.status(500).json({ mensagem: 'Erro ao associar o aluno à eletiva', detalhe: associacaoError2.message });
        }

        // Incrementar o contador de alunos cadastrados na eletiva
        const { error: updateError } = await supabase
            .from('eletivas')
            .update({ alunos_cadastrados: parseInt(alunos_cadastrados, 10) + 1 }) // Garantir que a soma seja numérica
            .eq('codigo', codigo)
            .eq('instituicao', instituicao);

        // Verificar se houve erro na atualização do contador
        if (updateError) {
            return response.status(500).json({ mensagem: 'Erro ao atualizar o contador de alunos cadastrados na eletiva', detalhe: updateError.message });
        }

        // Retornar sucesso na associação
        return response.status(201).json({ mensagem: 'Aluno associado à eletiva com sucesso' });
    } catch (error) {
        // Capturar e retornar erros inesperados
        return response.status(500).json({ mensagem: 'Erro interno ao associar o aluno à eletiva', detalhe: error.message });
    }
};



// Função para desassociar um aluno de uma eletiva
exports.desmatricularAluno = async (request, response) => {
    const { matricula, codigo, instituicao } = request.body;

    // Verificar se os dados necessários estão presentes
    if (!matricula || !codigo || !instituicao) {
        return response.status(400).json({ mensagem: 'Dados incompletos' });
    }

    try {
        // Verificar se o aluno está associado à eletiva
        const { data: associacaoData, error: associacaoError } = await supabase
            .from('aluno_eletiva')
            .select('*')
            .eq('matricula_aluno', matricula)
            .eq('codigo_eletiva', codigo)
            .eq('instituicao', instituicao)
            .single(); // Usar .single() para garantir que só um registro seja retornado

        // Verificar se houve erro na consulta da associação
        if (associacaoError && associacaoError.code !== 'PGRST116') { // Ignorar erro "PGRST116" (no rows returned)
            return response.status(500).json({ mensagem: 'Erro ao desmatricular o aluno da eletiva', detalhe: associacaoError.message });
        }

        // Verificar se a associação foi encontrada
        if (!associacaoData) {
            return response.status(404).json({ mensagem: 'Aluno não está matriculado nesta eletiva' });
        }

        // Desassociar o aluno da eletiva
        const { error: desmatriculaError } = await supabase
            .from('aluno_eletiva')
            .delete()
            .eq('matricula_aluno', matricula)
            .eq('codigo_eletiva', codigo)
            .eq('instituicao', instituicao);

        // Verificar se houve erro na desassociação
        if (desmatriculaError) {
            return response.status(500).json({ mensagem: 'Erro ao desmatricular o aluno da eletiva', detalhe: desmatriculaError.message });
        }

        // Consultar a eletiva para verificar os dados atuais
        const { data: eletivaData, error: eletivaError } = await supabase
            .from('eletivas')
            .select('alunos_cadastrados')
            .eq('codigo', codigo)
            .eq('instituicao', instituicao)
            .single(); // Usar .single() para garantir que só um registro seja retornado

        // Verificar se houve erro na consulta da eletiva
        if (eletivaError) {
            return response.status(500).json({ mensagem: 'Erro ao desmatricular o aluno da eletiva', detalhe: eletivaError.message });
        }

        // Verificar se a eletiva foi encontrada
        if (!eletivaData) {
            return response.status(404).json({ mensagem: 'Eletiva não encontrada' });
        }

        const { alunos_cadastrados } = eletivaData;

        // Decrementar o contador de alunos cadastrados na eletiva
        const { error: updateError } = await supabase
            .from('eletivas')
            .update({ alunos_cadastrados: parseInt(alunos_cadastrados, 10) - 1 }) // Garantir que a subtração seja numérica
            .eq('codigo', codigo)
            .eq('instituicao', instituicao);

        // Verificar se houve erro na atualização do contador
        if (updateError) {
            return response.status(500).json({ mensagem: 'Erro ao atualizar o contador de alunos cadastrados na eletiva', detalhe: updateError.message });
        }

        // Retornar sucesso na desassociação
        return response.status(200).json({ mensagem: 'Aluno desmatriculado da eletiva com sucesso' });
    } catch (error) {
        // Capturar e retornar erros inesperados
        return response.status(500).json({ mensagem: 'Erro interno ao desmatricular o aluno da eletiva', detalhe: error.message });
    }
};


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
