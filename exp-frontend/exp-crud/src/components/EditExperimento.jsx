import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale, setDefaultLocale } from "react-datepicker";
import ptBR from 'date-fns/locale/pt-BR';

import "../styles/EditExperimento.css";

// Registrar a localidade pt-BR
registerLocale('pt-BR', ptBR);
setDefaultLocale('pt-BR');

const EditExperimento = () => {
    const { id } = useParams();
    const [nome, setNome] = useState("");
    const [descricao, setDescricao] = useState("");
    const [dataCriacao, setDataCriacao] = useState(null);
    const [responsavel, setResponsavel] = useState("");
    const [trafego, setTrafego] = useState(100);
    const [amostras, setAmostras] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navegar = useNavigate();

    useEffect(() => {
        fetchExperimento();
    }, []);

    const fetchExperimento = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/experimentos/${id}/`);
            const data = await response.json();
            setNome(data.nome);
            setDescricao(data.descricao);
            setDataCriacao(new Date(data.data));
            setResponsavel(data.responsavel);
            setTrafego(data.trafego);
            setAmostras(data.amostras);
            setIsLoading(false);
        } catch (err) {
            console.log(err);
        }
    };

    const updateExperimento = async (e) => {
        e.preventDefault();

        const expData = {
            nome,
            descricao,
            data: dataCriacao ? dataCriacao.toISOString().split('T')[0] : "",
            responsavel,
            trafego,
            amostras: amostras.map(amostra => ({
                nome: amostra.nome,
                descricao: amostra.descricao,
                valor: parseFloat(amostra.valor)
            })),
        };

        try {
            const response = await fetch(`http://localhost:8000/api/experimentos/${id}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(expData),
            });

            const data = await response.json();
            console.log(data);
            navegar('/');
        } catch (err) {
            console.log(err);
        }
    };

    const handleCancel = () => {
        navegar('/');
    };

    const handleAddAmostra = () => {
        const newAmostras = [...amostras, { tipo: "alternativa", nome: "", descricao: "", valor: 0 }];
        const totalAlternativas = newAmostras.reduce((acc, amostra) => amostra.tipo === 'alternativa' ? acc + parseFloat(amostra.valor) : acc, 0);
        newAmostras[0].valor = 100 - totalAlternativas;
        setAmostras(newAmostras);
    };

    const handleAmostraChange = (index, field, value) => {
        const newAmostras = [...amostras];
        newAmostras[index][field] = value;

        if (field === 'valor' && newAmostras[index].tipo === 'alternativa') {
            const totalAlternativas = newAmostras.reduce((acc, amostra) => amostra.tipo === 'alternativa' ? acc + parseFloat(amostra.valor) : acc, 0);
            newAmostras[0].valor = 100 - totalAlternativas;
        }

        setAmostras(newAmostras);
    };

    const handleRemoveAmostra = (index) => {
        const newAmostras = amostras.filter((_, i) => i !== index);
        const totalAlternativas = newAmostras.reduce((acc, amostra) => amostra.tipo === 'alternativa' ? acc + parseFloat(amostra.valor) : acc, 0);
        newAmostras[0].valor = 100 - totalAlternativas;
        setAmostras(newAmostras);
    };

    if (isLoading) {
        return <div>Carregando...</div>;
    }

    return (
        <div className="container-fluid">
            <div className="header">
                <h2>Editar Experimento</h2>
                <button className="back-button" onClick={handleCancel}>Cancelar</button>
            </div>
            <form onSubmit={updateExperimento}>
                <div className="form-group left-text">
                    <label>Nome do Experimento: </label>
                    <input 
                        type="text" 
                        value={nome}
                        onChange={(e) => setNome(e.target.value)} 
                    />
                </div>
                <div className="form-group left-text">
                    <label>Descrição: </label>
                    <textarea 
                        placeholder="Descreva sobre o seu experimento." 
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                    ></textarea>
                </div>
                <div className="form-group form-group-inline">
                    <label>Data de Criação: </label>
                    <DatePicker
                        selected={dataCriacao}
                        onChange={(date) => setDataCriacao(date)}
                        dateFormat="dd/MM/yyyy"
                        locale="pt-BR"
                        placeholderText="Dia/Mês/Ano"
                    />
                </div>
                <div className="form-group form-group-inline">
                    <label>Responsável: </label>
                    <input 
                        type="text"
                        placeholder="Nome Completo"
                        value={responsavel}
                        onChange={(e) => setResponsavel(e.target.value)} 
                    />
                </div>
                <div className="form-group form-group-inline">
                    <label>Tráfego: </label>
                    <input 
                        type="number"
                        value={trafego}
                        onChange={(e) => setTrafego(parseInt(e.target.value))} 
                    />
                    <p>%</p>
                </div>
                <div className="form-group">
                    <label>Amostras </label>
                    <div className="amostras-container">
                        {amostras.map((amostra, index) => (
                        <div key={index} className="amostra-group">
                            <label>{index === 0 ? "Controle" : `Alternativa ${index}`}: </label>
                            <input 
                                type="text"
                                placeholder="Nome da Amostra"
                                value={amostra.nome}
                                onChange={(e) => handleAmostraChange(index, 'nome', e.target.value)} 
                            />
                            <input 
                                type="text"
                                placeholder="Descrição"
                                value={amostra.descricao}
                                onChange={(e) => handleAmostraChange(index, 'descricao', e.target.value)} 
                            />
                            <input 
                                type="number"
                                step="0.01"
                                value={amostra.valor}
                                onChange={(e) => handleAmostraChange(index, 'valor', parseFloat(e.target.value))} 
                            />
                            {index !== 0 && (
                                <button type="button" className="remove-button" onClick={() => handleRemoveAmostra(index)}>
                                    <FaTimes />
                                </button>
                            )}
                        </div>
                        ))}
                        <button type="button" className="add-button" onClick={handleAddAmostra}>Adicionar Amostra</button>
                    </div>
                </div>
                <button type="submit" className="submit-button">Atualizar</button>
            </form>
        </div>
    );
};

export default EditExperimento;