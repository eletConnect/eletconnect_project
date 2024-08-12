const supabase = require('../../configs/supabase');
const { v4: uuidv4 } = require('uuid');

// Função para criar um token
function createCode() {
    // Gera um UUID
    const uuid = uuidv4();

    // Extrai uma parte do UUID e converte para um número
    const numericPart = parseInt(uuid.replace(/-/g, '').slice(0, 8), 16);

    // Usa o número gerado para criar um código de 4 dígitos
    const uniqueCode = numericPart % 10000;

    // Garante que o código tenha exatamente 4 dígitos, preenchendo com zeros à esquerda se necessário
    return String(uniqueCode).padStart(4, '0');
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
}

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
            .eq('codigo', codigo || 'instituicao', instituicao);

        if (eletivaError) {
            return response.status(500).json({ mensagem: 'Erro ao buscar a eletiva', detalhe: eletivaError.message });
        }

        return response.status(200).json(eletivaData);
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao buscar a eletiva', detalhe: error.message });
    }
}

// Função para cadastrar uma nova eletiva
exports.cadastrarEletiva = async (request, response) => {
    const { instituicao, nome, tipo, professor, total_alunos } = request.body;

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
                professor,
                total_alunos,
                status: 'Ativa'
            }]);

        if (eletivaError) {
            return response.status(500).json({ mensagem: 'Erro ao cadastrar a eletiva', detalhe: eletivaError.message });
        }

        return response.status(200).json({ mensagem: 'Eletiva cadastrada com sucesso' });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao cadastrar a eletiva', detalhe: error.message });
    }
}

// Função para editar uma eletiva
exports.editarEletiva = async (request, response) => {
    const { codigo, instituicao, nome, tipo, professor, total_alunos, status } = request.body;

    if (!codigo || !instituicao || !nome || !tipo || !professor || !total_alunos || !status) {
        return response.status(400).json({ mensagem: 'Dados incompletos' });
    }

    try {
        const { data: eletivaData, error: eletivaError } = await supabase
            .from('eletivas')
            .update({
                nome,
                tipo,
                professor,
                total_alunos,
                status
            })
            .eq('codigo', codigo || 'instituicao', instituicao);    

        if (eletivaError) {
            return response.status(500).json({ mensagem: 'Erro ao editar a eletiva', detalhe: eletivaError.message });
        }

        return response.status(200).json({ mensagem: 'Eletiva editada com sucesso' });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao editar a eletiva', detalhe: error.message });
    }
}

// Função para excluir uma eletiva
exports.excluirEletiva = async (request, response) => {
    const { codigo, instituicao } = request.body;

    console.log(codigo, instituicao);

    if (!codigo || !instituicao) {
        return response.status(400).json({ mensagem: 'Dados incompletos' });
    }

    try {
        const { data: eletivaData, error: eletivaError } = await supabase
            .from('eletivas')
            .delete()
            .eq('codigo', codigo || 'instituicao', instituicao);

        if (eletivaError) {
            return response.status(500).json({ mensagem: 'Erro ao excluir a eletiva', detalhe: eletivaError.message });
        }

        return response.status(200).json({ mensagem: 'Eletiva excluída com sucesso' });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao excluir a eletiva', detalhe: error.message });
    }
}