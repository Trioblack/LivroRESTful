
$(document).ready(function() {
    verifyLogin();
    atualizaGrid();
    preparaData($("#inputContratacao"));
});

function atualizaGrid()
{
    $("#tableVendedores").find("tbody tr").remove();
    $("#tableVendedores").find("tbody").append('<tr><td colspan=10><div class="alert alert-success"><img src="img/ajax-loader.gif">Carregando...</div></td></tr>')

    filtro = "";
    if ($("#filtrar").val())
        filtro = "/" + $("#filtrar").val();

    $.ajax({
        type: "get",
        url: rootUrl + "vendedor/listAll" + filtro,
        dataType: "json",
        success: function(data) {
            $("#tableVendedores").find("tbody tr").remove();
            data.result.forEach(function(vendedor) {

                row = "<tr><td>" + vendedor.matricula
                        + "</td><td><a id='edit' href='#' data-id='" + vendedor.id + "'>" + vendedor.nome + "</a>"
                        + "</td><td>" + vendedor.login
                        + "</td><td>" + vendedor.dataContratacao
                        + "</td><td> <a href='#'><i class='icon-remove' data-idUsuario='" + vendedor.idUsuario + "' data-id='" + vendedor.id + "' data-nome='" + vendedor.nome + "'/></i></a>"
                        + "</td></tr>";
                $("#tableVendedores > tbody:last").append(row);
            });
        }
    });
}

$('#btnBuscar').click(function() {
    atualizaGrid();
});

$('#btnNovo').click(function() {

    if ($("#inputId").val() != "") {
        $("form")[0].reset();
        $("#inputId").val("");
        $("#inputIdUsuario").val("");
        $("#errorServer").hide();
    }
    $('#novoModal').modal('show');
});


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

    if ($('#inputLogin').val().length == 0)
    {
        valido = false;
        $('#inputLogin').parents("div").addClass("error");
    }

    if ($('#inputSenha').val().length == 0)
    {
        valido = false;
        $('#inputSenha').parents("div").addClass("error");
    }

    if (valido)
    {
        travarFormulario();

        vendedor = JSON.stringify({
            idVendedor: $("#inputId").val(),
            idUsuario: $("#inputIdUsuario").val(),
            nome: $("#inputNome").val(),
            email: $("#inputEmail").val(),
            login: $("#inputLogin").val(),
            senha: $("#inputSenha").val(),
            cpf: $("#inputCpf").val(),
            matricula: $("#inputMatricula").val(),
            dataContratacao: $("#inputContratacao").val()
        });

        $.ajax({
            type: "post",
            url: rootUrl + "vendedor/save",
            dataType: "json",
            data: vendedor,
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
    idUsuario = $(this).attr("data-idUsuario");
    nome = $(this).attr("data-nome");
    row = $(this);
    if (confirm("Excluir " + nome + "?"))
    {

        $.ajax({
            type: "post",
            url: rootUrl + "vendedor/delete",
            dataType: "json",
            data: JSON.stringify({id: id, idUsuario: idUsuario}),
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
        url: rootUrl + "vendedor/list/" + id,
        dataType: "json",
        success: function(data) {

            vendedor = data.result;
            $("#inputId").val(vendedor.id);
            $("#inputIdUsuario").val(vendedor.idUsuario);
            $("#inputNome").val(vendedor.nome);
            $("#inputEmail").val(vendedor.email);
            $("#inputLogin").val(vendedor.login);
            $("#inputSenha").val(vendedor.senha);
            $("#inputCpf").val(vendedor.cpf);
            $("#inputMatricula").val(vendedor.matricula);
            $("#inputContratacao").val(vendedor.dataContratacao);
            $("#novoModal").modal("show");
        }
    });
});    