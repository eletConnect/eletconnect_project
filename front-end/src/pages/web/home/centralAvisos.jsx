import React, { useState, useEffect } from 'react';
import axios from '../../../configs/axios'; 
import showToast from '../../../utills/toasts';

export default function CentralAvisos() {
  const [carregando, setCarregando] = useState(true);
  const [avisos, setAvisos] = useState([]);
  const [novoAviso, setNovoAviso] = useState({ titulo: '', conteudo: '' });

  const carregarAvisos = async () => {
    try {
      setCarregando(true);
      const response = await axios.get('/avisos');
      setAvisos(response.data);
      setCarregando(false);
    } catch (error) {
      showToast('danger', 'Erro ao carregar avisos.');
      setCarregando(false);
    }
  };

  const adicionarAviso = async () => {
    if (!novoAviso.titulo || !novoAviso.conteudo) {
      showToast('warning', 'Título e conteúdo são obrigatórios.');
      return;
    }

    try {
      const response = await axios.post('/avisos', novoAviso); 
      setAvisos([...avisos, response.data]);
      setNovoAviso({ titulo: '', conteudo: '' });
      showToast('success', 'Aviso adicionado com sucesso!');
    } catch (error) {
      showToast('danger', 'Erro ao adicionar aviso.');
    }
  };

  useEffect(() => {
    carregarAvisos();
  }, []);

  return (
    <>
      <div id="toast-container" className="toast-container position-absolute bottom-0 start-50 translate-middle-x"></div>
      <div className="p-4">
        {carregando ? (
          <div className="d-flex justify-content-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
          </div>
        ) : (
          <div className="m-4">
            <h4>Quadro de Avisos</h4>
            <div className="list-group">
              {avisos.map((aviso, index) => (
                <div key={index} className="list-group-item list-group-item-action">
                  <h5 className="mb-1">{aviso.titulo}</h5>
                  <p className="mb-1">{aviso.conteudo}</p>
                  <small>{aviso.data}</small>
                </div>
              ))}
            </div>
            <button
              className="btn btn-primary mt-4"
              data-bs-toggle="modal"
              data-bs-target="#adicionarAvisoModal"
            >
              Adicionar Aviso
            </button>
          </div>
        )}
      </div>

      <div
        className="modal fade"
        id="adicionarAvisoModal"
        tabIndex="-1"
        aria-labelledby="adicionarAvisoModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="adicionarAvisoModalLabel">Adicionar Novo Aviso</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="form-group mb-3">
                <label>Título</label>
                <input
                  type="text"
                  className="form-control"
                  value={novoAviso.titulo}
                  onChange={(e) => setNovoAviso({ ...novoAviso, titulo: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Conteúdo</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={novoAviso.conteudo}
                  onChange={(e) => setNovoAviso({ ...novoAviso, conteudo: e.target.value })}
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Fechar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={adicionarAviso}
                data-bs-dismiss="modal"
              >
                Salvar Aviso
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
