const supabase = require('../../../configs/supabase');
const { v4: uuidv4 } = require('uuid');

function createCode() {
    const uuid = uuidv4();
    const numericPart = parseInt(uuid.replace(/-/g, '').slice(0, 8), 16);
    return String(numericPart % 10000).padStart(4, '0');
}

exports.cadastrarEletiva = async (request, response) => {
    const { instituicao, nome, tipo, dia, horario, professor, sala, total_alunos, serie, turma, exclusiva } = request.body;

    // Validação básica
    if (!instituicao || !nome || !tipo || !professor || !total_alunos) {
        return response.status(400).json({ mensagem: 'Dados incompletos' });
    }

    // Verificação explícita de booleans para "exclusiva"
    const isExclusiva = exclusiva === true || exclusiva === 'true'; // Tratar caso venha como string ou booleano

    // Validação adicional se a eletiva for exclusiva
    if (isExclusiva && (!serie || !turma)) {
        return response.status(400).json({ mensagem: 'Dados da série e turma são necessários para eletivas exclusivas' });
    }

    try {
        // Inserção no banco de dados
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
                status: 'Ativa',
                exclusiva: isExclusiva,  // Certifica-se de que exclusiva é tratado como booleano
                serie: isExclusiva ? serie : null,  // Armazena série apenas se for exclusiva
                turma: isExclusiva ? turma : null   // Armazena turma apenas se for exclusiva
            }]);

        // Verificação de erro
        if (eletivaError) {
            return response.status(500).json({ mensagem: 'Erro ao cadastrar a eletiva', detalhe: eletivaError.message });
        }

        // Sucesso
        return response.status(201).json({ mensagem: 'Eletiva cadastrada com sucesso', eletiva: eletivaData });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao cadastrar a eletiva', detalhe: error.message });
    }
};
