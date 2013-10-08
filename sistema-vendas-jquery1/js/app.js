

/* variaveis globais */
var rootUrl = "http://restful.dev/sistema-vendas-server/";
var clientUrl = "http://localhost/sistema-vendas-jquery/index.php";


/* métodos globais */
function getErrorMessage(jsonError) {
    return (JSON.parse(jsonError)).error.text;
}

function goPage(page) {
    location.href = clientUrl + "?go=" + page;
}

function verifyLogin() {
    $.cookie.json = true;
    if ($.cookie('usuario') == undefined)
        goPage("login");
}

function preparaData(data) {
    data.datepicker();
    data.datepicker("option", "dateFormat", "dd/mm/yy");
    data.keypress(function(event) {
        event.preventDefault();
    });
}

function getDescTipo($tipo)
{
    /*
     * Não é interessante criar switch dessa forma, pois quando formos
     * criar um novo tipo, teremos que vir até este código e adicionar
     * mais um item. A solução para este problema é criar classes abstratas,
     * mas como nosso objetivo é abordar o RESTful, não iremos fazer isso em 
     * um primeiro momento.
     */
    switch ($tipo) {
        case "a":
            return "Admin";
            break;
        case "v":
            return "Vendedor";
            break;
        case "c":
            return "Cliente";
            break;

    }

}



//retirado de: http://codigosprontos.blogspot.com.br/2010/06/o-codigo-function-moedavalor-casas.html
function moeda(valor) {
    casas = 2;
    separdor_decimal = ",";
    separador_milhar = ".";

    var valor_total = parseInt(valor * (Math.pow(10, casas)));
    var inteiros = parseInt(parseInt(valor * (Math.pow(10, casas))) / parseFloat(Math.pow(10, casas)));
    var centavos = parseInt(parseInt(valor * (Math.pow(10, casas))) % parseFloat(Math.pow(10, casas)));


    if (centavos % 10 == 0 && centavos + "".length < 2) {
        centavos = centavos + "0";
    } else if (centavos < 10) {
        centavos = "0" + centavos;
    }

    var milhares = parseInt(inteiros / 1000);
    inteiros = inteiros % 1000;

    var retorno = "";

    if (milhares > 0) {
        retorno = milhares + "" + separador_milhar + "" + retorno
        if (inteiros == 0) {
            inteiros = "000";
        } else if (inteiros < 10) {
            inteiros = "00" + inteiros;
        } else if (inteiros < 100) {
            inteiros = "0" + inteiros;
        }
    }
    retorno += inteiros + "" + separdor_decimal + "" + centavos;


    return retorno;

}


$(document).ready(function() {

    $("#linkSair").click(function() {

        $.ajax({
            type: "get",
            url: rootUrl + "usuario/logout",
            success: function() {
                $.removeCookie('usuario');
                goPage("login");
            }
        });

    });

    $(".moeda").maskMoney({thousands: '.', decimal: ','});

    /*
     Previne que um enter poste o formulário
     Em ambientes jquery e ajax, enter 
     submetendo formulários não são bem vindos
     */
    $(window).keydown(function(event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
});



