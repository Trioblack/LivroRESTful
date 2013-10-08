
$(document).ready(function() {
    preparaData($("#dataInicial"));
    preparaData($("#dataFinal"));
    atualizaGrid();
});

function atualizaGrid() {

    $("#tableVendas").find("tbody tr").remove();
    $("#tableVendas").find("tbody").append('<tr><td colspan=10><div class="alert alert-success"><img src="img/ajax-loader.gif">Carregando...</div></td></tr>');

    $.ajax({
        type: "get",
        url: rootUrl + "venda/listAll",
        dataType: "json",
        success: function(data) {
            $("#tableVendas").find("tbody tr").remove();
            data.result.forEach(function(venda) {

                row = "<tr>"
                        + "<td><a id='edit' data-id='" + venda.id + "' href='#'><i class='icon-info-sign'></i></a></td>"
                        + "</td><td>" + venda.dataVenda + "</td>"
                        + "</td><td>" + venda.nomeVendedor + "</td>"
                        + "</td><td>" + venda.nomeCliente + "</td>"
                        + "</tr>";
                $("#tableVendas > tbody:last").append(row);
            });

        },
        error: function(result) {
            $("#tableVendas").find("tbody tr").remove();
            $("#errorVenda").html(getErrorMessage(result.responseText));
            $("#errorVenda").show();
        }
    });


}

$("#edit").live("click", function() {

    $("#errorVenda").hide();

    row = $(this);
    idVenda = row.attr("data-id");
    row.html('<img src="img/ajax-loader.gif">');
    
     $("#detalhes").hide();
    $("#detalhes_venda").html("");
    $("#itens").html("");
    

    $.ajax({
        type: "get",
        dataType: "json",
        url: rootUrl + "venda/list/" + idVenda,
        success: function(data) {
            venda = data.result;
            $("#detalhes").show();
            
           $("#detalhes_venda").append("<dt>Id da venda:</dt><dd>" + venda.id + "</dd>");
           $("#detalhes_venda").append("<dt>Data:</dt><dd>" + venda.dataVenda + "</dd>");
           $("#detalhes_venda").append("<dt>Vendedor:</dt><dd>" + venda.nomeVendedor + "</dd>");
           $("#detalhes_venda").append("<dt>Cliente:</dt><dd>" + venda.nomeCliente + "</dd>");
           
           total = 0;
           venda.itens.forEach(function(item){
               total += item.quantidade*item.precoUnitario;
            $("#itens").append('<div class="alert alert-gray">' + item.nome + '</strong><span class="pull-right">' + item.quantidade + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;R$ ' + moeda(item.precoUnitario) + '</span>');
           });
           
           $("#itens").append('<span class="alert alert-gray pull-right">Total: R$ '+moeda(total)+'</span>');
           
           
           
            
        },
        error: function(result) {
            $("#errorVenda").html(getErrorMessage(result.responseText));
            $("#errorVenda").show();
        },
        complete: function() {
            row.html("<i class='icon-info-sign'>");
        }
    });

});


