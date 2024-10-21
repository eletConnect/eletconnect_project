import React, { useState } from 'react';
import axios from '../../../../configs/axios';
import showToast from '../../../../utills/toasts';

export default function ModalDesmatricularAluno({
    eletiva,
    alunoSelecionado,
    setAlunoSelecionado,
    alunosMatriculados,
    setAlunosMatriculados
}) {
    const [enviando, setEnviando] = useState(false); // Estado para controlar o loading

    const desmatricularAluno = async () => {
        if (!eletiva || !alunoSelecionado.matricula) return;

        setEnviando(true); // Ativa o estado de envio

        try {
            const resposta = await axios.post('/eletivas/desmatricular-aluno', {
                instituicao: eletiva.instituicao,
                codigo: eletiva.codigo,
                matricula: alunoSelecionado.matricula,
                tipo: eletiva.tipo
            });

            if (resposta.status === 200) {
                sessionStorage.setItem('mensagemSucesso', `O(a) aluno(a) <b>${alunoSelecionado.nome}</b> foi removido(a) da eletiva.`);
                window.location.reload(); // Recarrega a página para refletir as alterações
            }
        } catch (error) {
            showToast('danger', error.response?.data?.mensagem || 'Erro ao desmatricular aluno.');
        } finally {
            setEnviando(false); // Desativa o estado de envio
        }
    };

    return (
        <div className="modal fade" id="desmatricularAluno" tabIndex="-1" role="dialog">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <div className="d-flex align-items-center gap-2">
                            <span className='d-flex align-items-center gap-2'>
                                <i className="bi bi-journal-bookmark-fill fs-3"></i>
                                <h4 className='m-0 fs-4'>Eletivas</h4>
                            </span>
                            <i className="bi bi-arrow-right-short fs-4"></i>
                            <h5 className="m-0">Desmatricular</h5>
                        </div>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <p>Tem certeza que deseja desmatricular o aluno <b>{alunoSelecionado?.nome}</b>?</p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={desmatricularAluno}
                            disabled={enviando} // Desabilita o botão durante o envio
                        >
                            {enviando ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Desmatriculando...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-person-dash-fill"></i>&ensp;Desmatricular
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
