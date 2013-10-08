<?php

class Vendedor {

    public function post_save($vendedor) {

        if ($vendedor->idVendedor) {


            //verifica se o login foi alterado, e se foi, deve verificar
            // se o login já existe para outro usuário
            $sqlUsuario = "SELECT id,login FROM Usuarios WHERE id=:id";
            $stmtUsuario = DB::prepare($sqlUsuario);
            $stmtUsuario->bindParam("id", $vendedor->idUsuario);
            $stmtUsuario->execute();
            $usuario = $stmtUsuario->fetch();
            if ($usuario->login != $vendedor->login) {
                $sqlSelect = "SELECT id,nome FROM Usuarios WHERE (login=:login)";
                $stmtSelect = DB::prepare($sqlSelect);
                $stmtSelect->bindValue("login", $vendedor->login);
                $stmtSelect->execute();
                $usuario = $stmtSelect->fetch();
                if ($usuario)
                    throw new Exception("Login pertencente ao usuário '{$usuario->nome}'");
            }



            //update
            $sqlUpdateUsuario = "UPDATE Usuarios SET nome=:nome,email=:email,login=:login,senha=:senha WHERE id=:idUsuario";
            $sqlUpdateVendedor = "UPDATE Vendedores SET cpf=:cpf,matricula=:matricula,dataContratacao=:dataContratacao WHERE id=:idVendedor";

            try {

                DB::beginTransaction();

                $vendedor->dataContratacao = DB::dateToMySql($vendedor->dataContratacao);

                $stmtUsuario = DB::prepare($sqlUpdateUsuario);
                $stmtUsuario->bindParam("nome", $vendedor->nome);
                $stmtUsuario->bindParam("email", $vendedor->email);
                $stmtUsuario->bindParam("login", $vendedor->login);
                $stmtUsuario->bindParam("senha", $vendedor->senha);
                $stmtUsuario->bindParam("idUsuario", $vendedor->idUsuario);
                $stmtUsuario->execute();

                $stmtUsuario = DB::prepare($sqlUpdateVendedor);
                $stmtUsuario->bindParam("cpf", $vendedor->cpf);
                $stmtUsuario->bindParam("matricula", $vendedor->matricula);
                $stmtUsuario->bindParam("dataContratacao", $vendedor->dataContratacao);
                $stmtUsuario->bindParam("idVendedor", $vendedor->idVendedor);
                $stmtUsuario->execute();


                DB::commit();
            } catch (Exception $exc) {
                DB::rollBack();
                throw new Exception($exc->getMessage());
            }
        } else {


            //Verificar se login já existem
            $sqlSelect = "SELECT id,nome FROM Usuarios where (login=:login)";
            $stmtSelect = DB::prepare($sqlSelect);
            $stmtSelect->bindValue("login", $vendedor->login);
            $stmtSelect->execute();
            $usuario = $stmtSelect->fetch();
            if ($usuario)
                throw new Exception("Login pertencente ao usuário '{$usuario->nome}'");



            //insert
            $sqlInsertUsuario = "INSERT INTO Usuarios (nome,email,login,senha,tipo) VALUES (:nome,:email,:login,:senha,:tipo)";
            $sqlInsertVendedor = "INSERT INTO Vendedores (cpf,matricula,ativo,idUsuario,dataContratacao) VALUES (:cpf,:matricula,:ativo,:idUsuario,:dataContratacao)";

            try {

                DB::beginTransaction();

                $vendedor->ativo = "1";
                $vendedor->tipo = "v";

                $vendedor->dataContratacao = DB::dateToMySql($vendedor->dataContratacao);

                $stmtUsuario = DB::prepare($sqlInsertUsuario);
                $stmtUsuario->bindParam("nome", $vendedor->nome);
                $stmtUsuario->bindParam("email", $vendedor->email);
                $stmtUsuario->bindParam("login", $vendedor->login);
                $stmtUsuario->bindParam("senha", $vendedor->senha);
                $stmtUsuario->bindParam("tipo", $vendedor->tipo);

                $stmtUsuario->execute();

                $vendedor->idUsuario = DB::lastInsertId();

                $stmtUsuario = DB::prepare($sqlInsertVendedor);
                $stmtUsuario->bindParam("cpf", $vendedor->cpf);
                $stmtUsuario->bindParam("matricula", $vendedor->matricula);
                $stmtUsuario->bindParam("ativo", $vendedor->ativo);
                $stmtUsuario->bindParam("idUsuario", $vendedor->idUsuario);
                $stmtUsuario->bindParam("dataContratacao", $vendedor->dataContratacao);
                $stmtUsuario->execute();

                $vendedor->id = DB::lastInsertId();

                DB::commit();
            } catch (Exception $exc) {
                DB::rollBack();
                throw new Exception($exc->getMessage());
            }

            return $vendedor;
        }
    }

    function get_list($id) {

        $sql = "SELECT v.id,u.nome,u.senha,u.email,u.login,v.cpf,v.matricula,DATE_FORMAT(v.dataContratacao, '%d/%m/%Y') AS dataContratacao,u.id as idUsuario FROM Usuarios u, Vendedores v WHERE u.id=v.idUsuario AND v.id=:id";
        $stmt = DB::prepare($sql);
        $stmt->bindParam("id", $id);
        $stmt->execute();
        return($stmt->fetch());
    }

    function get_listAll($parameter) {

        $filtroWHERE = "";
        $nomeLike = "%$parameter%";

        if ($parameter)
            $filtroWHERE = " AND u.nome LIKE :nome";

        $sql = "SELECT v.id,u.nome,u.email,u.login,v.cpf,v.matricula,DATE_FORMAT(v.dataContratacao, '%d/%m/%Y') AS dataContratacao,u.id as idUsuario FROM Usuarios u, Vendedores v WHERE u.id=v.idUsuario $filtroWHERE";

        $stmt = DB::prepare($sql);
        
        if ($parameter)
            $stmt->bindParam("nome", $nomeLike);
        
        $stmt->execute();

        $result = $stmt->fetchAll();
        return $result;
    }

    function post_delete($vendedor) {
        $sqlDeleteVendedor = "DELETE FROM Vendedores WHERE id=:id";
        $sqlDeleteUsuario = "DELETE FROM Usuarios WHERE id=:idUsuario";

        try {

            DB::beginTransaction();

            $stmt = DB::prepare($sqlDeleteVendedor);
            $stmt->bindParam("id", $vendedor->id);
            $stmt->execute();

            $stmt = DB::prepare($sqlDeleteUsuario);
            $stmt->bindParam("idUsuario", $vendedor->idUsuario);
            $stmt->execute();

            DB::commit();
        } catch (Exception $exc) {
            DB::rollBack();
            throw new Exception($exc->getMessage());
        }
    }

}