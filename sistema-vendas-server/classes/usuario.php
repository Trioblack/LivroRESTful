<?php

class Usuario {

    /*
    public function post_insert($usuario) {
        $sql = "INSERT INTO usuarios (nome,email,login,senha,tipo) VALUES (:nome,:email,:login,:senha,:tipo)";
        $stmt = DB::prepare($sql);
        $stmt->bindParam("nome", $usuario->nome);
        $stmt->bindParam("email", $usuario->email);
        $stmt->bindParam("login", $usuario->login);
        $stmt->bindParam("senha", $usuario->senha);
        $stmt->bindParam("tipo", $usuario->tipo);
        $stmt->execute();
        $usuario->id = DB::lastInsertId();
        return $usuario;
    }*/

    public function post_login($usuario) {

        if ((empty($usuario->login)) or (empty($usuario->senha)))
            throw new Exception("Login ou senha precisam ser preenchidos");

        $sql = "SELECT * FROM Usuarios WHERE (login=:login and senha=:senha)";
        $stmt = DB::prepare($sql);
        $stmt->bindParam("login", $usuario->login);
        $stmt->bindParam("senha", $usuario->senha);
        $stmt->execute();

        $db_usuario = $stmt->fetch();

        //se for vendedor, pega o idVendedor tb
        if ($db_usuario && $db_usuario->tipo == "v")
        {
            $sqlVendedor = "SELECT * from Vendedores WHERE idUsuario=:id";
            $stmtVendedor = DB::prepare($sqlVendedor);
            $stmtVendedor->bindParam("id", $db_usuario->id);
            $stmtVendedor->execute();
            $db_vendedor = $stmtVendedor->fetch();
            $db_usuario->idVendedor = $db_vendedor->id;
        }

        if ($db_usuario != null) {
            $this->doLogin($db_usuario);
            unset($db_usuario->senha);
            return $db_usuario;
        }

        else
            throw new Exception("Erro ao efetuar login. Usuário/Senha incorretos");
    }

    public function post_perfil() {
        
        if (!$this->get_isLogged())
            throw new Exception("Ninguém logado");

        $tipo = $_SESSION["login_tipo"];

        $sql = "";
        /*
         * Não é interessante criar switch dessa forma, pois quando formos
         * criar um novo tipo, teremos que vir até este código e adicionar
         * mais um item. A solução para este problema é criar classes abstratas,
         * mas como nosso objetivo é abordar o RESTful, não iremos fazer isso em 
         * um primeiro momento.
         */
        switch ($tipo) {
            case "a":
                $sql = "SELECT nome,email,login,DATE_FORMAT(lastLogin, '%d/%m/%Y %h:%m:%s') as lastLogin,lastIp,tipo FROM Usuarios WHERE id=:id";
                break;
            case "v":
                $sql = "SELECT u.nome,u.email,u.login,DATE_FORMAT(u.lastLogin, '%d/%m/%Y %h:%m:%s') as lastLogin,u.lastIp,u.tipo,v.cpf,v.matricula,DATE_FORMAT(v.dataContratacao, '%d/%m/%Y') AS dataContratacao FROM Usuarios u, Vendedores v WHERE u.id=:id and u.id = v.idUsuario";
                break;
            case "c":
                $sql = "SELECT u.nome,u.email,u.login,u.lastLogin,u.lastIp,c.cpf,u.tipo FROM Usuarios u, Clientes c WHERE u.id=:id and u.id = c.idUsuario";
                break;
            default:
                break;
        }
        
        $stmt = DB::prepare($sql);
        $stmt->bindParam("id", $_SESSION["login_id"]);
        $stmt->execute();
        $db_usuario = $stmt->fetch();

        if ($db_usuario != null) {
            return $db_usuario;
        }
        else
            throw new Exception("Erro ao obter perfil");
        
    }

    protected function doLogin($usuario) {
        
        /* Adiciona a data/ip do login */
        $sql = "UPDATE Usuarios SET lastLogin=now(),lastIp=:lastIp WHERE id=:id";
        $stmt = DB::prepare($sql);
        $stmt->bindParam("lastIp",$_SERVER['REMOTE_ADDR']);
        $stmt->bindParam("id", $usuario->id);
        $stmt->execute();
        
        $_SESSION["login_id"] = $usuario->id;
        $_SESSION["login_tipo"] = $usuario->tipo;
    }

    public function get_isLogged() {
        return isset($_SESSION["login_id"]);
    }

    public function get_logout() {
        $_SESSION["login_id"] = null;
        $_SESSION["login_tipo"] = null;
        return true;
    }

}