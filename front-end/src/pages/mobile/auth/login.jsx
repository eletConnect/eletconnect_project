import "./auth.css";
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import imgLogin from "../../../assets/images/mobile/Login-pana.png";
import escolaLogo from "../../../assets/images/mobile/Escola logo.png";

export default function Login() {
    const [matricula, setMatricula] = useState('');
    const [senha, setSenha] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('');

    const realizarLogin = async (event) => {
        event.preventDefault();

        try {
            const response = await axios.post('http://localhost:3001/m/auth/login', { matricula, senha });
            if (response.status === 200) {
                if (response.data.senha_temporaria === true) {
                    // Se a senha for temporária, redireciona para a página de troca de senha
                    setAlertMessage('Sua senha é temporária. Por favor, altere sua senha para continuar.');
                    setAlertType('warning');
                    setTimeout(() => {
                        window.location.href = '/m/change-password';
                    }, 1500);
                } else {
                    // Se a senha não for temporária, redireciona para a verificação
                    setAlertMessage('Login realizado com sucesso!');
                    setAlertType('success');
                    setTimeout(() => {
                        window.location.href = '/m/verification';
                    }, 1500);
                }
            }
        } catch (error) {
            const errorMessage = error.response?.data?.mensagem || 'Ocorreu um erro inesperado. Tente novamente mais tarde.';
            setAlertMessage(errorMessage);
            setAlertType('danger');
        }
    };

    return (
        <>
            <div className="emCima">
                <img src={imgLogin} alt="imgLogin" />
            </div>

            <div className="emBaixo">
                <div className="m-4 text-center d-flex flex-column justify-content-center">
                    <span className="text-center d-flex flex-column align-items-center mb-4">
                        <img width={50} src={escolaLogo} alt="Escola logo" />
                        <p className="m-0">CEM 03 TAGUATINGA</p>
                    </span>
                    <div className="d-flex flex-column justify-content-center">
                        <span className="mb-3">
                            <h2 className="m-0">Fazer login na sua conta</h2>
                            <small>Você precisa fazer login para selecionar as eletivas.</small>
                        </span>
                        <form className="mb-2" onSubmit={realizarLogin}>
                            <div className="form-floating mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    id="floatingInput"
                                    placeholder="Matricula"
                                    value={matricula}
                                    onChange={(e) => setMatricula(e.target.value)}
                                    required
                                />
                                <label htmlFor="floatingInput">Matricula</label>
                            </div>
                            <div className="form-floating">
                                <input
                                    type="password"
                                    className="form-control"
                                    id="floatingPassword"
                                    placeholder="Senha"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    required
                                />
                                <label htmlFor="floatingPassword">Senha</label>
                            </div>
                            <button className="btn btn-primary w-100 p-2 mt-4" type="submit">Continuar</button>
                        </form>
                        <p>Esqueceu a senha? <Link to="/m/forgot-password">Redefinir senha.</Link></p>
                        {alertMessage && (
                            <div className={`alert alert-${alertType}`} role="alert">
                                {alertMessage}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
