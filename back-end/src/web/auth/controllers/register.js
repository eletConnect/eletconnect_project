const bcrypt = require('bcrypt');
const supabase = require('../../../configs/supabase');
const { createToken } = require('../services/tokenService');
const { sendEmail } = require('../services/emailService');

exports.register = async (request, response) => {
    const { nome, email, senha } = request.body;
    const criptografarSenha = await bcrypt.hash(senha, 10);

    try {
        const { data: verificarEMAIL, error: verificarEMAIL_ERROR } = await supabase
            .from('usuarios')
            .select('email')
            .eq('email', email);

        if (verificarEMAIL && verificarEMAIL.length > 0) {
            return response.status(401).json({ mensagem: 'Este e-mail já está registrado.' });
        }

        if (verificarEMAIL_ERROR) {
            return response.status(401).json({ mensagem: 'Erro ao verificar o e-mail fornecido.' });
        }

        if (senha.length < 6) {
            return response.status(401).json({ mensagem: 'A senha deve ter pelo menos 6 caracteres.' });
        }

        const token = createToken();
        if (!token) {
            return response.status(401).json({ mensagem: 'Erro ao gerar o token.' });
        }

        const { error } = await supabase
            .from('usuarios')
            .insert([{ nome, email, senha: criptografarSenha, token }]);

        if (error) {
            return response.status(401).json({ mensagem: 'Erro ao salvar seus dados.' });
        }

        await sendEmail(email, 'Verifique sua conta', `Olá!\n\nVerifique sua conta clicando no link: http://localhost:5173/confirm-registration?tkn=${token}`);

        return response.status(200).json({ mensagem: 'Conta criada com sucesso! Verifique seu e-mail.' });
    } catch (error) {
        console.error('[Auth: register]', error.message);
        response.status(500).json({ mensagem: 'Erro ao tentar criar sua conta.' });
    }
};
