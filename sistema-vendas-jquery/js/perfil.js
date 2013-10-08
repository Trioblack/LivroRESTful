

$(document).ready(function() {

    $.ajax({
        type: "post",
        url: rootUrl + "usuario/perfil",
        dataType: "json",
        success: function(data) {

            $("#loading").hide();

            usuario = data.result;

            tipo = getDescTipo(usuario.tipo);

            principal = $("#perfil_principal");
            conexao = $("#perfil_conexao");

            $("#perfil_nome").append(usuario.nome);

            //principal.append("<dt>Nome</dt><dd>"+usuario.nome+"</dd>");
            principal.append("<dt>Email</dt><dd>" + usuario.email + "</dd>");
            principal.append("<dt>Tipo de usuário</dt><dd>" + tipo + "</dd>");

            if (usuario.tipo == "v")
            {
                principal.append("<dt>CPF</dt><dd>" + usuario.cpf + "</dd>");
                principal.append("<dt>Matricula</dt><dd>" + usuario.matricula + "</dd>");
                principal.append("<dt>Contratação</dt><dd>" + usuario.dataContratacao + "</dd>");
            }

            if (usuario.tipo == "c")
            {
                principal.append("<dt>CPF</dt><dd>" + usuario.cpf + "</dd>");
            }

            conexao.append("<dt>Último login</dt><dd>" + usuario.lastLogin + "</dd>");
            conexao.append("<dt>Último Ip</dt><dd>" + usuario.lastIp + "</dd>");

            /*
             * Aqui poderímoamos adicionar mais coisas, como por exemplo as vendas de um 
             * vendedor, ou as comprar do cliente. para o admin pode-se mostrar logins que falharam
             * ou os vendedores que mais venderam. Use a imaginação :)
             */

            $("#perfil").show();
        },
        error: function(error) {
            $("#loading").hide();
            $("#errorServer").html(getErrorMessage(error.responseText));
            $("#errorServer").show();
        }
    });

});