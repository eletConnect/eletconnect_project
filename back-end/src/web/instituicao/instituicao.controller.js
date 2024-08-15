const supabase = require('../../configs/supabase');

// Função para gerar um código de acesso para a instituição de ensino
async function createCode() {
    let codigo;
    let verificarCodigo;

    do {
        codigo = Math.random().toString().substring(2, 10);

        const { data } = await supabase
            .from('escolas')
            .select('codigo')
            .eq('codigo', codigo)
            .single();

        verificarCodigo = data;

    } while (verificarCodigo);

    return codigo;
}

// Função para verificar se o usuário está vinculado a uma instituição de ensino
exports.verificarEscolaUSER = async (request, response) => {
    const { id } = request.body;

    try {
        const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .select('instituicao')
            .eq('id', id)
            .single();

        if (userError) {
            return response.status(500).json({ mensagem: 'Erro ao verificar o usuário', detalhe: userError.message });
        }

        if (!userData) {
            return response.status(404).json({ mensagem: 'Usuário não encontrado' });
        }

        if (!userData.instituicao) {
            return response.status(200).json({ userData });
        }

        const { data: instituicaoData, error: instituicaoError } = await supabase
            .from('escolas')
            .select('cnpj, nome, cep, endereco, telefone, logotipo')
            .eq('cnpj', userData.instituicao)
            .single();

        if (instituicaoError) {
            return response.status(500).json({ mensagem: 'Erro ao verificar a instituição', detalhe: instituicaoError.message });
        }

        if (!instituicaoData) {
            return response.status(404).json({ mensagem: 'Instituição não encontrada' });
        }

        return response.status(200).json(instituicaoData);
    } catch (error) {
        console.error('[Instituição]:', error);
        return response.status(500).json({ mensagem: 'Erro ao verificar instituição' });
    }
};

// Função para verificar se o aluno está vinculado a uma instituição de ensino
exports.verificarEscolaALUNO = async (request, response) => {
    const { matricula } = request.body;

    try {
        const { data: alunoData, error: alunoError } = await supabase
            .from('alunos')
            .select('instituicao')
            .eq('matricula', matricula)
            .single();

        if (alunoError) {
            return response.status(500).json({ mensagem: 'Erro ao verificar o aluno', detalhe: alunoError.message });
        }

        if (!alunoData) {
            return response.status(404).json({ mensagem: 'Aluno não encontrado' });
        }

        if (!alunoData.instituicao) {
            return response.status(200).json({ alunoData });
        }

        const { data: instituicaoData, error: instituicaoError } = await supabase
            .from('escolas')
            .select('cnpj, nome, cep, endereco, telefone, logotipo')
            .eq('cnpj', alunoData.instituicao)
            .single();

        if (instituicaoError) {
            return response.status(500).json({ mensagem: 'Erro ao verificar a instituição', detalhe: instituicaoError.message });
        }

        if (!instituicaoData) {
            return response.status(404).json({ mensagem: 'Instituição não encontrada' });
        }

        return response.status(200).json(instituicaoData);
    } catch (error) {
        console.error('[Instituição]:', error);
        return response.status(500).json({ mensagem: 'Erro ao verificar instituição' });
    }
}

// Função para usuário entrar em uma instituição de ensino
exports.entrarEscolaCODE = async (request, response) => {
    const { id, codigo } = request.body;
    if (!codigo || !id) return response.status(400).json({ mensagem: 'Código de acesso ou ID do usuário não informado' });

    try {
        const { data, error } = await supabase
            .from('escolas')
            .select('cnpj, nome, logotipo')
            .eq('codigo', codigo)
            .single();

        if (error) return response.status(500).json({ mensagem: 'Erro ao verificar o código de acesso', detalhe: error.message });

        if (!data) return response.status(404).json({ mensagem: 'Código de acesso inválido' });

        const { error: addEscolaUserError } = await supabase
            .from('usuarios')
            .update({ instituicao: data.cnpj, cargo: 'Colaborador' })
            .eq('id', id);

        if (addEscolaUserError) return response.status(500).json({ mensagem: 'Erro ao vincular a instituição ao usuário', detalhe: addEscolaUserError.message });

        return response.status(200).json({ mensagem: 'Entrada na instituição realizada com sucesso', instituicao: data });
    } catch (error) {
        console.error('[Instituição] entrar:', error);
        return response.status(500).json({ mensagem: 'Erro ao entrar na instituição' });
    }
};

// Função para cadastrar uma nova instituição de ensino
exports.cadastrarEscola = async (request, response) => {
    const { userID, cnpj, nome, cep, endereco, telefone, logotipo } = request.body;

    if (!userID || !cnpj || !nome || !cep || !endereco || !telefone || !logotipo) {
        return response.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
    }

    try {
        const { data: verificarCNPJ, error: verificarCNPJError } = await supabase
            .from('escolas')
            .select('cnpj')
            .eq('cnpj', cnpj)
            .single();

        if (verificarCNPJError && verificarCNPJError.code !== 'PGRST116') {
            return response.status(500).json({ mensagem: 'Erro ao verificar o CNPJ', detalhe: verificarCNPJError.message });
        }

        if (verificarCNPJ) {
            return response.status(409).json({ mensagem: 'Este CNPJ já está associado a uma instituição.' });
        }

        const codigoAcesso = await createCode();
        if (!codigoAcesso) {
            return response.status(500).json({ mensagem: 'Erro ao gerar código de acesso' });
        }

        const { error: insertError } = await supabase
            .from('escolas')
            .insert({ cnpj, nome, cep, endereco, telefone, logotipo, codigo: codigoAcesso });

        if (insertError) {
            return response.status(500).json({ mensagem: 'Erro ao cadastrar a instituição', detalhe: insertError.message });
        }

        const { error: addEscolaUserError } = await supabase
            .from('usuarios')
            .update({ instituicao: cnpj, cargo: 'Diretor' })
            .eq('id', userID);

        if (addEscolaUserError) {
            console.error('[Instituição] addEscolaUserError:', addEscolaUserError);
            return response.status(500).json({ mensagem: 'Erro ao vincular a instituição ao usuário', detalhe: addEscolaUserError.message });
        }

        return response.status(200).json({ mensagem: 'Instituição de ensino cadastrada com sucesso!', cnpj, nome, logotipo });
    } catch (error) {
        console.error('[Instituição] cadastrar:', error.message);
        return response.status(500).json({ mensagem: 'Erro ao cadastrar instituição de ensino', detalhe: error.message });
    }
};

// Função para editar uma instituição de ensino
exports.editarEscola = async (request, response) => {
    const { cnpj, nome, cep, endereco, telefone, logotipo } = request.body;

    if (!cnpj || !nome || !cep || !endereco || !telefone || !logotipo) {
        return response.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
    }

    try {
        const { error } = await supabase
            .from('escolas')
            .update({ nome, cep, endereco, telefone, logotipo })
            .eq('cnpj', cnpj);

        if (error) {
            return response.status(500).json({ mensagem: 'Erro ao editar a instituição', detalhe: error.message });
        }

        return response.status(200).json({ mensagem: 'Instituição de ensino atualizada com sucesso!' });
    } catch (error) {
        console.error('[Instituição] editar:', error.message);
        return response.status(500).json({ mensagem: 'Erro ao editar instituição de ensino' });
    }
};