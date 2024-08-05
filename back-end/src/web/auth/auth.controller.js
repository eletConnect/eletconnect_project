const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const supabase = require('../../configs/supabase');

// Função para enviar e-mail
async function sendEmail(email, subject, text) {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        await transporter.sendMail({
            from: '"Autenticação" <eletconnect@outlook.com>',
            to: email,
            subject,
            text
        });

        return true;
    } catch (error) {
        console.error('[Auth: e-mail]:', error);
        return false;
    }
}

// Função para criar um token
function createToken() {
    const agoraNoBrasil = new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' });
    const agoraISOBrasil = new Date(agoraNoBrasil).toISOString();
    return `${uuidv4()}tt:${agoraISOBrasil}`;
}

// Função para verificar se o token é válido e não expirou
async function verifyToken(token) {
    if (!token) {
        return { status: false, message: 'Nenhum token foi fornecido.' };
    }

    const partesToken = token.split('tt:');
    if (partesToken.length !== 2) {
        return { status: false, message: 'O token fornecido é inválido.' };
    }

    const expiracaoTokenISO = partesToken[1];
    const expiracaoToken = new Date(expiracaoTokenISO);

    const timeZone = 'America/Sao_Paulo';
    const agoraNoBrasil = new Date().toLocaleString('en-US', { timeZone });
    const agoraNoBrasilDate = new Date(agoraNoBrasil);

    expiracaoToken.setTime(expiracaoToken.getTime() + expiracaoToken.getTimezoneOffset() * 60000);

    const umHoraEmMillis = 60 * 60 * 1000;
    if (agoraNoBrasilDate > expiracaoToken.getTime() + umHoraEmMillis) {
        return { status: false, message: 'O token fornecido expirou ou não é mais válido.' };
    }

    return { status: true };
}

// --------------------------------------------
// Função para fazer login do usuário
exports.login = async (request, response) => {
    const { email, senha } = request.body;

    try {
        const { data: user, error: userERROR } = await supabase
            .from('usuarios')
            .select('id, matricula, nome, senha, status, avatar, cargo, confirmed_at')
            .eq('email', email)
            .single();

        if (!user || !(await bcrypt.compare(senha, user.senha))) {
            return response.status(401).json({ mensagem: 'Desculpe, mas as credenciais de e-mail e senha fornecidas não parecem estar corretas. Por favor, verifique-as e tente novamente.' });
        }

        if (!user.confirmed_at) {
            return response.status(406).json({ mensagem: 'Seu e-mail ainda não foi confirmado. Antes de fazer login, por favor, verifique sua caixa de entrada e confirme o e-mail de registro.' });
        }

        if (userERROR) {
            return response.status(401).json({ mensagem: 'Ocorreu um erro ao verificar o e-mail fornecido. Por favor, tente novamente mais tarde.' });
        }

        request.session.user = { id: user.id, matricula: user.matricula, nome: user.nome, email, status: user.status, cargo: user.cargo, avatar: user.avatar };
        response.status(200).json({ mensagem: 'Login efetuado com sucesso!' });
    } catch (error) {
        console.error('[Auth: login]', error.message);
        response.status(500).json({ mensagem: 'Ocorreu um problema ao tentar fazer login. Por favor, tente novamente mais tarde.' });
    }
};

// Função para registrar um novo usuário
exports.register = async (request, response) => {
    const { nome, email, senha } = request.body;
    const criptografarSenha = await bcrypt.hash(senha, 10);

    try {
        const { data: verificarEMAIL, error: verificarEMAIL_ERROR } = await supabase
            .from('usuarios')
            .select('email')
            .eq('email', email);

        if (verificarEMAIL && verificarEMAIL.length > 0) {
            return response.status(401).json({ mensagem: 'Este endereço de e-mail já está registrado em uma conta existente. Por favor, faça login utilizando suas credenciais ou utilize a opção de recuperação de senha, se necessário.' });
        }

        if (verificarEMAIL_ERROR) {
            console.log(verificarEMAIL_ERROR);
            return response.status(401).json({ mensagem: 'Ocorreu um erro ao verificar o e-mail fornecido. Por favor, tente novamente mais tarde.' });
        }

        if (senha.length < 6) {
            return response.status(401).json({ mensagem: 'A senha fornecida é muito curta. Por favor, insira uma senha com pelo menos 6 caracteres.' });
        }

        const token = createToken();
        if (!token) {
            return response.status(401).json({ mensagem: 'Ocorreu um erro ao gerar o token. Por favor, tente novamente mais tarde.' });
        }

        const { error } = await supabase
            .from('usuarios')
            .insert([
                { nome: nome, email: email, senha: criptografarSenha, token: token }
            ]);

        if (error) {
            return response.status(401).json({ mensagem: 'Houve um erro ao salvar seus dados no banco de dados. Por favor, tente novamente mais tarde.' });
        }

        await sendEmail(email, 'Agora só falta verificar sua conta!', `Olá!\n\nPara finalizar o seu cadastro falta apenas verificar a sua conta.\nBasta clicar no link a seguir: http://localhost:5173/confirm-registration?tkn=${token}\n\nSe você não solicitou o cadastro, por favor, ignore este e-mail.\n\nAtenciosamente,\nEquipe eletConnect.`);

        return response.status(200).json({ mensagem: 'Sua conta foi criada! Enviamos um e-mail com instruções para verificar sua conta para o endereço de e-mail fornecido. Por favor, verifique sua caixa de entrada.' });
    } catch (error) {
        console.error('[Auth: register]', error.message);
        response.status(500).json({ mensagem: 'Ocorreu um problema ao tentar criar sua conta. Por favor, tente novamente mais tarde.' });
    }
};

