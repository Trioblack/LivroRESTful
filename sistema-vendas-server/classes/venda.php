<?php

class Venda {

    public function post_finalizar($venda) {

        $sqlVenda = "INSERT INTO Vendas (idCliente,idVendedor,dataVenda) VALUES (:idCliente,:idVendedor,:dataVenda)";
        $sqlItemVenda = "INSERT INTO itensVenda (idVenda,idProduto,quantidade,precoUnitario) VALUES (:idVenda,:idProduto,:quantidade,:precoUnitario)";

        try {

            DB::beginTransaction();

            $stmtVendas = DB::prepare($sqlVenda);
            $stmtVendas->bindParam("idCliente", $venda->idCliente);
            $stmtVendas->bindParam("idVendedor", $venda->idVendedor);
            $stmtVendas->bindParam("dataVenda", DB::dateToMySql($venda->data));
            $stmtVendas->execute();

            $venda->idVenda = DB::lastInsertId();

            foreach ($venda->itens as $item) {
                $stmtItem = DB::prepare($sqlItemVenda);
                $stmtItem->bindParam("idVenda", $venda->idVenda);
                $stmtItem->bindParam("idProduto", $item->idProduto);
                $stmtItem->bindParam("quantidade", $item->quantidade);
                $stmtItem->bindParam("precoUnitario", $item->preco);
                $stmtItem->execute();
            }

            DB::commit();
        } catch (Exception $exc) {
            DB::rollBack();
            throw new Exception($exc->getMessage());
        }

        return $venda;
    }

    public function get_listAll() {

        $sql = "SELECT v.id,DATE_FORMAT(v.dataVenda, '%d/%m/%Y') as dataVenda,u.nome as nomeCliente,u2.nome as nomeVendedor FROM Vendas v,Clientes c,Vendedores e, Usuarios u, Usuarios u2 
            WHERE u.id=c.idUsuario and c.id=v.idCliente 
            and u2.id=e.idUsuario and e.id=v.idVendedor";

        $stmt = DB::prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function get_list($id) {

        $sql = "SELECT v.id,DATE_FORMAT(v.dataVenda, '%d/%m/%Y') as dataVenda,u.nome as nomeCliente,u2.nome as nomeVendedor FROM Vendas v,Clientes c,Vendedores e, Usuarios u, Usuarios u2 
            WHERE u.id=c.idUsuario and c.id=v.idCliente 
            and u2.id=e.idUsuario and e.id=v.idVendedor and v.id=:id";

        $stmt = DB::prepare($sql);
        $stmt->bindParam("id", $id);
        $stmt->execute();
        $venda = $stmt->fetch();

        $sqlItens = "SELECT i.*,p.nome FROM itensVenda i,Produtos p WHERE idVenda=:id and i.idProduto=p.id";
        $stmtItens = DB::prepare($sqlItens);
        $stmtItens->bindParam("id", $id);
        $stmtItens->execute();
        $venda->itens = $stmtItens->fetchAll();

        return $venda;
    }

}