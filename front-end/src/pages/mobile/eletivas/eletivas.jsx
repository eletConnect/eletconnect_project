import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MHeader from '../../../components/mheader';
import MFooter from '../../../components/mfooter';
import "../../../assets/styles/mMain.css";

export default function MHome() {
    const [eletivas, setEletivas] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);
    const [abaSelecionada, setAbaSelecionada] = useState('Eletiva');

    const aluno = JSON.parse(sessionStorage.getItem('aluno'));

    useEffect(() => {
        const listarEletivas = async () => {
            try {
                const { data, status } = await axios.post('http://localhost:3001/m/eletivas/listar', { instituicao: aluno.instituicao });
                if (status === 200) {
                    const eletivasFormatadas = data.eletivas.map(eletiva => ({
                        id: eletiva.id,
                        nome: eletiva.nome,
                        descricao: eletiva.descricao,
                        tipo: eletiva.tipo,
                        professores: eletiva.professores || []
                    }));
                    setEletivas(eletivasFormatadas);
                }
            } catch {
                setErro('Erro ao listar eletivas!');
            } finally {
                setCarregando(false);
            }
        };

        listarEletivas();
    }, [aluno.instituicao]);

    const exibirAbaTrilha = aluno.turma.charAt(0) !== '1';
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
                {carregando && <p>Carregando...</p>}
                {erro && <p>{erro}</p>}
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
                                    <button
                                        className="accordion-button collapsed"
                                        type="button"
                                        data-bs-toggle="collapse"
                                        data-bs-target={`#flush-collapse${eletiva.id}`}
                                        aria-expanded="false"
                                        aria-controls={`flush-collapse${eletiva.id}`}
                                    >
                                        <div className='d-flex flex-column w-100'>
                                            <span className='d-flex flex-column mb-3'>
                                                <h4 className='m-0'>{eletiva.nome}</h4>
                                                <p className='m-0'>0/30 alunos</p>
                                            </span>
                                            <ul>
                                                <li><b>Tipo</b>: {eletiva.tipo}</li>
                                                <li><b>Horário</b>: Terça-feira / 1º e 2º horário</li>
                                            </ul>
                                        </div>
                                    </button>
                                </h2>
                                <div
                                    id={`flush-collapse${eletiva.id}`}
                                    className="accordion-collapse collapse"
                                    data-bs-parent="#accordionFlushExample"
                                >
                                    <div className="accordion-body">
                                        {eletiva.descricao}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>Nenhuma {abaSelecionada.toLowerCase()} encontrada.</p>
                    )}
                </div>
            </main>
            <MFooter />
        </>
    );
}
