const supabase = require('../../configs/supabase');
const bcrypt = require('bcrypt');


// Função para listar os alunos cadastrados
exports.listarAlunos = async (request, response) => {
    const { instituicao } = request.body;

    if (!instituicao) {
        return response.status(400).json({ mensagem: 'Instituição não informada' });
    }

    try {
        const { data: alunosData, error: alunosError } = await supabase
            .from('alunos')
            .select('*')
            .eq('instituicao', instituicao);

        if (alunosError) {
            return response.status(500).json({ mensagem: 'Erro ao listar os alunos', detalhe: alunosError.message });
        }

        if (!alunosData) {
            return response.status(404).json({ mensagem: 'Nenhum aluno encontrado' });
        }

        return response.status(200).json({ alunosData });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao listar os alunos', detalhe: error.message });
    }
};

// Função para consultar um aluno
exports.consultarAluno = async (request, response) => {
    const { matricula } = request.body;

    if (!matricula) {
        return response.status(400).json({ mensagem: 'Matrícula não informada' });
    }

    try {
        const { data: alunoData, error: alunoError } = await supabase
            .from('alunos')
            .select('matricula, nome, serie, turma, email, status, foto, instituicao')
            .eq('matricula', matricula);

        if (alunoError) {
            return response.status(500).json({ mensagem: 'Erro ao consultar o aluno', detalhe: alunoError.message });
        }

        if (!alunoData) {
            return response.status(404).json({ mensagem: 'Aluno não encontrado' });
        }

        return response.status(200).json({ alunoData });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao consultar o aluno', detalhe: error.message });
    }
};

// Função para cadastrar um aluno
exports.cadastrarAluno = async (request, response) => {
    const { matricula, nome, serie, turma, instituicao, senha } = request.body;

    console.log(request.body);

    // Verificação de dados obrigatórios
    if (!matricula || !nome || !turma || !instituicao || !senha) {
        return response.status(400).json({ mensagem: 'Dados inválidos. Todos os campos obrigatórios devem ser preenchidos.' });
    }

    try {
        // Criptografia da senha
        const senhaCriptografada = await bcrypt.hash(senha, 10);

        // Inserção do aluno no banco de dados
        const { data: alunoData, error: alunoError } = await supabase
            .from('alunos')
            .insert([
                {
                    matricula,
                    nome,
                    serie,
                    turma,
                    senha: senhaCriptografada,
                    status: 'Ativo',
                    instituicao
                }
            ]);

        // Verificação de erro na inserção
        if (alunoError) {
            return response.status(500).json({ mensagem: 'Erro ao cadastrar o aluno', detalhe: alunoError.message });
        }

        // Retorno de sucesso
        return response.status(201).json({ mensagem: 'Aluno cadastrado com sucesso', dados: alunoData });
    } catch (error) {
        // Tratamento de erros inesperados
        console.error('Erro ao cadastrar o aluno:', error);
        return response.status(500).json({ mensagem: 'Erro interno ao cadastrar o aluno', detalhe: error.message });
    }
};


// Função para editar um aluno
exports.editarAluno = async (request, response) => {
    const { matricula, nome, serie, turma, email, status, foto } = request.body;

    if (!matricula || !nome || !turma || !status || !foto) {
        return response.status(400).json({ mensagem: 'Dados inválidos' });
    }

    try {
        const { data: alunoData, error: alunoError } = await supabase
            .from('alunos')
            .update({ nome, serie, turma, serie, email, status, foto })
            .eq('matricula', matricula);

        if (alunoError) {
            return response.status(500).json({ mensagem: 'Erro ao editar o aluno', detalhe: alunoError.message });
        }

        return response.status(200).json({ alunoData });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao editar o aluno' + error.message });
    }
};

// Função para redefinir a senha de um aluno
exports.redefinirSenha = async (request, response) => {
    const { matricula, senha } = request.body;

    if (!matricula || !senha) {
        return response.status(400).json({ mensagem: 'Dados inválidos' });
    }

    try {
        // Criptografa a senha antes de salvar
        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const { data: alunoData, error: alunoError } = await supabase
            .from('alunos')
            .update({ senha: senhaCriptografada, senha_temporaria: true })
            .eq('matricula', matricula);

        if (alunoError) {
            return response.status(500).json({ mensagem: 'Erro ao redefinir a senha do aluno', detalhe: alunoError.message });
        }

        return response.status(200).json({ mensagem: 'Senha redefinida com sucesso', alunoData });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao redefinir a senha do aluno', detalhe: error.message });
    }
};

// Função para excluir um aluno
exports.excluirAluno = async (request, response) => {
    const { matricula } = request.body;

    if (!matricula) {
        return response.status(400).json({ mensagem: 'Matrícula não informada' });
    }

    try {
        const { data: alunoData, error: alunoError } = await supabase
            .from('alunos')
            .delete()
            .eq('matricula', matricula);

        if (alunoError) {
            return response.status(500).json({ mensagem: 'Erro ao excluir o aluno', detalhe: alunoError.message });
        }

        return response.status(200).json({ alunoData });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao excluir o aluno', detalhe: error.message });
    }
};