// Função para confirmar o registro do usuário
exports.confirmRegistration = async (request, response) => {
    const { token } = request.body;

    const { status, message } = await verifyToken(token);
    if (status !== true) {
        return response.status(401).json({ mensagem: message });
    }

    try {
        const { data: user, error: userERROR } = await supabase
            .from('usuarios')
            .select('confirmed_at, id')
            .eq('token', token)
            .single();

        if (!user) {
            return response.status(401).json({ mensagem: 'O token fornecido é inválido.' });
        }

        if (user.confirmed_at) {
            return response.status(401).json({ mensagem: 'O e-mail associado à sua conta já foi verificado anteriormente.' });
        }

        if (userERROR) {
            return response.status(401).json({ mensagem: 'Ocorreu um erro ao verificar o token fornecido. Por favor, tente novamente mais tarde.' });
        }

        const { error } = await supabase
            .from('usuarios')
            .update({ confirmed_at: new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }) })
            .eq('id', user.id);

        if (error) {
            return response.status(500).json({ mensagem: 'Ocorreu um erro ao atualizar a confirmação do seu e-mail. Por favor, tente novamente mais tarde.' });
        }

        return response.status(200).json({ mensagem: 'E-mail verificado com sucesso!' });
    } catch (error) {
        console.error('[Auth: confirm]', error.message);
        response.status(500).json({ mensagem: 'Ocorreu um problema ao tentar validar sua conta. Por favor, tente novamente mais tarde.' });
    }
};

// Função para enviar e-mail de redefinição de senha
exports.forgotPassword = async (request, response) => {
    const { email } = request.body;

    try {
        const { data: user, error: userERROR } = await supabase
            .from('usuarios')
            .select('id')
            .eq('email', email)
            .single();

        if (!user) {
            return response.status(401).json({ mensagem: 'O e-mail inserido não está vinculado a nenhuma conta. Por favor, verifique o e-mail e tente novamente.' });
        }

        if (userERROR) {
            console.log(userERROR);
            return response.status(401).json({ mensagem: 'Ocorreu um erro ao verificar o e-mail fornecido. Por favor, tente novamente mais tarde.' });
        }

        const token = createToken();
        if (!token) {
            return response.status(401).json({ mensagem: 'Ocorreu um problema ao gerar o token. Por favor, tente novamente mais tarde.' });
        }

        const { error: insertError } = await supabase
            .from('usuarios')
            .update({ token: token })
            .eq('id', user.id);

        if (insertError) {
            return response.status(401).json({ mensagem: 'Ocorreu um erro ao atualizar o token. Por favor, tente novamente mais tarde.' });
        }

        await sendEmail(email, 'Vish! Parece que você esqueceu sua senha.', `Olá!\n\nPelo visto você esqueceu sua senha, né? Mas não se preocupe, é bem simples redefinir a senha. Basta clicar no link a seguir para redefini-la:\n\nhttp://localhost:5173/reset-password?tkn=${token}\n\nSe você não solicitou a redefinição, por favor, ignore este e-mail.\n\nAtenciosamente,\nEquipe eletConnect.`);

        return response.status(200).json({ mensagem: 'E-mail de redefinição de senha enviado com sucesso! Por favor, verifique sua caixa de entrada.' });
    } catch (error) {
        console.error('[Auth: forgot]', error.message);
        response.status(500).json({ mensagem: 'Ocorreu um problema ao tentar enviar o e-mail de redefinição de senha. Por favor, tente novamente mais tarde.' });
    }
};

// Função para redefinir a senha do usuário
exports.resetPassword = async (request, response) => {
    const { senha, token } = request.body;

    const { status, message } = await verifyToken(token);
    if (status !== true) {
        return response.status(401).json({ mensagem: message });
    }

    try {
        const { data: user, error: userERROR } = await supabase
            .from('usuarios')
            .select('id, senha')
            .eq('token', token)
            .single();

        if (!user) {
            return response.status(401).json({ mensagem: 'O token fornecido é inválido. Por favor, tente novamente.' });
        }

        if (userERROR) {
            return response.status(401).json({ mensagem: 'Ocorreu um erro ao verificar o token fornecido. Por favor, tente novamente mais tarde.' });
        }

        if (senha.length < 6) {
            return response.status(401).json({ mensagem: 'A senha fornecida é muito curta. Por favor, insira uma senha com pelo menos 6 caracteres.' });
        }

        if (await bcrypt.compare(senha, user.senha)) {
            return response.status(401).json({ mensagem: 'A nova senha não pode ser igual à senha anterior. Por favor, insira uma nova senha diferente.' });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);
        const { error } = await supabase
            .from('usuarios')
            .update({ senha: hashedPassword })
            .eq('id', user.id);

        if (error) {
            return response.status(500).json({ mensagem: 'Ocorreu um erro ao redefinir a senha da sua conta. Por favor, tente novamente mais tarde.' });
        }

        return response.status(200).json({ mensagem: 'Senha redefinida com sucesso!' });
    } catch (error) {
        console.error('[Auth: reset]', error.message);
        response.status(500).json({ mensagem: 'Ocorreu um problema ao tentar redefinir a senha da sua conta. Por favor, tente novamente mais tarde.' });
    }
};

