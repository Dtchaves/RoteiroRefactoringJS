const formatarMoeda = require("./util.js");


module.exports = function gerarFaturaStr(faturas, calc) {
    let faturaStr = `Fatura ${faturas.cliente}\n`;
    for (let apre of faturas.apresentacoes) {
        faturaStr += `  ${calc.repo.getPeca(apre).nome}: ${formatarMoeda(calc.calcularTotalApresentacao(apre))} (${apre.audiencia} assentos)\n`;
    }
    faturaStr += `Valor total: ${formatarMoeda(calc.calcularTotalFatura(faturas.apresentacoes))}\n`;
    faturaStr += `Créditos acumulados: ${calc.calcularTotalCreditos(faturas.apresentacoes)} \n`;
    return faturaStr;
};