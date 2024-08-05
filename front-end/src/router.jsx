import { createBrowserRouter } from "react-router-dom";

// -- Páginas WEB --------------------
import LandingPage from "./pages/web/landingPage/landingPage";
import PageNotFound from "./pages/web/404";

import Home from "./pages/web/home/home";

import Students from "./pages/web/estudantes/alunos";
import EditStudents from "./pages/web/estudantes/editarAluno";
import ViewStudents from "./pages/web/estudantes/visualizarAluno";

import Eletivas from "./pages/web/eletivas/eletivas";

import Settings from "./pages/web/configuracoes/settings";
import SettingPerfil from "./pages/web/configuracoes/componentes/perfil/perfil";
import SettingSegurancao from "./pages/web/configuracoes/componentes/seguranca/seguranca";
import ADDInstituicao from "./pages/web/configuracoes/componentes/instituicao/addInstituicao"
import EditInstituicao from "./pages/web/configuracoes/componentes/instituicao/editarInstituicao";
import SettingColaboradores from "./pages/web/configuracoes/componentes/colaboradores/colaboradores";

import Login from "./pages/web/auth/Login";
import Register from "./pages/web/auth/Register";
import ConfirmRegistration from "./pages/web/auth/confirmRegistration";
import ForgotPassword from "./pages/web/auth/forgotPassword";
import ResetPassword from "./pages/web/auth/resetPassword";
import Verification from "./pages/web/auth/verification";

// -- Páginas MOBILE -------------------- 
import StudentLogin from "./pages/mobile/auth/login";
import StudentForgotPassword from "./pages/mobile/auth/forgotPassword";

const routers = createBrowserRouter([
    // Páginas WEB
    { path: '/', element: <LandingPage /> },
    { path: '*', element: <PageNotFound /> },

    { path: '/home', element: <Home /> },

    { path: '/students', element: <Students /> },
    { path: '/edit-student', element: <EditStudents />},
    { path: '/view-student', element: <ViewStudents />},

    { path: '/electives', element: <Eletivas /> },

    { path: '/settings', element: <Settings /> },
    { path: '/settings/profile', element: <SettingPerfil /> },
    { path: '/settings/security', element: <SettingSegurancao />},
    { path: '/settings/institution', element: <EditInstituicao />},
    { path: '/institution', element: <ADDInstituicao /> },
    { path: '/settings/collaborators', element: <SettingColaboradores />},


    { path: '/login', element: <Login /> },
    { path: '/register', element: <Register /> },
    { path: '/confirm-registration', element: <ConfirmRegistration /> },
    { path: '/forgot-password', element: <ForgotPassword /> },
    { path: '/reset-password', element: <ResetPassword /> },
    { path: '/verification', element: <Verification /> },

    // Páginas MOBILE
    { path: '/mobile/login', element: <StudentLogin /> },
    { path: '/mobile/forgot-password', element: <StudentForgotPassword /> },
]);

export default routers;