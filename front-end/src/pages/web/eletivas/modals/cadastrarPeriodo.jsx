import React, { useState } from 'react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import axios from '../../../../configs/axios';
import showToast from '../../../../utills/toasts';

export default function ModalCadastrarPeriodo({ instituicao }) {
    const [periodoSelecionado, setPeriodoSelecionado] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection',
        },
    ]);
    const [enviando, setEnviando] = useState(false); // Estado para o botão de envio

    const salvarPeriodo = async (e) => {
        e.preventDefault();
        setEnviando(true); // Define o estado de carregamento

        try {
            const dataInicioEscolhida = periodoSelecionado[0].startDate;
            const dataFimEscolhida = periodoSelecionado[0].endDate;

            // Definir o início do dia (00:00) para data de início
            const dataInicioBrasilia = new Date(dataInicioEscolhida);
            dataInicioBrasilia.setUTCHours(0, 0, 0, 0);

            // Definir o fim do dia (23:59) para data de fim
            const dataFimBrasilia = new Date(dataFimEscolhida);
            dataFimBrasilia.setUTCHours(23, 59, 59, 999);

            const response = await axios.post('/eletivas/definir-periodo', {
                instituicao,
                dataInicio: dataInicioBrasilia.toISOString(),
                dataFim: dataFimBrasilia.toISOString(),
            });

            if (response.status === 200) {
                sessionStorage.setItem('mensagemSucesso', response.data.mensagem); // Armazenar a mensagem de sucesso
                window.location.reload(); // Recarregar a página para refletir a mudança
            }
        } catch (error) {
            showToast('danger', error.response?.data.mensagem || 'Erro ao definir o período de inscrições.');
        } finally {
            setEnviando(false); // Libera o botão de envio
        }
    };

    return (
        <div className="modal fade" id="definirPeriodo" tabIndex="-1" aria-labelledby="definirPeriodoLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-journal-bookmark-fill fs-3"></i>
                            <h4 className='m-0 fs-4'>Eletivas</h4>
                            <i className="bi bi-arrow-right-short fs-4"></i>
                            <h5 className="m-0">Definir período</h5>
                        </div>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <form onSubmit={salvarPeriodo}>
                        <div className="text-center m-2">
                            <p className='mx-4'>
                                O período de inscrições vai de <strong>{periodoSelecionado[0].startDate.toLocaleDateString('pt-BR', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                })}</strong> até <strong>{periodoSelecionado[0].endDate.toLocaleDateString('pt-BR', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                })}</strong>, totalizando <strong>
                                    {
                                        Math.ceil(
                                            (periodoSelecionado[0].endDate.getTime() - periodoSelecionado[0].startDate.getTime()) / (1000 * 3600 * 24)
                                        )
                                    }</strong> dias.
                            </p>
                            <DateRange
                                editableDateInputs={true}
                                onChange={(item) => setPeriodoSelecionado([item.selection])}
                                moveRangeOnFirstSelection={false}
                                ranges={periodoSelecionado}
                            />
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="submit" className="btn btn-primary" disabled={enviando} >
                                {enviando ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Definindo...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-calendar-check"></i>&ensp;Definir
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
