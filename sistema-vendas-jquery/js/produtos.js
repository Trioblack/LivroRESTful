
$(document).ready(function() {
    verifyLogin();
    atualizaGrid();
    loadCategorias();
    loadFornecedores();
});

$('#btnNovo').click(function() {

    if ($("#inputId").val() != "") {
        $("form")[0].reset();
        $("#inputId").val("");
        $("#errorServer").hide();
        $("input[name=checkAtivo]").attr("checked", true);
    }

    $('#novoModal').modal('show');
});

$('#btnBuscar').click(function() {
    atualizaGrid();
});

function atualizaGrid()
{

    $("#tableProdutos").find("tbody tr").remove();
    $("#tableProdutos").find("tbody").append('<tr><td colspan=10><div class="alert alert-success"><img src="img/ajax-loader.gif">Carregando...</div></td></tr>');

    filtro = "";
    if ($("#filtrar").val())
        filtro = "/" + $("#filtrar").val();

    $.ajax({
        type: "get",
        url: rootUrl + "produto/listAll" + filtro,
        dataType: "json",
        success: function(data) {
            $("#tableProdutos").find("tbody tr").remove();
            data.result.forEach(function(produto) {

                row = "<tr>"
                        + "<td>" + produto.codigo + "</td>"
                        + "<td><a id='edit' href='#' data-id='" + produto.id + "'>" + produto.nome + "</a>"
                        + "</td><td>" + produto.nomeCategoria
                        + "</td><td> <a href='#'><i class='icon-remove' data-id='" + produto.id + "' data-nome='" + produto.nome + "'/></i></a>"
                        + "</td></tr>";
                $("#tableProdutos > tbody:last").append(row);
            });
        },
        error: function(result)
        {
            $("#errorLoad").html(getErrorMessage(result.responseText));
            $("#errorLoad").show();
            $("#tableProdutos").find("tbody tr").remove();
        }
    });
}

$('#salvar').click(function() {

    var valido = true;
    //remove o erro destacado em todos os inputs
    $("#form input").map(function() {
        $(this).parents("div").removeClass("error");
    });
    if ($('#inputNome').val().length == 0)
    {
        valido = false;
        $('#inputNome').parents("div").addClass("error");
    }
    if ($('#inputCodigo').val().length == 0)
    {
        valido = false;
        $('#inputCodigo').parents("div").addClass("error");
    }

    if (valido)
    {
        travarFormulario();

        produto = JSON.stringify({
            idProduto: $("#inputId").val(),
            nome: $("#inputNome").val(),
            quantidade: $("#inputQuantidade").val(),
            quantidadeMinima: $("#inputQuantidadeMinima").val(),
            precoUnitario: $("#inputPrecoUnitario").val(),
            descricao: $("#inputDescricao").val(),
            ativo: $('input[name=checkAtivo]').is(':checked'),
            idCategoria: $("#selectCategoria").val(),
            idFornecedor: $("#selectFornecedor").val(),
            codigo: $("#inputCodigo").val()
        });

        $.ajax({
            type: "post",
            url: rootUrl + "produto/save",
            dataType: "json",
            data: produto,
            success: function(result) {
                destravarFormulario();
                $('#novoModal').modal('hide');
                $("form")[0].reset();
                atualizaGrid();
            },
            error: function(result) {
                destravarFormulario();
                $("#errorServer").html(getErrorMessage(result.responseText));
                $("#errorServer").show();
            }

        });
    }
    else
    {
        $("#errorEmpty").show();
        $("#erroServer").hide();
    }

});

function travarFormulario()
{
    $("#errorEmpty").hide();
    $("form").hide();
    $("#saveMessage").show();
    $("#salvar").addClass("disabled");
    $("#clearForm").addClass("disabled");
}

function destravarFormulario()
{
    $("#errorEmpty").hide();
    $("#errorServer").hide();
    $("form").show();
    $("#saveMessage").hide();
    $("#salvar").removeClass("disabled");
    $("#clearForm").removeClass("disabled");
}

$(".icon-remove").live("click", function() {
    id = $(this).attr("data-id");
    nome = $(this).attr("data-nome");
    row = $(this);
    if (confirm("Excluir " + nome + "?"))
    {

        $.ajax({
            type: "post",
            url: rootUrl + "produto/delete",
            dataType: "json",
            data: JSON.stringify({id: id}),
            success: function() {
                row.parent().parent().parent().fadeTo(400, 0, function() {
                    row.parent().parent().parent().remove();
                });
            },
            error: function() {
                //todo
            }
        });
    }
});

$("#edit").live("click", function() {

    id = $(this).attr("data-id");

    $("#errorServer").hide();
    $("#errorEmpty").hide();


    $.ajax({
        type: "get",
        url: rootUrl + "produto/list/" + id,
        dataType: "json",
        success: function(data) {


            produto = data.result;
            $("#inputId").val(produto.id);
            $("#inputNome").val(produto.nome);
            $("#inputQuantidade").val(produto.quantidade);
            $("#inputQuantidadeMinima").val(produto.quantidadeMinima);
            $("#inputPrecoUnitario").val(produto.precoUnitario);
            $("#inputDescricao").val(produto.descricao);
            $("input[name=checkAtivo]").attr("checked", produto.ativo == 0 ? false : true);
            $("#selectCategoria").val(produto.idCategoria);
            $("#selectFornecedor").val(produto.idFornecedor);
            $("#inputCodigo").val(produto.codigo);

            $("#inputPrecoUnitario").maskMoney('mask');

            $("#novoModal").modal("show");
        },
        error: function(result)
        {
            $("#errorLoad").html(getErrorMessage(result.responseText));
            $("#errorLoad").show();
        }
    });


});

