import { createBrowserRouter } from "react-router-dom";

// -- Páginas WEB --------------------
import LandingPage from "./pages/web/landingPage/landingPage";
import PageNotFound from "./pages/web/404";

import Home from "./pages/web/home/home";

import Aluno from "./pages/web/estudantes/alunos";
import EditarAluno from "./pages/web/estudantes/editarAluno";

import Eletivas from "./pages/web/eletivas/eletivas";

import Configuracoes from "./pages/web/configuracoes/settings";
import EditarPerfil from "./pages/web/configuracoes/componentes/perfil/perfil";
import EditarSenha from "./pages/web/configuracoes/componentes/seguranca/seguranca";
import CadastrarInstituicao from "./pages/web/configuracoes/componentes/instituicao/addInstituicao";
import EditarInstituicao from "./pages/web/configuracoes/componentes/instituicao/editarInstituicao";
import Colaboradores from "./pages/web/configuracoes/componentes/colaboradores/colaboradores";

import Login from "./pages/web/auth/Login";
import Register from "./pages/web/auth/Register";
import ConfirmarRegistro from "./pages/web/auth/confirmRegistration";
import EsqueciSenha from "./pages/web/auth/forgotPassword";
import ResetarSenha from "./pages/web/auth/resetPassword";
import Verificacao from "./pages/web/auth/verification";

// -- Páginas MOBILE --------------------
import MLogin from "./pages/mobile/auth/login";
import MForgotPassword from "./pages/mobile/auth/forgotPassword";

const routers = createBrowserRouter([
    { path: '/', element: <LandingPage /> },
    { path: '*', element: <PageNotFound /> },

    // Páginas WEB
    { path: '/home', element: <Home /> },

    { path: '/students', element: <Aluno /> },
    { path: '/edit-student', element: <EditarAluno /> },

    { path: '/electives', element: <Eletivas /> },

    { path: '/settings', element: <Configuracoes /> },
    { path: '/settings/profile', element: <EditarPerfil /> },
    { path: '/settings/security', element: <EditarSenha /> },
    { path: '/settings/institution', element: <CadastrarInstituicao /> },
    { path: '/settings/institution/edit', element: <EditarInstituicao /> },
    { path: '/settings/collaborators', element: <Colaboradores /> },

    { path: '/login', element: <Login /> },
    { path: '/register', element: <Register /> },
    { path: '/confirm-registration', element: <ConfirmarRegistro /> },
    { path: '/forgot-password', element: <EsqueciSenha /> },
    { path: '/reset-password', element: <ResetarSenha /> },
    { path: '/verification', element: <Verificacao /> },

    // Páginas MOBILE
    { path: '/mobile/login', element: <MLogin /> },
    { path: '/mobile/forgot-password', element: <MForgotPassword /> },
]);

export default routers;
