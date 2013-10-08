

$(document).ready(function() {

    verifyLogin();

    $.cookie.json = true;
    usuario = $.cookie('usuario');

    $("#nomeVendedor").html(usuario.nome);
    $("#hiddenIdVendedor").val(usuario.idVendedor);

    preparaData($("#inputData"));

});



//cliente
$("#btnModalBuscarCliente").click(function() {
    $("#clienteModal").modal("show");

    if ($("#inputNomeCliente").val().length > 0)
    {
        $("#inputBuscarCliente").val($("#inputNomeCliente").val());
    }
});

$("#inputBuscarCliente").keydown(function(event) {
    if (event.keyCode == 13) {
        buscarCliente();
    }
});

$("#btnBuscarCliente").click(function() {
    buscarCliente();
});

function buscarCliente()
{
    $("#itemResultadoBusca").html("");
    $("#errorLoadCliente").hide();
    $("#buscaClienteload").show();


    $.ajax({
        type: "post",
        dataType: "json",
        url: rootUrl + "cliente/search",
        data: JSON.stringify({busca: $("#inputBuscarCliente").val()}),
        success: function(data) {
            $("#buscaClienteload").hide();

            data.result.forEach(function(cliente) {
                $("#itemResultadoBusca").append("<li><a class='itemClienteResult' href='#' data-nome='" + cliente.nome + "' data-id=" + cliente.id + " data-cpf='" + cliente.cpf + "'>" + cliente.nome + " - " + cliente.cpf + "</a></li>");
            });

        },
        error: function(result) {
            $("#buscaClienteload").hide();
            $("#errorLoadCliente").html(getErrorMessage(result.responseText));
            $("#errorLoadCliente").show();
        }
    });

}

$(".itemClienteResult").live("click", function() {
    $("#hiddenIdCliente").val($(this).attr("data-id"));
    $("#inputNomeCliente").val($(this).attr("data-nome"));
    $("#inputCpfCliente").val($(this).attr("data-cpf"));

    $("#inputNomeCliente").attr('disabled', 'disabled');
    $("#inputCpfCliente").attr('disabled', 'disabled');
    $("#btnNovoCliente").addClass("disabled").removeClass("btn-primary");

    $("#okCliente").show();

    $("#clienteModal").modal("hide");

    verificaFinalizarVenda();
});

$("#btnNovoCliente").click(function() {

    if ($("#inputNomeCliente").val().length > 0)
    {
        $("#errorNewCliente").hide();
        $("#newClienteload").show();

        $.ajax({
            type: "post",
            dataType: "json",
            url: rootUrl + "cliente/newFromVendas",
            data: JSON.stringify({nome: $("#inputNomeCliente").val(), cpf: $("#inputCpfCliente").val()}),
            success: function(data) {
                $("#newClienteload").hide();
                cliente = data.result;
                $("#hiddenIdCliente").val(cliente.id);
                $("#inputNomeCliente").attr('disabled', 'disabled');
                $("#inputCpfCliente").attr('disabled', 'disabled');
                $("#btnNovoCliente").addClass("disabled").removeClass("btn-primary");
                $("#okCliente").show();
                verificaFinalizarVenda();

            },
            error: function(result) {
                $("#newClienteload").hide();
                $("#errorNewCliente").html(getErrorMessage(result.responseText));
                $("#errorNewCliente").show();
            }
        });
    }
    else
    {
        $("#errorNewCliente").show();
        $("#errorNewCliente").html("Preencher nome e cpf");
    }
});

//produto
$("#btnModalBuscarProduto").click(function() {

    $(".itemProduto").parent().removeClass("alert-danger").addClass("alert-success");
    $("#errorProduto").hide();

    $("#produtoModal").modal("show");

    if ($("#inputNomeProduto").val().length > 0)
    {
        $("#inputBuscarProduto").val($("#inputNomeProduto").val());
    }
});



$("#inputBuscarProduto").keydown(function(event) {
    if (event.keyCode == 13) {
        buscarProduto();
    }
});


$("#btnBuscarProduto").click(function() {
    buscarProduto();
});


function buscarProduto()
{
    $("#itemResultadoBuscaProduto").html("");
    $("#errorLoadProduto").hide();
    $("#buscaProdutoload").show();


    $.ajax({
        type: "post",
        dataType: "json",
        url: rootUrl + "produto/search",
        data: JSON.stringify({busca: $("#inputBuscarProduto").val()}),
        success: function(data) {
            $("#buscaProdutoload").hide();

            data.result.forEach(function(produto) {
                $("#itemResultadoBuscaProduto").append("<li><a class='itemProdutoResult' href='#' data-preco='" + produto.precoUnitario + "' data-nome='" + produto.nome + "' data-id=" + produto.id + " data-cpf='" + produto.codigo + "'>" + produto.nome + " - " + produto.codigo + " - R$" + moeda(produto.precoUnitario) + "</a></li>");
            });

        },
        error: function(result) {
            $("#buscaProdutoload").hide();
            $("#errorLoadProduto").html(getErrorMessage(result.responseText));
            $("#errorLoadProduto").show();
        }
    });

}



