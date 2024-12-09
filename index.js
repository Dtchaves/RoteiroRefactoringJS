const { readFileSync } = require('fs');

// Função para formatar moeda
function formatarMoeda(valor) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2
    }).format(valor / 100);
}

// Função query para obter peça
function getPeca(pecas, apresentacao) {
    return pecas[apresentacao.id];
}

// Função para calcular créditos
function calcularCredito(pecas, apre) {
    let creditos = 0;
    creditos += Math.max(apre.audiencia - 30, 0);
    if (getPeca(pecas, apre).tipo === "comedia") {
        creditos += Math.floor(apre.audiencia / 5);
    }
    return creditos;
}

// Função para calcular o total de créditos
function calcularTotalCreditos(pecas, apresentacoes) {
    return apresentacoes.reduce((total, apre) => total + calcularCredito(pecas, apre), 0);
}

// Função para calcular o total de uma apresentação
function calcularTotalApresentacao(pecas, apre) {
    let total = 0;
    switch (getPeca(pecas, apre).tipo) {
        case "tragedia":
            total = 40000;
            if (apre.audiencia > 30) {
                total += 1000 * (apre.audiencia - 30);
            }
            break;
        case "comedia":
            total = 30000;
            if (apre.audiencia > 20) {
                total += 10000 + 500 * (apre.audiencia - 20);
            }
            total += 300 * apre.audiencia;
            break;
        default:
            throw new Error(`Peça desconhecida: ${getPeca(pecas, apre).tipo}`);
    }
    return total;
}

// Função para calcular o total da fatura
function calcularTotalFatura(pecas, apresentacoes) {
    return apresentacoes.reduce((total, apre) => total + calcularTotalApresentacao(pecas, apre), 0);
}

// Função para gerar a fatura em texto
function gerarFaturaStr(fatura, pecas) {
    let faturaStr = `Fatura ${fatura.cliente}\n`;
    for (let apre of fatura.apresentacoes) {
        faturaStr += `  ${getPeca(pecas, apre).nome}: ${formatarMoeda(calcularTotalApresentacao(pecas, apre))} (${apre.audiencia} assentos)\n`;
    }
    faturaStr += `Valor total: ${formatarMoeda(calcularTotalFatura(pecas, fatura.apresentacoes))}\n`;
    faturaStr += `Créditos acumulados: ${calcularTotalCreditos(pecas, fatura.apresentacoes)} \n`;
    return faturaStr;
}

// Função para gerar a fatura em HTML
function gerarFaturaHTML(fatura, pecas) {
    let faturaHTML = `<html>\n<p> Fatura ${fatura.cliente} </p>\n<ul>\n`;
    for (let apre of fatura.apresentacoes) {
        faturaHTML += `  <li> ${getPeca(pecas, apre).nome}: ${formatarMoeda(calcularTotalApresentacao(pecas, apre))} (${apre.audiencia} assentos) </li>\n`;
    }
    faturaHTML += `</ul>\n`;
    faturaHTML += `<p> Valor total: ${formatarMoeda(calcularTotalFatura(pecas, fatura.apresentacoes))} </p>\n`;
    faturaHTML += `<p> Créditos acumulados: ${calcularTotalCreditos(pecas, fatura.apresentacoes)} </p>\n`;
    faturaHTML += `</html>`;
    return faturaHTML;
}

// Dados de entrada
const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas = JSON.parse(readFileSync('./pecas.json'));

// Gerar e exibir as faturas
const faturaStr = gerarFaturaStr(faturas, pecas);
console.log(faturaStr);

const faturaHTML = gerarFaturaHTML(faturas, pecas);
console.log(faturaHTML);
