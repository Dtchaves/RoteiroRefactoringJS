const { readFileSync } = require('fs');

// Classe de Serviço para Cálculo de Faturas
class ServicoCalculoFatura {
  
    // Método para calcular créditos
    calcularCredito(pecas, apre) {
        let creditos = 0;
        creditos += Math.max(apre.audiencia - 30, 0);
        if (getPeca(pecas, apre).tipo === "comedia") {
            creditos += Math.floor(apre.audiencia / 5);
        }
        return creditos;
    }

    // Método para calcular o total de créditos
    calcularTotalCreditos(pecas, apresentacoes) {
        return apresentacoes.reduce((total, apre) => total + this.calcularCredito(pecas, apre), 0);
    }

    // Método para calcular o total de uma apresentação
    calcularTotalApresentacao(pecas, apre) {
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

    // Método para calcular o total da fatura
    calcularTotalFatura(pecas, apresentacoes) {
        return apresentacoes.reduce((total, apre) => total + this.calcularTotalApresentacao(pecas, apre), 0);
    }
}

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

// Função para gerar a fatura em texto
function gerarFaturaStr(fatura, pecas, calc) {
    let faturaStr = `Fatura ${fatura.cliente}\n`;
    for (let apre of fatura.apresentacoes) {
        faturaStr += `  ${getPeca(pecas, apre).nome}: ${formatarMoeda(calc.calcularTotalApresentacao(pecas, apre))} (${apre.audiencia} assentos)\n`;
    }
    faturaStr += `Valor total: ${formatarMoeda(calc.calcularTotalFatura(pecas, fatura.apresentacoes))}\n`;
    faturaStr += `Créditos acumulados: ${calc.calcularTotalCreditos(pecas, fatura.apresentacoes)} \n`;
    return faturaStr;
}


// Função para gerar a fatura em HTML
function gerarFaturaHTML(fatura, pecas, calc) {
  let faturaHTML = `<html>\n<p> Fatura ${fatura.cliente} </p>\n<ul>\n`;
  for (let apre of fatura.apresentacoes) {
      faturaHTML += `  <li> ${getPeca(pecas, apre).nome}: ${formatarMoeda(calc.calcularTotalApresentacao(pecas, apre))} (${apre.audiencia} assentos) </li>\n`;
  }
  faturaHTML += `</ul>\n`;
  faturaHTML += `<p> Valor total: ${formatarMoeda(calc.calcularTotalFatura(pecas, fatura.apresentacoes))} </p>\n`;
  faturaHTML += `<p> Créditos acumulados: ${calc.calcularTotalCreditos(pecas, fatura.apresentacoes)} </p>\n`;
  faturaHTML += `</html>`;
  return faturaHTML;
}

// Dados de entrada
const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas = JSON.parse(readFileSync('./pecas.json'));

// Criando o objeto de serviço de cálculo de fatura
const calc = new ServicoCalculoFatura();

// Gerar e exibir a fatura
const faturaStr = gerarFaturaStr(faturas, pecas, calc);
console.log(faturaStr);

// Gerar a fatura em HTML
//const faturaHTML = gerarFaturaHTML(faturas, pecas, calc);
//console.log(faturaHTML);