$(".itemProdutoResult").live("click", function() {
    $("#hiddenIdProduto").val($(this).attr("data-id"));
    $("#hiddenPrecoProduto").val($(this).attr("data-preco"));
    $("#inputNomeProduto").val($(this).attr("data-nome"));
    $("#inputCodigoProduto").val($(this).attr("data-codigo"));

    $("#spanPrecoProduto").html("R$ " + moeda($(this).attr("data-preco")));

    $("#inputNomeProduto").attr('disabled', 'disabled');
    $("#inputCodigoProduto").attr('disabled', 'disabled');

    $("#okProduto").show();

    $("#errorProduto").hide();

    $("#produtoModal").modal("hide");

    verificaFinalizarVenda();
});

$("#inputData").change(function() {
    $("#okData").show();
    verificaFinalizarVenda();
});

$("#btnAdcionarProduto").click(function() {

    $("#errorProduto").hide();

    if ($("#hiddenIdProduto").val() != 0)
    {

        $valido = true;
        //verifica se o item já nao esta cadastrado
        $(".itemProduto").map(function() {
            if ($(this).attr("data-id") == $("#hiddenIdProduto").val())
            {
                $valido = false;
                $("#errorProduto").show();
                $("#errorProduto").html("Este produto já consta na lista de produtos comprados");
                $(this).parent().removeClass("alert-success").addClass(".alert-danger");

            }
        });

        if ($valido)
        {


            $(".itensProduto").append('<div class="alert alert-success"><a class="close">×</a><span class="itemProduto" data-id=' + $("#hiddenIdProduto").val() + ' data-quantidade=' + $("#inputQuantidadeProduto").val() + ' data-preco="' + $("#hiddenPrecoProduto").val() + '"></span><strong>' + $("#inputNomeProduto").val() + '</strong><span class="pull-right">' + $("#inputQuantidadeProduto").val() + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;R$ ' + moeda($("#hiddenPrecoProduto").val()) + '</span>');
            $("#hiddenIdProduto").val(0);
            $("#hiddenPrecoProduto").val(0);
            $("#inputNomeProduto").val("");
            $("#inputCodigoProduto").val("");
            $("#inputQuantidadeProduto").val(1);
            $("#inputNomeProduto").removeAttr('disabled');
            $("#inputCodigoProduto").removeAttr('disabled');
            $("#spanPrecoProduto").html("");

            $("#okProduto").hide();

            calculaTotal();

        }

    }
    else
    {
        $("#errorProduto").html("Selecione um item da busca de itens de produtos");
        $("#errorProduto").show();
    }

});

$(".close").live("click", function() {
    $(this).parent().remove();
    calculaTotal();
});

function calculaTotal() {

    total = 0;

    $(".itemProduto").map(function() {
        total += $(this).attr("data-preco") * $(this).attr("data-quantidade");
    });

    $(".totalValue").html(moeda(total));
    $("#hiddenTotal").val(total);

    verificaFinalizarVenda();
}

function verificaFinalizarVenda() {
    //Verificamos se o botão finalizar venda pode ser acionado
    if ($("#hiddenTotal").val() > 0 && $("#hiddenIdCliente").val() > 0 && $("#hiddenIdVendedor").val() > 0 && $("#inputData").val().length > 0)
    {
        $("#btnFinalizarVenda").removeAttr("disabled");
    }
    else
    {
        $("#btnFinalizarVenda").attr("disabled", "disabled");
    }
}

$("#btnFinalizarVenda").click(function() {

    $("#errorVenda").hide();

    $("#btnFinalizarVenda").val("Aguarde...");
    $("#btnFinalizarVenda").removeClass("btn-primary").attr("disabled", "disabled");

    venda = new Object();
    venda.idCliente = $("#hiddenIdCliente").val();
    venda.idVendedor = $("#hiddenIdVendedor").val();
    venda.data = $("#inputData").val();
    venda.itens = [];

    $(".itemProduto").map(function() {

        item = new Object();
        item.idProduto = $(this).attr("data-id");
        item.quantidade = $(this).attr("data-quantidade");
        item.preco = $(this).attr("data-preco");

        venda.itens.push(item);

    });

    $.ajax({
        type: "post",
        dataType: "json",
        url: rootUrl + "venda/finalizar",
        data: JSON.stringify(venda),
        success: function(data) {
            $("#btnFinalizarVenda").addClass("btn-primary").val("Finalizar Venda");
            reiniciaVenda();
        },
        error: function(result) {

            $("#errorVenda").html(getErrorMessage(result.responseText));
            $("#errorVenda").show();
        }
    });

});

function reiniciaVenda() {

    //cliente
    $("#hiddenIdCliente").val(0);
    $("#inputNomeCliente").val("");
    $("#inputCpfCliente").val("");
    $("#inputNomeCliente").removeAttr('disabled');
    $("#inputCpfCliente").removeAttr('disabled');
    $("#btnNovoCliente").removeClass("disabled").addClass("btn-primary");
    $("#okCliente").hide();

    //data
    $("#okData").hide();
    $("#inputData").val("");

    //Produto
    $("#hiddenIdProduto").val(0);
    $("#hiddenPrecoProduto").val(0);
    $("#inputNomeProduto").val("");
    $("#inputCodigoProduto").val("");
    $("#inputQuantidadeProduto").val(1);
    $("#inputNomeProduto").removeAttr('disabled');
    $("#inputCodigoProduto").removeAttr('disabled');
    $("#spanPrecoProduto").html("");
    $("#errorProduto").hide();


    //itensProduto
    $(".itensProduto").html("");

    //venda
    $("#errorVenda").hide();

    calculaTotal();
}

$("#btnNovaVenda").click(function() {
    if (confirm("Iniciar uma nova venda?"))
        reiniciaVenda();
});
