import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from '../src/configs/protectedRoute';

// -- Importação das Páginas --

import LandingPage from "./pages/web/landingPage/landingPage";
import PageNotFound from "./pages/web/404";

import HomePage from "./pages/web/home/home";

import AlunosPage from "./pages/web/estudantes/alunos";
import EditarAlunoPage from "./pages/web/estudantes/editarAluno";

import EletivasPage from "./pages/web/eletivas/eletivas";
import EditarEletivaPage from "./pages/web/eletivas/editarEletiva";
import GerenciarEletivaPage from "./pages/web/eletivas/gerenciarEletiva";

import ConfiguracoesPage from "./pages/web/configuracoes/settings";
import EditarPerfilPage from "./pages/web/configuracoes/componentes/perfil/perfil";
import EditarSenhaPage from "./pages/web/auth/changePassword";
import CadastrarInstituicaoPage from "./pages/web/configuracoes/componentes/instituicao/cadastrarInstituicao";
import EditarInstituicaoPage from "./pages/web/configuracoes/componentes/instituicao/editarInstituicao";
import ColaboradoresPage from "./pages/web/configuracoes/componentes/colaboradores/colaboradores";

import LoginPage from "./pages/web/auth/Login";
import RegisterPage from "./pages/web/auth/Register";
import ConfirmarRegistroPage from "./pages/web/auth/confirmRegistration";
import EsqueciSenhaPage from "./pages/web/auth/forgotPassword";
import ResetarSenhaPage from "./pages/web/auth/resetPassword";
import VerificacaoPage from "./pages/web/auth/verification";

import MLoginPage from "./pages/mobile/auth/login";
import MEsqueciSenhaPage from "./pages/mobile/auth/forgotPassword";
import MAlterarSenhaPage from "./pages/mobile/auth/changePassword";
import MVerificacaoPage from "./pages/mobile/auth/verification";

import MHomePage from "./pages/mobile/home/home";

import MEletivasPage from "./pages/mobile/eletivas/eletivas";
import MMinhasEletivasPage from "./pages/mobile/eletivas/minhasEletivas";

import MConfiguracoesPage from "./pages/mobile/configs/settings";

// -- Definir Constantes para Cargos --
const CARGOS_WEB = ['admin', 'diretor', 'coordenador', 'professor'];
const CARGOS_MOBILE = ['aluno', 'professor', 'coordenador', 'diretor', 'admin'];
const SOMENTE_ALUNO = ['aluno'];

// -- Função para Criar Rotas Protegidas --
function criarRotaProtegida(caminho, componente, cargosPermitidos) {
    return { path: caminho, element: <ProtectedRoute element={componente} allowedRoles={cargosPermitidos} /> };
}

// -- Configuração das Rotas --
const rotas = createBrowserRouter([
    { path: '/', element: <LandingPage /> },
    { path: '*', element: <PageNotFound /> },

    // Páginas WEB
    criarRotaProtegida('/home', <HomePage />, [...CARGOS_WEB, 'aluno']),
    criarRotaProtegida('/students', <AlunosPage />, CARGOS_WEB),
    criarRotaProtegida('/student/edit', <EditarAlunoPage />, CARGOS_WEB),
    criarRotaProtegida('/electives', <EletivasPage />, CARGOS_WEB),
    criarRotaProtegida('/electives/edit', <EditarEletivaPage />, ['admin', 'diretor']),
    criarRotaProtegida('/electives/manage', <GerenciarEletivaPage />, ['admin', 'diretor']),
    criarRotaProtegida('/settings', <ConfiguracoesPage />, ['admin', 'diretor']),
    criarRotaProtegida('/settings/profile', <EditarPerfilPage />, CARGOS_WEB),
    criarRotaProtegida('/settings/security', <EditarSenhaPage />, CARGOS_WEB),
    criarRotaProtegida('/settings/institution', <CadastrarInstituicaoPage />, ['admin', 'diretor']),
    criarRotaProtegida('/settings/institution/edit', <EditarInstituicaoPage />, ['admin', 'diretor']),
    criarRotaProtegida('/settings/collaborators', <ColaboradoresPage />, ['admin', 'diretor']),

    { path: '/login', element: <LoginPage /> },
    { path: '/register', element: <RegisterPage /> },
    { path: '/confirm-registration', element: <ConfirmarRegistroPage /> },
    { path: '/forgot-password', element: <EsqueciSenhaPage /> },
    { path: '/reset-password', element: <ResetarSenhaPage /> },
    { path: '/verification', element: <VerificacaoPage /> },

    // Páginas MOBILE
    criarRotaProtegida('/m/home', <MHomePage />, CARGOS_MOBILE),
    criarRotaProtegida('/m/electives', <MEletivasPage />, CARGOS_MOBILE),
    criarRotaProtegida('/m/my-electives', <MMinhasEletivasPage />, SOMENTE_ALUNO),
    criarRotaProtegida('/m/settings', <MConfiguracoesPage />, CARGOS_MOBILE),

    { path: '/m/login', element: <MLoginPage /> },
    { path: '/m/forgot-password', element: <MEsqueciSenhaPage /> },
    { path: '/m/change-password', element: <MAlterarSenhaPage /> },
    { path: '/m/verification', element: <MVerificacaoPage /> },
]);

export default rotas;
