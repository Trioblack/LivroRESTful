
$(document).ready(function() {
    verifyLogin();
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

$('#btnBuscar').click(function() {
    atualizaGrid();
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

        cliente = JSON.stringify({
            idCliente: $("#inputId").val(),
            idUsuario: $("#inputIdUsuario").val(),
            nome: $("#inputNome").val(),
            email: $("#inputEmail").val(),
            login: $("#inputLogin").val(),
            senha: $("#inputSenha").val(),
            cpf: $("#inputCpf").val()
        });

        $.ajax({
            type: "post",
            url: rootUrl + "cliente/save",
            dataType: "json",
            data: cliente,
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

function atualizaGrid()
{
    
    $("#tableClientes").find("tbody tr").remove();
    $("#tableClientes").find("tbody").append('<tr><td colspan=10><div class="alert alert-success"><img src="img/ajax-loader.gif">Carregando...</div></td></tr>');

    filtro = "";
    if ($("#filtrar").val())
        filtro = "/" + $("#filtrar").val();

    $.ajax({
        type: "get",
        url: rootUrl + "cliente/listAll" + filtro,
        dataType: "json",
        success: function(data) {
            $("#tableClientes").find("tbody tr").remove();
            data.result.forEach(function(cliente) {

                row = "<tr>"
                        + "<td><a id='edit' href='#' data-id='" + cliente.id + "'>" + cliente.nome + "</a>"
                        + "</td><td>" + cliente.login
                        + "</td><td> <a href='#'><i class='icon-remove' data-idUsuario='" + cliente.idUsuario + "' data-id='" + cliente.id + "' data-nome='" + cliente.nome + "'/></i></a>"
                        + "</td></tr>";
                $("#tableClientes > tbody:last").append(row);
            });
        }
    });
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
            url: rootUrl + "cliente/delete",
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
        url: rootUrl + "cliente/list/" + id,
        dataType: "json",
        success: function(data) {

            cliente = data.result;
            $("#inputId").val(cliente.id);
            $("#inputIdUsuario").val(cliente.idUsuario);
            $("#inputNome").val(cliente.nome);
            $("#inputEmail").val(cliente.email);
            $("#inputLogin").val(cliente.login);
            $("#inputSenha").val(cliente.senha);
            $("#inputCpf").val(cliente.cpf);
            $("#novoModal").modal("show");
        }
    });


});    