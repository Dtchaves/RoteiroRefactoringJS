class Repositorio {
  constructor() {
    this.pecas = JSON.parse(readFileSync('./pecas.json'));
  }

  // Método para obter peça
  getPeca(apre) {
    return this.pecas[apre.id];
  }
}

// Classe de Serviço para Cálculo de Faturas
class ServicoCalculoFatura {
  constructor(repo) {
    this.repo = repo; // Repositório de peças
  }

  calcularCredito(apre) {
    let creditos = 0;
    creditos += Math.max(apre.audiencia - 30, 0);
    if (this.repo.getPeca(apre).tipo === "comedia") {
      creditos += Math.floor(apre.audiencia / 5);
    }
    return creditos;
  }

  calcularTotalCreditos(apresentacoes) {
    return apresentacoes.reduce((total, apre) => total + this.calcularCredito(apre), 0);
  }

  calcularTotalApresentacao(apre) {
    let total = 0;
    switch (this.repo.getPeca(apre).tipo) {
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
        throw new Error(`Peça desconhecida: ${this.repo.getPeca(apre).tipo}`);
    }
    return total;
  }

  calcularTotalFatura(apresentacoes) {
    return apresentacoes.reduce((total, apre) => total + this.calcularTotalApresentacao(apre), 0);
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
function gerarFaturaStr(fatura, calc) {
  let faturaStr = `Fatura ${fatura.cliente}\n`;
  for (let apre of fatura.apresentacoes) {
      faturaStr += `  ${calc.repo.getPeca(apre).nome}: ${formatarMoeda(calc.calcularTotalApresentacao(apre))} (${apre.audiencia} assentos)\n`;
  }
  faturaStr += `Valor total: ${formatarMoeda(calc.calcularTotalFatura(fatura.apresentacoes))}\n`;
  faturaStr += `Créditos acumulados: ${calc.calcularTotalCreditos(fatura.apresentacoes)} \n`;
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

const { readFileSync } = require('fs');

// Dados de entrada
const faturas = JSON.parse(readFileSync('./faturas.json'));

// Criando o objeto de serviço de cálculo de fatura com o repositório
const calc = new ServicoCalculoFatura(new Repositorio());

// Gerar e exibir a fatura
const faturaStr = gerarFaturaStr(faturas, calc);
console.log(faturaStr);