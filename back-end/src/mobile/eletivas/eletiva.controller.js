const supabase = require('../../configs/supabase');

exports.listarEletivas = async (require, response) => {
    const { instituicao } = require.body;
    try {
        const { data, error } = await supabase
            .from('eletivas')
            .select('*')
            .eq('instituicao', instituicao);

        if (error) {
            return response.status(400).json({ error: 'Erro ao listar eletivas!' });
        }

        return response.status(200).json({ eletivas: data });
    } catch (error) {
        console.error('Erro ao listar eletivas:', error);
        return response.status(500).json({ error: 'Erro ao listar eletivas!' });
    }
}

exports.minhasEletivas = async (req, res) => {
    const { matricula, instituicao } = req.body;

    try {
        // Buscar os códigos das eletivas nas quais o aluno está matriculado
        const { data: eletivas, error: fetchError } = await supabase
            .from('aluno_eletiva')
            .select('codigo_eletiva')
            .eq('matricula_aluno', matricula)
            .eq('instituicao', instituicao);

        if (fetchError) {
            console.error('Erro ao listar eletivas do aluno:', fetchError);
            return res.status(500).json({ error: 'Erro ao listar eletivas do aluno!' });
        }

        const codigosEletivas = eletivas.map(eletiva => eletiva.codigo_eletiva);

        // Buscar as informações detalhadas das eletivas
        const { data, error } = await supabase
            .from('eletivas')
            .select('*')
            .in('codigo', codigosEletivas);

        if (error) {
            console.error('Erro ao listar eletivas:', error);
            return res.status(400).json({ error: 'Erro ao listar eletivas!' });
        }

        return res.status(200).json({ eletivas: data });
    } catch (error) {
        console.error('Erro ao listar eletivas:', error);
        return res.status(500).json({ error: 'Erro ao listar eletivas!' });
    }
}


exports.participarEletiva = async (req, res) => {
    const { codigo, matricula, instituicao } = req.body;

    console.log(req.body);

    try {
        // Verificar se o aluno já está cadastrado na eletiva
        const { data: alunoEletiva, error: fetchError } = await supabase
            .from('aluno_eletiva')
            .select('*')
            .eq('codigo_eletiva', codigo)
            .eq('matricula_aluno', matricula)
            .eq('instituicao', instituicao);

        if (fetchError) {
            console.error('Erro ao verificar participação na eletiva:', fetchError);
            return res.status(500).json({ error: 'Erro ao verificar participação na eletiva!' });
        }

        // Se o aluno já estiver cadastrado, retornar uma mensagem de erro
        if (alunoEletiva.length > 0) {
            return res.status(400).json({ error: 'Você já está cadastrado nesta eletiva!' });
        }

        // Caso não esteja cadastrado, inserir o novo registro
        const { error: insertError } = await supabase
            .from('aluno_eletiva')
            .insert([{ codigo_eletiva: codigo, matricula_aluno: matricula, instituicao }]);

        if (insertError) {
            console.error('Erro ao participar da eletiva:', insertError);
            return res.status(400).json({ error: 'Erro ao participar da eletiva!' });
        }

        return res.status(200).json({ message: 'Participação realizada com sucesso!' });
    } catch (error) {
        console.error('Erro ao participar da eletiva:', error);
        return res.status(500).json({ error: 'Erro ao participar da eletiva!' });
    }
}
