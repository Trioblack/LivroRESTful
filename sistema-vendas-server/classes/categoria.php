<?php

class Categoria {

    public function post_save($data) {
        
        $sql = "";
        if ($data->id == 0)
        {
            //insert
            $sql = "INSERT INTO Categorias (nome) VALUES (:nome)";
        }
        else
        {
            //update
            $sql = "UPDATE Categorias SET nome=:nome WHERE id=:id";
        }
        
        $stmt = DB::prepare($sql);
        $stmt->bindParam("nome", $data->nome);
        
        if ($data->id!=0)
            $stmt->bindParam ("id", $data->id);
                
        $stmt->execute();
        
        if ($data->id==0)
            $data->id = DB::lastInsertId();
        
        return $data;
        
    }

    function get_list($id) {
        //todo
    }

    function get_listAll() {
        $sql = "SELECT * FROM Categorias";
        $stmt = DB::prepare($sql);
        $stmt->execute();

        $result = $stmt->fetchAll();
        return $result;
    }

    function post_delete() {
        //todo
    }

} 
