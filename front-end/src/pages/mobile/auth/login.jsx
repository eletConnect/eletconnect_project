import "./auth.css";
import React from 'react';
import { Link } from 'react-router-dom';

import imgLogin from "../../../assets/images/mobile/Login-pana.png";
import escolaLogo from "../../../assets/images/mobile/Escola logo.png";


export default function Login() {
    return (
        <>
            <div className="emCima">
                <img src={imgLogin} alt="imgLogin" />
            </div>
            <div className="emBaixo ">
                <div className="m-4 text-center d-flex flex-column justify-content-center">
                    <span className="d-flex align-items-center gap-2 mb-4">
                        <img width={50} src={escolaLogo} alt="" />
                        <p className="m-0">CEM 03 TAGUATINGA</p>
                    </span>
                    <div className="d-flex flex-column justify-content-center">
                        <span className="mb-3">
                            <h1 className="m-0">Fazer login na sua conta</h1>
                            <small>Você precisa fazer login selecionar as eletivas.</small>
                        </span>
                        <form className="mb-2" action="/mobile/aluno" method="post">
                            <div className="form-floating mb-3">
                                <input type="email" className="form-control" id="floatingInput" placeholder="name@example.com" required />
                                <label>Email address</label>
                            </div>
                            <div className="form-floating">
                                <input type="password" className="form-control" id="floatingPassword" placeholder="Password" required />
                                <label>Password</label>
                            </div>
                            <button className="btn btn-primary w-100 p-2 mt-4">Continuar</button>
                        </form>
                        <p>Esqueceu a senha? <Link to={"/mobile/forgot-password"}>Redefinir senha.</Link></p>
                    </div>
                </div>
            </div>
        </>
    );
}