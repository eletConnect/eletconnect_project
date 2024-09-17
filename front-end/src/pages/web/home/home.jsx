import Header from "../../../components/header";
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Chart } from 'primereact/chart';
import axios from '../../../configs/axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../assets/styles/my-bootstrap.css';

export default function Home() {
    const [chartData, setChartData] = useState(null); // Inicializado como null
    const [chartOptions, setChartOptions] = useState(null); // Inicializado como null
    const [totalAlunos, setTotalAlunos] = useState(0);
    const [totalEletivas, setTotalEletivas] = useState(0);
    const [isLoading, setIsLoading] = useState(true); // Estado de carregamento

    const escola = JSON.parse(sessionStorage.getItem('escola'));

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resposta = await axios.post('/home/qnt', { instituicao: escola.cnpj });
                if (resposta.status === 200) {
                    const { quantidadeAlunos, quantidadeAlunos1Ano, quantidadeAlunos2Ano, quantidadeAlunos3Ano, quantidadeEletivas, totalAlunos } = resposta.data;

                    // Atualiza as contagens de alunos e eletivas
                    setTotalAlunos(quantidadeAlunos);
                    setTotalEletivas(quantidadeEletivas);

                    // Atualiza os dados do gráfico com as quantidades dinâmicas
                    const documentStyle = getComputedStyle(document.documentElement);
                    const textColor = documentStyle.getPropertyValue('--text-color');
                    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
                    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
                    const data = {
                        labels: ['1º ano', '2º ano', '3º ano'],
                        datasets: [
                            {
                                type: 'bar',
                                label: 'Matriculados',
                                backgroundColor: documentStyle.getPropertyValue('--blue-500'),
                                data: [quantidadeAlunos1Ano, quantidadeAlunos2Ano, quantidadeAlunos3Ano, totalAlunos]
                            }
                        ]
                    };
                    const options = {
                        maintainAspectRatio: false,
                        aspectRatio: 0.8,
                        plugins: {
                            tooltips: {
                                mode: 'index',
                                intersect: false
                            },
                            legend: {
                                labels: {
                                    color: textColor
                                }
                            }
                        },
                        scales: {
                            x: {
                                stacked: true,
                                ticks: {
                                    color: textColorSecondary
                                },
                                grid: {
                                    color: surfaceBorder
                                }
                            },
                            y: {
                                stacked: true,
                                ticks: {
                                    color: textColorSecondary
                                },
                                grid: {
                                    color: surfaceBorder
                                }
                            }
                        }
                    };

                    setChartData(data);
                    setChartOptions(options);
                } else {
                    console.error('Erro ao buscar dados: Status não é 200.');
                }
            } catch (erro) {
                console.error('Erro ao buscar dados da API:', erro);
            } finally {
                setIsLoading(false); // Finaliza o carregamento
            }
        };

        fetchData();
    }, []);

    return (
        <>
            <Header />
            <section id='section'>
                <div className="box">
                    <div className="title d-flex justify-content-between align-items-center">
                        <h3 className="m-0 fs-4">CEM 03 de Taguatinga</h3>
                    </div>

                    <div className="p-4">
                        {isLoading ? (
                            <div className="d-flex justify-content-center">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Carregando...</span>
                                </div>
                            </div>
                        ) : (
                            <>

                                <div className="d-flex flex-grap gap-4 mb-2">
                                    <div className="card text-center shadow-sm border-left-primary">
                                        <div className="card-body d-flex align-items-center gap-4">
                                            <span>
                                                <h5 className="card-title text-primary">Total de alunos</h5>
                                                <p className="card-text">{totalAlunos} alunos</p>
                                            </span>
                                            <Link to={'/students'}>
                                                <i className="bi bi-person-arms-up fs-1"></i>
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="card text-center shadow-sm border-left-primary">
                                        <div className="card-body d-flex align-items-center gap-4">
                                            <span>
                                                <h5 className="card-title text-primary">Total de eletivas</h5>
                                                <p className="card-text">{totalEletivas} eletivas</p>
                                            </span>
                                            <Link to={'/electives'}>
                                                <i className="bi bi-bookmark-star-fill fs-1"></i>
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Gráficos */}
                                <div className="row ">
                                    <div className="col-md-4">
                                        <div className="card shadow-sm border-left-secondary">
                                            <div className="card-body">
                                                <p className="m-0">Alunos matriculados em eletivas por série.</p>
                                                <Chart type="bar" data={chartData} options={chartOptions} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}
