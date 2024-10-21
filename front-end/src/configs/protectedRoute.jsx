import React, { useEffect } from 'react';

const ProtectedRoute = ({ element, allowedRoles }) => {
    const aluno = JSON.parse(sessionStorage.getItem('aluno')) || null;
    const user = JSON.parse(sessionStorage.getItem('user')) || null;

    const cargo = aluno ? 'Aluno' : user?.cargo;

    useEffect(() => {
        // Verifica se o cargo é 'First' e se a URL atual já não é '/fa'
        if (cargo === 'First' && window.location.pathname !== '/first-access') {
            // Redireciona para /fa sem entrar em loop
            window.location.replace('/first-access');
        }
    }, [cargo]);

    if (cargo) {
        // Verifica se o cargo é 'ADMIN', permite o acesso sem restrições
        if (cargo === 'ADMIN') {
            return element;
        }

        // Se o cargo não for 'ADMIN' ou 'FIRST', verifica se o cargo está entre os permitidos
        if (allowedRoles.includes(cargo)) {
            return element;
        } else {
            // Redirecionamento condicional baseado no tipo de usuário
            const redirectPath = aluno ? '/m/home' : '/home';
            if (window.location.pathname !== redirectPath) {
                window.location.replace(redirectPath);
            }
            return null;
        }
    } else {
        // Caso não haja cargo definido, redireciona para a página inicial
        if (window.location.pathname !== '/') {
            window.location.replace('/');
        }
        return null;
    }
};

export default ProtectedRoute;
