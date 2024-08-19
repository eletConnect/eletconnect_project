import React, { useEffect, useState } from 'react';
import axios from '../../../configs/axios';
import MHeader from '../../../components/mheader';
import MFooter from '../../../components/mfooter';
import showToast from '../../../utills/toasts';
import "../../../assets/styles/mMain.css";

export default function MHome() {
    const [eletivas, setEletivas] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);
    const [abaSelecionada, setAbaSelecionada] = useState('Eletiva');

    const aluno = JSON.parse(sessionStorage.getItem('aluno')) || {};

    useEffect(() => {
        const listarEletivas = async () => {
            try {
                const { data, status } = await axios.post('/m/eletivas/listar', { instituicao: aluno.instituicao });
                if (status === 200) {
                    const eletivasFormatadas = data.eletivas.map(eletiva => ({
                        id: eletiva.id,
                        codigo: eletiva.codigo,
                        nome: eletiva.nome,
                        descricao: eletiva.descricao,
                        dia: eletiva.dia,
                        horario: eletiva.horario,
                        sala: eletiva.sala,
                        tipo: eletiva.tipo,
                        total_alunos: eletiva.total_alunos,
                        alunos_cadastrados: eletiva.alunos_cadastrados,
                        professor: Array.isArray(eletiva.professor) ? eletiva.professor.join(', ') : eletiva.professor || 'N/A'
                    }));
                    setEletivas(eletivasFormatadas);
                }
            } catch (error) {
                setErro('Erro ao listar eletivas!');
            } finally {
                setCarregando(false);
            }
        };

        if (aluno.instituicao) {
            listarEletivas();
        } else {
            setErro('Informações do aluno não disponíveis.');
            setCarregando(false);
        }
    }, [aluno.instituicao]);

    const ParticiparEletiva = async (codigo) => {
        try {
            const response = await axios.post('/m/eletivas/participar', { codigo, matricula: aluno.matricula, instituicao: aluno.instituicao });
            if (response.status === 200) {
                console.log('Participação realizada com sucesso!');
                showToast('success', 'Participação realizada com sucesso!');
            }
        } catch (error) {
            console.error('Erro ao participar da eletiva', error);
            showToast('danger', error.response ? error.response.data.error : 'Erro ao participar da eletiva!');
        }
    };

    const exibirAbaTrilha = aluno.serie?.charAt(0) !== '1';
    const eletivasFiltradas = eletivas.filter(eletiva => eletiva.tipo === abaSelecionada);

    const tabs = [
        { nome: 'Eletiva' },
        { nome: 'Projeto de Vida' },
        ...(exibirAbaTrilha ? [{ nome: 'Trilha' }] : [])
    ];

    return (
        <>
            <MHeader />
            <main id="mMain" className="d-flex flex-column align-items-center py-4">
                {carregando ? (
                    <p>Carregando...</p>
                ) : erro ? (
                    <p id='errorr'>{erro}</p>
                ) : (
                    <>
                        <div id='toast-container' className="toast-container position-absolute bottom-0 start-50 translate-middle-x mb-2"></div>
                        <ul className="nav nav-tabs justify-content-center mb-4 w-100">
                            {tabs.map(tab => (
                                <li className="nav-item" key={tab.nome}>
                                    <a className={`nav-link text-black ${abaSelecionada === tab.nome ? 'active' : ''}`} href="#" onClick={() => setAbaSelecionada(tab.nome)}> {tab.nome} </a>
                                </li>
                            ))}
                        </ul>
                        <div className="accordion accordion-flush border" style={{ width: '95%' }} id="accordionFlushExample">
                            {eletivasFiltradas.length > 0 ? (
                                eletivasFiltradas.map(eletiva => (
                                    <div className="accordion-item" key={eletiva.id}>
                                        <h2 className="accordion-header">
                                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#flush-collapse${eletiva.id}`} aria-expanded="false" aria-controls={`flush-collapse${eletiva.id}`} >
                                                <div className='d-flex flex-column w-100'>
                                                    <span className='d-flex flex-column mb-3'>
                                                        <h4 className='m-0'>{eletiva.nome}</h4>
                                                        <p className='m-0'>{eletiva.alunos_cadastrados}/{eletiva.total_alunos} alunos</p>
                                                    </span>
                                                    <ul>
                                                        <li><b>Professor</b>: {eletiva.professor}</li>
                                                        <li><b>Sala</b>: {eletiva.sala}</li>
                                                        <li><b>Horário</b>: {eletiva.dia} | {eletiva.horario}</li>
                                                    </ul>
                                                </div>
                                            </button>
                                        </h2>
                                        <div id={`flush-collapse${eletiva.id}`} className="accordion-collapse collapse" data-bs-parent="#accordionFlushExample" >
                                            <div className="accordion-body">
                                                {eletiva.descricao}
                                                <div className='text-end'>
                                                    <button className='btn btn-success' onClick={() => ParticiparEletiva(eletiva.codigo)}>Participar</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>Nenhuma {abaSelecionada.toLowerCase()} encontrada.</p>
                            )}
                        </div>
                    </>
                )}
            </main>
            <MFooter />
        </>
    );
}
