<?php

class Produto {

    public function post_save($produto) {

        $sqlSave = "";
        //TODO: foto -> Blob
        if ($produto->idProduto) {
            //update
            $sqlSave = "UPDATE Produtos SET codigo=:codigo,idCategoria=:idCategoria,idFornecedor=:idFornecedor,nome=:nome,quantidade=:quantidade,quantidadeMinima=:quantidadeMinima,precoUnitario=:precoUnitario,descricao=:descricao,ativo=:ativo WHERE id=:idProduto";
        } else {

            //insert
            $sqlSave = "INSERT INTO Produtos (codigo,idCategoria,idFornecedor,nome,quantidade,quantidadeMinima,precoUnitario,descricao,ativo) VALUES (:codigo,:idCategoria,:idFornecedor,:nome,:quantidade,:quantidadeMinima,:precoUnitario,:descricao,:ativo)";
        }
        
        $precoUnitario = DB::decimalToMySql($produto->precoUnitario);
        $stmtProduto = DB::prepare($sqlSave);
        $stmtProduto->bindParam("idCategoria", $produto->idCategoria);
        $stmtProduto->bindParam("idFornecedor", $produto->idFornecedor);
        $stmtProduto->bindParam("nome", $produto->nome);
        $stmtProduto->bindParam("quantidade", $produto->quantidade);
        $stmtProduto->bindParam("quantidadeMinima", $produto->quantidadeMinima);
        $stmtProduto->bindParam("precoUnitario",$precoUnitario );
        $stmtProduto->bindParam("descricao", $produto->descricao);
        $stmtProduto->bindParam("ativo", $produto->ativo);
        $stmtProduto->bindParam("codigo", $produto->codigo);

        if ($produto->idProduto)
            $stmtProduto->bindParam("idProduto", $produto->idProduto);

        $stmtProduto->execute();

        if (!$produto->idProduto)
            $produto->id = DB::lastInsertId();

        return $produto;
    }

    function get_list($id) {

        $sql = "SELECT p.*,c.nome as nomeCategoria,f.nome as nomeFornecedor FROM Produtos p,Categorias c,Fornecedores f WHERE p.idCategoria=c.id AND p.idFornecedor=f.id AND p.id=:id";
        $stmt = DB::prepare($sql);
        $stmt->bindParam("id", $id);
        $stmt->execute();
        return($stmt->fetch());
    }

    function get_listAll($parameter) {

        $filtroWHERE = "";
        $nomeLike = "%$parameter%";
        
        if ($parameter)
            $filtroWHERE = " AND p.nome LIKE :nome";

        $sql = "SELECT p.*,c.nome as nomeCategoria,f.nome as nomeFornecedor FROM Produtos p,Categorias c,Fornecedores f WHERE p.idCategoria=c.id AND p.idFornecedor=f.id $filtroWHERE";

        $stmt = DB::prepare($sql);
        
        if ($parameter)
            $stmt->bindParam ("nome", $nomeLike);
        
        $stmt->execute();

        $result = $stmt->fetchAll();
        return $result;
    }

    function post_delete($produto) {
        $sqlDeleteProduto = "DELETE FROM Produtos WHERE id=:id";

        $stmt = DB::prepare($sqlDeleteProduto);
        $stmt->bindParam("id", $produto->id);
        $stmt->execute();

        return true;
    }

    function post_search($data) {
        $data->busca = "%{$data->busca}%";
        $sql = "SELECT * FROM Produtos WHERE (nome LIKE :busca)";
        $stmt = DB::prepare($sql);
        $stmt->bindParam("busca", $data->busca);
        $stmt->execute();
        return $stmt->fetchAll();
    }

}