//CATEGORIAS
function loadCategorias() {

    $("#listCategorias").html("");
    $("#loadCategoria").show();

    $.ajax({
        type: "get",
        dataType: "json",
        url: rootUrl + "categoria/listAll",
        success: function(data) {
            selectFornecedor = $("#selectCategoria");
            selectFornecedor.find('option').remove().end();

            $("#loadCategoria").hide();

            data.result.forEach(function(categoria) {

                //adiciona dados no dropdown de categorias
                selectFornecedor.append('<option value="' + categoria.id + '">' + categoria.nome + '</option>');

                //adiciona dados na tabela de categorias
                row = "<a href='#' data-id='" + categoria.id + "' data-nome='" + categoria.nome + "' class='categoriaEdit'><span class='badge badge-success'>" + categoria.nome + "</span></a>";
                $("#listCategorias").append(row);

            });

        },
        error: function(result) {
            $("#errorLoad").html(getErrorMessage(result.responseText));
            $("#errorLoad").show();
        }
    });

}

$("#btnCategoria, #btnCategoria2").click(function() {
    $("#categoriaModal").modal('show');
});


$(".categoriaEdit").live("click", function() {
    resetBadgeCategorias();
    $(this).find("span").removeClass("badge-success").addClass("badge-important");
    $("#hiddenCategoriaId").val($(this).attr("data-id"));
    $("#inputCategoriaNome").val($(this).attr("data-nome"));
});

$("#linkNovaCategoria").click(function() {
    resetBadgeCategorias();
    $("#hiddenCategoriaId").val(0);
    $("#inputCategoriaNome").val("");
});


$("#btnSalvarCategoria").click(function() {

    if ($("#inputCategoriaNome").val().length > 0) {

        $("#errorlistCategorias").hide();

        $("#listCategorias").html("");

        $("#loadCategoria").show();

        data = JSON.stringify({id: $("#hiddenCategoriaId").val(), nome: $("#inputCategoriaNome").val()});

        $.ajax({
            type: "post",
            dataType: "json",
            data: data,
            url: rootUrl + "categoria/save",
            success: function(data) {
                loadCategorias();
                $("#hiddenCategoriaId").val(0);
                $("#inputCategoriaNome").val("");
            },
            error: function(result) {
                $("#errorlistCategorias").html(getErrorMessage(result.responseText));
                $("#errorlistCategorias").show();
            }
        });

    } else {
        $("#errorlistCategorias").html("Campo em branco");
        $("#errorlistCategorias").show();
    }

});

function resetBadgeCategorias()
{
    $(".categoriaEdit").map(function() {
        $(this).find("span").removeClass("badge-important").addClass("badge-success");
    });
}

//Fornecedores
function loadFornecedores() {
    $.ajax({
        type: "get",
        dataType: "json",
        url: rootUrl + "fornecedor/listAll",
        success: function(data) {
            selectFornecedor = $("#selectFornecedor");
            selectFornecedor.find('option').remove().end();

            selectFornecedor2 = $("#selectFornecedor2");
            selectFornecedor2.find('option').remove().end();

            data.result.forEach(function(row) {
                selectFornecedor.append('<option value="' + row.id + '">' + row.nome + '</option>');
                selectFornecedor2.append('<option value="' + row.id + '">' + row.nome + '</option>');
            });

        },
        error: function(result) {
            $("#errorLoad").html(getErrorMessage(result.responseText));
            $("#errorLoad").show();
        }
    });
}

$("#btnFornecedor, #btnFornecedor2").click(function() {
    $("#fornecedorModal").modal('show');
});

$("#linkNovoFornecedor").click(function() {
    $("#hiddenIdFornecedor").val(0);
    $("#inputNomeFornecedor").val("");
    $("#inputCnpjFornecedor").val("");
});

$("#btnSalvarFornecedor").click(function() {

    if ($("#inputNomeFornecedor").val().length > 0) {

        $("#errorFornecedor").hide();
        $("#loadFornecedor").show();

        data = JSON.stringify({id: $("#hiddenIdFornecedor").val(), nome: $("#inputNomeFornecedor").val(), cnpj: $("#inputCnpjFornecedor").val()});

        $.ajax({
            type: "post",
            dataType: "json",
            data: data,
            url: rootUrl + "fornecedor/save",
            success: function(data) {
                $("#loadFornecedor").hide();
                $("#hiddenFornecedorId").val(0);
                $("#inputNomeFornecedor").val("");
                $("#inputCnpjFornecedor").val("");
                loadFornecedores();
            },
            error: function(result) {
                $("#loadFornecedor").hide();
                $("#errorFornecedor").html(getErrorMessage(result.responseText));
                $("#errorFornecedor").show();
            }
        });

    } else {
        $("#errorFornecedor").html("Campo nome é requerido");
        $("#errorFornecedor").show();
    }

});

$("#selectFornecedor2").change(function() {
    $("#loadFornecedor").show();
    $.ajax({
        type: "get",
        url: rootUrl + "fornecedor/list/" + $("#selectFornecedor2").val(),
        dataType: "json",
        success: function(data) {
            fornecedor = data.result;
            $("#hiddenIdFornecedor").val(fornecedor.id);
            $("#inputNomeFornecedor").val(fornecedor.nome);
            $("#inputCnpjFornecedor").val(fornecedor.cnpj);
            $("#loadFornecedor").hide();
        },
        error: function(result) {
            $("#loadFornecedor").hide();
            $("#errorFornecedor").html(getErrorMessage(result.responseText));
            $("#errorFornecedor").show();
        }
    })
});