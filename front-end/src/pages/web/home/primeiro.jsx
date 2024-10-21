import React, { useState } from 'react';
import axios from '../../../configs/axios';
import Header from "../../../components/header";
import showToast from "../../../utills/toasts";
import supabase from '../../../configs/supabase';

export default function Instituicao() {
    const [cnpj, setCnpj] = useState('');
    const [nome, setNome] = useState('');
    const [cep, setCEP] = useState('');
    const [endereco, setEndereco] = useState('');
    const [telefone, setTelefone] = useState('');
    const [logo, setLogo] = useState(null);
    const [codigo, setCodigo] = useState('');
    const [isLoadingCadastrar, setIsLoadingCadastrar] = useState(false);
    const [isLoadingEntrar, setIsLoadingEntrar] = useState(false);
    const user = JSON.parse(sessionStorage.getItem('user'));

    // API para verificar o CEP
    const verificarCEP = async (cep) => {
        if (!cep) return;
        try {
            const formattedCep = cep.replace(/\D/g, ''); // Remove caracteres não-numéricos
            const response = await axios.get(`https://brasilapi.com.br/api/cep/v1/${formattedCep}`, { withCredentials: false });
            if (response.status === 200) {
                setEndereco(response.data.street); // Atualiza o endereço com a resposta
            }
        } catch (error) {
            showToast('danger', 'Erro ao verificar CEP.');
        }
    };

    // API para validar CNPJ
    const validarCNPJ = async (cnpj) => {
        if (!cnpj) return;
        try {
            const formattedCnpj = cnpj.replace(/\D/g, ''); // Remove caracteres não-numéricos
            const response = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${formattedCnpj}`, { withCredentials: false });
            if (response.status === 200) {
                const cnpjData = response.data;
                setNome(cnpjData.nome_fantasia || cnpjData.razao_social); // Atualiza o nome da instituição
                setEndereco(cnpjData.logradouro); // Atualiza o endereço
                const cnpjCep = cnpjData.cep.replace(/\D/g, ''); // Remove caracteres não-numéricos do CEP
                setCEP(cnpjCep); // Atualiza o campo CEP
                await verificarCEP(cnpjCep); // Chama a verificação do CEP para atualizar o endereço automaticamente
            }
        } catch (error) {
            showToast('danger', 'Erro ao validar o CNPJ.');
        }
    };

    const armazenarLogo = async (logo) => {
        const path = `LOGOTIPO_${Date.now()}`;
        try {
            const { error } = await supabase.storage.from('logotipo').upload(path, logo);
            if (error) throw new Error(error.message);
            const { data, error: publicUrlError } = supabase.storage.from('logotipo').getPublicUrl(path);
            if (publicUrlError) throw new Error(publicUrlError.message);
            return data.publicUrl;
        } catch (error) {
            throw error;
        }
    };

    const cadastrarInstituicao = async (e) => {
        e.preventDefault();
        setIsLoadingCadastrar(true);

        try {
            const logoUrl = logo ? await armazenarLogo(logo) : '';
            const formattedCnpj = cnpj.replace(/\D/g, ''); // Remove caracteres não-numéricos
            const response = await axios.post('/instituicao/cadastrar', {
                userID: user.id,
                cnpj: formattedCnpj,
                nome,
                cep,
                endereco,
                telefone,
                logotipo: logoUrl
            }); 

            if (response.status === 200) {
                showToast('success', 'Instituição cadastrada com sucesso!');
                showToast('info', 'Você será redirecionado em 5 segundos.');
                sessionStorage.setItem('user', JSON.stringify({ ...user, cargo: 'Diretor', instituicao: formattedCnpj }));
                setTimeout(() => window.location.href = '/verification', 5000);
            } else {
                showToast('danger', 'Erro inesperado. Tente novamente mais tarde.');
            }
        } catch (error) {
            showToast('danger', error.response ? error.response.data.mensagem : 'Erro ao cadastrar instituição.');
        } finally {
            setIsLoadingCadastrar(false);
        }
    };


    const entrarInstituicao = async (e) => {
        e.preventDefault();
        setIsLoadingEntrar(true);

        try {
            const response = await axios.post('/instituicao/entrar', { id: user.id, codigo });
            if (response.status === 200) {
                showToast('success', 'Usuário vinculado à instituição com sucesso!');
                showToast('info', 'Você será redirecionado em 5 segundos.');
                sessionStorage.setItem('user', JSON.stringify({ ...user, cargo: 'Diretor', instituicao: "" }));
                setTimeout(() => window.location.href = '/verification', 5000);
            }
        } catch (error) {
            showToast('danger', error.response ? error.response.data.error : 'Erro ao vincular usuário à instituição.');
        } finally {
            setIsLoadingEntrar(false);
        }
    };

    return (
        <>
            <div id='toast-container' className="toast-container position-fixed bottom-0 end-0 p-3"></div>
            <Header />
            <main id="main-section">
                <section id='section'>
                    <div className="box">
                        {/* Título */}
                        <div className="title">
                            <span className="d-flex align-items-center gap-2 text-black">
                                <i className="bi bi-grid-1x2 fs-3"></i>
                                <h3 className="m-0 fs-4">Primeiro acesso</h3>
                            </span>
                        </div>

                        {/* Conteúdo */}
                        <div className="p-4">
                            <div className="d-flex justify-content-between align-items-center gap-3">
                                <h5 className="m-0">Cadastrar nova instituição</h5>
                                <button type="button" className="btn btn-outline-secondary" data-bs-target="#cadastrarEscola" data-bs-toggle="modal">
                                    Cadastrar instituição
                                </button>
                            </div>
                            <p className="mt-2">Para cadastrar uma nova instituição de ensino, preencha as informações nos campos abaixo.</p>
                            <hr />

                            <div className="d-flex justify-content-between align-items-center gap-3 mt-4">
                                <h5 className="m-0">Entrar em uma instituição</h5>
                                <button type="button" className="btn btn-outline-secondary" data-bs-target="#entrarEscola" data-bs-toggle="modal">
                                    Entrar com código da instituição
                                </button>
                            </div>
                            <p className="mt-2">Já tem um código de instituição? Insira o código para se associar a uma instituição existente.</p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Modal de cadastro de instituição */}
            <div className="modal fade" id="cadastrarEscola" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered modal-xl">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <i className="bi bi-grid-1x2 fs-3"></i>
                                <h4 className='m-0 fs-4'>Primeiro acesso</h4>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Cadastrar instituição</h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form onSubmit={cadastrarInstituicao}>
                            <div className="modal-body">
                                <div className="d-flex gap-4">
                                    {/* Seção da Logo */}
                                    <div className="d-flex flex-column align-items-center gap-3">
                                        <img width={250} src={logo ? URL.createObjectURL(logo) : 'https://via.placeholder.com/250'} alt="Logo da instituição" />
                                        <input type="file" className="form-control" onChange={(e) => setLogo(e.target.files[0])} />
                                    </div>

                                    <div className="vr"></div>

                                    {/* Seção do Formulário */}
                                    <div className="w-100">
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label">CNPJ</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="inputCNPJ"
                                                    placeholder="CNPJ"
                                                    maxLength="18"
                                                    value={cnpj}
                                                    onChange={(e) => setCnpj(e.target.value)}
                                                    onBlur={() => validarCNPJ(cnpj)}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Telefone</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="inputTelefone"
                                                    placeholder="Telefone"
                                                    value={telefone}
                                                    onChange={(e) => setTelefone(e.target.value)}
                                                    pattern="^\d{2}\d{4,5}\d{4}$"
                                                    title="Digite um telefone válido, no formato DDD + Número"
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-12">
                                                <label className="form-label">Nome da Instituição</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="inputNome"
                                                    placeholder="Nome"
                                                    value={nome}
                                                    onChange={(e) => setNome(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label">CEP</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="inputCEP"
                                                    placeholder="CEP"
                                                    value={cep}
                                                    onChange={(e) => setCEP(e.target.value)}
                                                    onBlur={() => verificarCEP(cep)}
                                                    pattern="^\d{8}$"
                                                    title="Digite um CEP válido com 8 dígitos"
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-8">
                                                <label className="form-label">Endereço</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="inputEndereco"
                                                    placeholder="Endereço"
                                                    value={endereco}
                                                    onChange={(e) => setEndereco(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" className="btn btn-primary" disabled={isLoadingCadastrar}>
                                    {isLoadingCadastrar ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Cadastrando...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-folder-plus"></i>&ensp;Cadastrar
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Modal de entrada em instituição */}
            <div className="modal fade" id="entrarEscola" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <i className="bi bi-grid-1x2 fs-3"></i>
                                <h4 className='m-0 fs-4'>Primeiro acesso</h4>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Entrar via codigo</h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form onSubmit={entrarInstituicao}>
                            <div className="modal-body">
                                <div className="form-floating mb-3">
                                    <input type="text" className="form-control" id="inputCodigo" placeholder="Código" value={codigo} onChange={(e) => setCodigo(e.target.value)} required />
                                    <label htmlFor="inputCodigo">Código da instituição</label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" className="btn btn-primary" disabled={isLoadingEntrar}>
                                    {isLoadingEntrar ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Entrando...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-box-arrow-in-right"></i> Entrar
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
