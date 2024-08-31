import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element, allowedRoles }) => {
    const aluno = JSON.parse(sessionStorage.getItem('aluno')) || null;
    const user = JSON.parse(sessionStorage.getItem('user')) || null;

    const cargo = aluno ? 'aluno' : user?.cargo;

    if (cargo) {
        if (allowedRoles.includes(cargo)) {
            return element;
        } else {
            // Redirecionamento condicional baseado no tipo de usuário
            const redirectPath = aluno ? '/m/home' : '/home';
            return <Navigate to={redirectPath} replace />;
        }
    } else {
        return <Navigate to="/" replace />;
    }
};

export default ProtectedRoute;
