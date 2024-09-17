import React, { useState, useEffect } from 'react';
import axios from '../../../configs/axios';
import MHeader from '../../../components/mheader';
import MFooter from '../../../components/mfooter';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Home() {
    const [aulas, setAulas] = useState([]);
    const [diaSelecionado, setDiaSelecionado] = useState('');
    const [carregando, setCarregando] = useState(true);

    const diasSemana = [
        { key: 'Terça-feira', label: 'Terça-feira' },
        { key: 'Quinta-feira', label: 'Quinta-feira' }
    ];

    const aluno = JSON.parse(sessionStorage.getItem('aluno')); // Pegando matrícula do aluno

    // Função para buscar as eletivas do aluno
    const buscarEletivas = async () => {
        setCarregando(true);

        try {
            const response = await axios.post('/m/eletivas/minhas-eletivas', {
                matricula: aluno.matricula,
                instituicao: aluno.instituicao
            });

            const eletivas = response.data.eletivas || [];
            setAulas(eletivas); // Armazena todas as eletivas
        } catch (error) {
            console.error('Erro ao buscar eletivas:', error);
        } finally {
            setCarregando(false);
        }
    };

    // useEffect para carregar as eletivas e selecionar o dia
    useEffect(() => {
        buscarEletivas();

        const hoje = new Date().getDay(); // 0 (Domingo), 1 (Segunda), ..., 6 (Sábado)
        if (hoje === 2) {
            setDiaSelecionado('Terça-feira'); // Terça-feira
        } else if (hoje === 4) {
            setDiaSelecionado('Quinta-feira'); // Quinta-feira
        } else {
            setDiaSelecionado('SemAula'); // Se não for terça ou quinta
        }
    }, []);

    // Função para definir a prioridade dos horários
    const obterPrioridadeHorario = (horario) => {
        if (horario.includes('1º e 2º')) return 1;
        if (horario.includes('3º e 4º')) return 2;
        if (horario.includes('5º e 6º')) return 3;
        return 4; // Outros horários ficam no final
    };

    // Filtra e ordena as eletivas para o dia selecionado ou para aquelas que ocorrem em ambos os dias
    const eletivasFiltradas = aulas
        .filter((aula) => aula.dia === diaSelecionado || aula.dia === 'Terça-feira e Quinta-feira')
        .sort((a, b) => obterPrioridadeHorario(a.horario) - obterPrioridadeHorario(b.horario));

    return (
        <>
            <MHeader />
            <main className="container my-4">
                {carregando ? (
                    <div className="d-flex justify-content-center align-items-center mb-4">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Carregando...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="d-flex justify-content-between align-items-center mb-2">
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
                                        <button key={index} className={`btn btn-outline-secondary w-100 ${diaSelecionado === dia.key ? 'active' : ''}`} onClick={() => setDiaSelecionado(dia.key)} >
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
                                    eletivasFiltradas.length > 0 ? (
                                        eletivasFiltradas.map((aula, index) => (
                                            <div key={index} className="card mb-2 border-light shadow-sm">
                                                <div className="card-header border-0">
                                                    <i className="bi bi-clock"></i>&ensp;{aula.horario}
                                                </div>
                                                <div className="card-body">
                                                    <h6 className="card-title">{aula.nome}</h6>
                                                    <div className='d-flex justify-content-between'>
                                                        <div>
                                                            <i className="bi bi-person"></i>&ensp;Professor: <br />
                                                            <b>{aula.professor}</b>
                                                        </div>
                                                        <div>
                                                            <i className="bi bi-geo-alt"></i>&ensp;Sala: <br />
                                                            <b>{aula.sala}</b>
                                                        </div>
                                                    </div>
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
