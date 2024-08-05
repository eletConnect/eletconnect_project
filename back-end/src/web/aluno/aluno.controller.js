const supabase = require('../../_configs/supabase');

// Função para listar os alunos cadastrados
exports.listarAlunos = async (request, response) => {
    const { instituicao } = request.body;

    if (!instituicao) {
        return response.status(400).json({ mensagem: 'Instituição não informada' });
    }

    try {
        const { data: alunosData, error: alunosError } = await supabase
            .from('alunos')
            .select('matricula, nome, turma')
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
            .select('matricula, nome, turma, email, status, foto')
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
    const { matricula, nome, turma, instituicao } = request.body;

    if (!matricula || !nome || !turma || !instituicao) {
        return response.status(400).json({ mensagem: 'Dados inválidos' });
    }

    try {
        const { data: alunoData, error: alunoError } = await supabase
            .from('alunos')
            .insert([{ matricula, nome, turma, status: 'ativo', instituicao }]);

        if (alunoError) {
            return response.status(500).json({ mensagem: 'Erro ao cadastrar o aluno', detalhe: alunoError.message });
        }

        return response.status(200).json({ alunoData });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao cadastrar o aluno', detalhe: error.message });
    }
};

// Função para editar um aluno
exports.editarAluno = async (request, response) => {
    const { matricula, nome, turma, email, status, foto } = request.body;

    if (!matricula || !nome || !turma || !email || !status || !foto) {
        return response.status(400).json({ mensagem: 'Dados inválidos' });
    }

    try {
        const { data: alunoData, error: alunoError } = await supabase
            .from('alunos')
            .update({ nome, turma, email, status, foto })
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
        const { data: alunoData, error: alunoError } = await supabase
            .from('alunos')
            .update({ senha: senha })
            .eq('matricula', matricula);

        if (alunoError) {
            return response.status(500).json({ mensagem: 'Erro ao redefinir a senha do aluno', detalhe: alunoError.message });
        }

        return response.status(200).json({ alunoData });
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