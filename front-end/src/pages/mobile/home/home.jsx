import React, { useState, useEffect } from 'react';
import MHeader from '../../../components/mheader';
import MFooter from '../../../components/mfooter';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Home() {
    const aulas = {
        Terca: [
            {
                hora: '09:00 às 10:30 (1º e 2º horários)',
                materia: 'Banco de Dados',
                local: 'Aca - 102 - Informática Bloco A - Taguatinga II',
            }
        ],
        Quinta: [
            {
                hora: '08:00 às 09:40 (1º e 2º horários)',
                materia: 'Testes e Qualidade de Software',
                local: 'Aca - 179 - Informática Bloco UN - Taguatinga II',
            },
            {
                hora: '10:00 às 10:50 (3º e 4º horários)',
                materia: 'Testes e Qualidade de Software',
                local: 'Aca - 179 - Informática Bloco UN - Taguatinga II',
            },
            {
                hora: '10:00 às 10:50 (5º e 6º horários)',
                materia: 'Testes e Qualidade de Software',
                local: 'Aca - 179 - Informática Bloco UN - Taguatinga II',
            }
        ]
    };

    // Mapeamento de chaves de dia para nomes completos
    const diasSemana = [
        { key: 'Terca', label: 'Terça-feira' },
        { key: 'Quinta', label: 'Quinta-feira' }
    ];

    const [diaSelecionado, setDiaSelecionado] = useState('');
    const [carregando, setCarregando] = useState(true); // Estado de carregamento

    // Função para obter o dia da semana
    useEffect(() => {
        setCarregando(true); // Ativa o carregamento

        setTimeout(() => {
            const hoje = new Date().getDay(); // 0 (Domingo), 1 (Segunda), ..., 6 (Sábado)

            if (hoje === 2) {
                setDiaSelecionado('Terca'); // Terça-feira
            } else if (hoje === 4) {
                setDiaSelecionado('Quinta'); // Quinta-feira
            } else {
                setDiaSelecionado('SemAula'); // Se não for terça ou quinta
            }

            setCarregando(false); // Desativa o carregamento
        }, 1000); // Simulando um carregamento de 1 segundo (você pode ajustar esse tempo)
    }, []);

    return (
        <>
            <MHeader />
            <main className="container my-4">
                {carregando ? ( // Exibe o spinner de carregamento antes do conteúdo principal
                    <div className="d-flex justify-content-center align-items-center mb-4">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Carregando...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div className="d-flex align-items-center">
                                <i className="bi bi-backpack me-2 h4 mb-0"></i>
                                <h5 className="mb-0">AULAS</h5>
                            </div>
                            <i className="bi bi-arrow-right h4"></i>
                        </div>

                        <div className="row">
                            {/* Coluna de dias */}
                            <div className="col-md-3 mb-4">
                                <div className="d-flex gap-2">
                                    {diasSemana.map((dia, index) => (
                                        <button
                                            key={index}
                                            className={`btn btn-outline-secondary w-100 ${diaSelecionado === dia.key ? 'active' : ''}`}
                                            onClick={() => setDiaSelecionado(dia.key)}
                                        >
                                            {dia.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Coluna de aulas */}
                            <div className="col-md-9">
                                {diaSelecionado === 'SemAula' ? (
                                    <p className="text-muted">Sem aula hoje</p>
                                ) : (
                                    aulas[diaSelecionado]?.length > 0 ? (
                                        aulas[diaSelecionado].map((horario, index) => (
                                            <div key={index} className="card mb-4 border-light shadow-sm">
                                                <div className="card-header bg-white border-0">
                                                    <h6 className="text-muted mb-0">
                                                        <i className="bi bi-clock me-2"></i> {horario.hora}
                                                    </h6>
                                                </div>
                                                <div className="card-body">
                                                    <h5 className="card-title">{horario.materia}</h5>
                                                    <p className="card-text text-muted">{horario.local}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted">Sem aulas para {diaSelecionado}</p>
                                    )
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>
            <MFooter />
        </>
    );
}
