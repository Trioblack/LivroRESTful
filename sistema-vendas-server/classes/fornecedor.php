<?php

class Fornecedor {

    public function post_save($data) {

        $sql = "";
        if ($data->id) {
            //update
            $sql = "UPDATE Fornecedores SET nome=:nome,cnpj=:cnpj WHERE id=:id";
        } else {
            //insert
            $sql = "INSERT INTO Fornecedores (nome,cnpj) VALUES (:nome,:cnpj)";
        }

        $stmt = DB::prepare($sql);
        $stmt->bindParam("nome", $data->nome);
        $stmt->bindParam("cnpj", $data->cnpj);

        if ($data->id)
            $stmt->bindParam("id", $data->id);

        $stmt->execute();

        return $data;
    }

    function get_list($id) {

        if (!isset($id))
            throw new Exception("Campo id requerido");

        $sql = "SELECT * FROM Fornecedores WHERE id=:id";
        $stmt = DB::prepare($sql);
        $stmt->bindParam("id", $id);
        $stmt->execute();
        return $stmt->fetch();
    }

    function get_listAll() {
        $sql = "SELECT * FROM Fornecedores";
        $stmt = DB::prepare($sql);
        $stmt->execute();

        $result = $stmt->fetchAll();
        return $result;
    }

}