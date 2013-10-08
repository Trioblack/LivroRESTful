<?php

class Cliente {

    public function post_save($cliente) {

        if ($cliente->idCliente) {


            //verifica se o login foi alterado, e se foi, deve verificar
            // se o login já existe para outro usuário
            $sqlUsuario = "SELECT id,login FROM Usuarios WHERE id=:id";
            $stmtUsuario = DB::prepare($sqlUsuario);
            $stmtUsuario->bindParam("id", $cliente->idUsuario);
            $stmtUsuario->execute();
            $usuario = $stmtUsuario->fetch();
            if ($usuario->login != $cliente->login) {
                $sqlSelect = "SELECT id,nome FROM Usuarios WHERE (login=:login)";
                $stmtSelect = DB::prepare($sqlSelect);
                $stmtSelect->bindValue("login", $cliente->login);
                $stmtSelect->execute();
                $usuario = $stmtSelect->fetch();
                if ($usuario)
                    throw new Exception("Login pertencente ao usuário '{$usuario->nome}'");
            }



            //update
            $sqlUpdateUsuario = "UPDATE Usuarios SET nome=:nome,email=:email,login=:login,senha=:senha WHERE id=:idUsuario";
            $sqlUpdateCliente = "UPDATE Clientes SET cpf=:cpf WHERE id=:idCliente";

            try {

                DB::beginTransaction();

                $stmtUsuario = DB::prepare($sqlUpdateUsuario);
                $stmtUsuario->bindParam("nome", $cliente->nome);
                $stmtUsuario->bindParam("email", $cliente->email);
                $stmtUsuario->bindParam("login", $cliente->login);
                $stmtUsuario->bindParam("senha", $cliente->senha);
                $stmtUsuario->bindParam("idUsuario", $cliente->idUsuario);
                $stmtUsuario->execute();

                $stmtUsuario = DB::prepare($sqlUpdateCliente);
                $stmtUsuario->bindParam("cpf", $cliente->cpf);
                $stmtUsuario->bindParam("idCliente", $cliente->idCliente);
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
            $stmtSelect->bindValue("login", $cliente->login);
            $stmtSelect->execute();
            $usuario = $stmtSelect->fetch();
            if ($usuario)
                throw new Exception("Login pertencente ao usuário '{$usuario->nome}'");

            //insert
            $sqlInsertUsuario = "INSERT INTO Usuarios (nome,email,login,senha,tipo) VALUES (:nome,:email,:login,:senha,:tipo)";
            $sqlInsertCliente = "INSERT INTO Clientes (cpf,idUsuario) VALUES (:cpf,:idUsuario)";

            try {

                DB::beginTransaction();

                $cliente->ativo = "1";
                $cliente->tipo = "c";

                $stmtUsuario = DB::prepare($sqlInsertUsuario);
                $stmtUsuario->bindParam("nome", $cliente->nome);
                $stmtUsuario->bindParam("email", $cliente->email);
                $stmtUsuario->bindParam("login", $cliente->login);
                $stmtUsuario->bindParam("senha", $cliente->senha);
                $stmtUsuario->bindParam("tipo", $cliente->tipo);

                $stmtUsuario->execute();

                $cliente->idUsuario = DB::lastInsertId();

                $stmtUsuario = DB::prepare($sqlInsertCliente);
                $stmtUsuario->bindParam("cpf", $cliente->cpf);
                $stmtUsuario->bindParam("idUsuario", $cliente->idUsuario);
                $stmtUsuario->execute();

                $cliente->id = DB::lastInsertId();

                DB::commit();
            } catch (Exception $exc) {
                DB::rollBack();
                throw new Exception($exc->getMessage());
            }

            return $cliente;
        }
    }

    function get_list($id) {

        $sql = "SELECT c.id,u.nome,u.senha,u.email,u.login,c.cpf,u.id as idUsuario FROM Usuarios u, Clientes c WHERE u.id=c.idUsuario AND c.id=:id";
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

        $sql = "SELECT c.id,u.nome,u.email,u.login,c.cpf,u.id as idUsuario FROM Usuarios u, Clientes c WHERE u.id=c.idUsuario $filtroWHERE";

        $stmt = DB::prepare($sql);

        if ($parameter)
            $stmt->bindParam("nome", $nomeLike);

        $stmt->execute();

        $result = $stmt->fetchAll();
        return $result;
    }

    function post_delete($cliente) {
        $sqlDeleteCliente = "DELETE FROM Clientes WHERE id=:id";
        $sqlDeleteUsuario = "DELETE FROM Usuarios WHERE id=:idUsuario";

        try {

            DB::beginTransaction();

            $stmt = DB::prepare($sqlDeleteCliente);
            $stmt->bindParam("id", $cliente->id);
            $stmt->execute();

            $stmt = DB::prepare($sqlDeleteUsuario);
            $stmt->bindParam("idUsuario", $cliente->idUsuario);
            $stmt->execute();

            DB::commit();
        } catch (Exception $exc) {
            DB::rollBack();
            throw new Exception($exc->getMessage());
        }
    }

    function post_search($data) {
        $data->busca = "%{$data->busca}%";
        $sql = "SELECT c.id,u.nome,u.email,u.login,c.cpf,u.id as idUsuario FROM Usuarios u, Clientes c WHERE u.id=c.idUsuario AND (u.nome LIKE :busca OR c.cpf LIKE :busca)";
        $stmt = DB::prepare($sql);
        $stmt->bindParam("busca", $data->busca);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    function post_newFromVendas($cliente) {
        $letters = 'abcefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
        $rand = substr(str_shuffle($letters), 0, 5);

        $cliente->idCliente = null;
        $cliente->login = $rand;
        $cliente->senha = $rand;
        $cliente->email = "preencher";

        return $this->post_save($cliente);
    }

}