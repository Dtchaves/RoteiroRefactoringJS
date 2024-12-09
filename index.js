const { readFileSync } = require('fs');

function gerarFaturaStr(fatura, pecas) {
    // Função para formatar moeda
    function formatarMoeda(valor) {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 2
        }).format(valor / 100);
    }

    // Função para calcular créditos
    function calcularCredito(apre) {
        let creditos = 0;
        creditos += Math.max(apre.audiencia - 30, 0);
        if (getPeca(apre).tipo === "comedia") {
            creditos += Math.floor(apre.audiencia / 5);
        }
        return creditos;
    }

    // Função query para obter peça
    function getPeca(apresentacao) {
        return pecas[apresentacao.id];
    }

    // Função para calcular o total de uma apresentação
    function calcularTotalApresentacao(apre) {
        let total = 0;
        switch (getPeca(apre).tipo) {
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
                throw new Error(`Peça desconhecida: ${getPeca(apre).tipo}`);
        }
        return total;
    }

    // Função para calcular o total da fatura
    function calcularTotalFatura() {
        return fatura.apresentacoes.reduce((total, apre) => total + calcularTotalApresentacao(apre), 0);
    }

    // Função para calcular o total de créditos
    function calcularTotalCreditos() {
        return fatura.apresentacoes.reduce((total, apre) => total + calcularCredito(apre), 0);
    }

    // Corpo principal
    let faturaStr = `Fatura ${fatura.cliente}\n`;
    for (let apre of fatura.apresentacoes) {
        faturaStr += `  ${getPeca(apre).nome}: ${formatarMoeda(calcularTotalApresentacao(apre))} (${apre.audiencia} assentos)\n`;
    }
    faturaStr += `Valor total: ${formatarMoeda(calcularTotalFatura())}\n`;
    faturaStr += `Créditos acumulados: ${calcularTotalCreditos()} \n`;
    return faturaStr;
}

// Dados de entrada
const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas = JSON.parse(readFileSync('./pecas.json'));

// Gerar e exibir a fatura
const faturaStr = gerarFaturaStr(faturas, pecas);
console.log(faturaStr);