// Função para atualizar a senha do usuário
exports.updatePassword = async (request, response) => {
    const { id, senhaAtual, novaSenha } = request.body;

    try {
        const { data: user, error: userERROR } = await supabase
            .from('usuarios')
            .select('id, senha')
            .eq('id', id)
            .single();

        if (!user || !(await bcrypt.compare(senhaAtual, user.senha))) {
            return response.status(401).json({ mensagem: 'A senha atual fornecida não corresponde à senha associada à sua conta. Por favor, verifique a senha e tente novamente.' });
        }

        if (await bcrypt.compare(novaSenha, user.senha)) {
            return response.status(401).json({ mensagem: 'A nova senha não pode ser igual à senha anterior. Por favor, insira uma nova senha diferente.' });
        }

        if (senhaAtual.length < 6 || novaSenha.length < 6) {
            return response.status(401).json({ mensagem: 'A senha fornecida é muito curta. Por favor, insira uma senha com pelo menos 6 caracteres.' });
        }

        const hashedPassword = await bcrypt.hash(novaSenha, 10);
        const { error } = await supabase
            .from('usuarios')
            .update({ senha: hashedPassword })
            .eq('id', id);

        if (error) {
            return response.status(500).json({ mensagem: 'Ocorreu um erro ao atualizar a senha da sua conta. Por favor, tente novamente mais tarde.' });
        }

        return response.status(200).json({ mensagem: 'Senha atualizada com sucesso!' });
    } catch (error) {
        console.error('[Auth: update]', error.message);
        response.status(500).json({ mensagem: 'Ocorreu um problema ao tentar atualizar a senha da sua conta. Por favor, tente novamente mais tarde.' });
    }
};

// Função para fazer o usuário fazer logout
exports.logout = async (request, response) => {
    try {
        request.session.destroy((error) => {
            if (error) {
                return response.status(500).json({ mensagem: 'Ocorreu um erro ao finalizar sua sessão. Por favor, tente novamente mais tarde.' });
            }

            return response.status(200).json({ mensagem: 'Logout efetuado com sucesso!' });
        });
    } catch (error) {
        console.error('[Auth: logout]', error.message);
        response.status(500).json({ mensagem: 'Ocorreu um problema ao tentar finalizar sua sessão. Por favor, tente novamente mais tarde.' });
    }
};

// Função para verificar a sessão do usuário
exports.checkSession = async (request, response) => {
    try {
        if (request.session.user) {
            response.status(200).json({
                id: request.session.user.id,
                matricula: request.session.user.matricula,
                nome: request.session.user.nome,
                email: request.session.user.email,
                avatar: request.session.user.avatar,
                cargo: request.session.user.cargo,
                status: request.session.user.status
            });
        } else {
            response.status(401).json({ mensagem: 'Nenhuma sessão ativa foi encontrada. Por favor, faça login para continuar.' });
        }
    } catch (error) {
        console.error('[Auth: check]', error.message);
        response.status(500).json({ mensagem: 'Ocorreu um problema ao tentar verificar sua sessão. Por favor, tente novamente mais tarde.' });
    }
};

// Função para atualizar o perfil do usuário
exports.atualizar = async (request, response) => {
    const { id, nome, email, avatar } = request.body;
    console.log(request.body);
    try {
        const { data: user, error: userERROR } = await supabase
            .from('usuarios')
            .select('id')
            .eq('id', id)
            .single();

        if (!user) {
            return response.status(401).json({ mensagem: 'O usuário fornecido não foi encontrado. Por favor, tente novamente.' });
        }

        if (userERROR) {
            return response.status(401).json({ mensagem: 'Ocorreu um erro ao verificar o usuário fornecido. Por favor, tente novamente mais tarde.' });
        }

        const { error } = await supabase
            .from('usuarios')
            .update({ nome, email, avatar })
            .eq('id', id);

        if (error) {
            return response.status(500).json({ mensagem: 'Ocorreu um erro ao atualizar o perfil do usuário. Por favor, tente novamente mais tarde.' });
        }

        return response.status(200).json({ mensagem: 'Perfil atualizado com sucesso!' });
    } catch (error) {
        console.error('[Auth: atualizar]', error.message);
        response.status(500).json({ mensagem: 'Ocorreu um problema ao tentar atualizar o perfil do usuário. Por favor, tente novamente mais tarde.' });
    }
}