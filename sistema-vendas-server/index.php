<?php

session_start();

require 'config.php';
require 'DB.php';

require '../Slim/Slim.php';

\Slim\Slim::registerAutoloader();

$app = new \Slim\Slim(array(
    'debug' => false
));

$app->contentType("application/json");

$app->error(function ( Exception $e ) use ($app) {

    echo "{'erro':".$e->getMessage()."}";

});

// GET pode assumir um parametro na URL

$app->get('/:controller/:action(/:parameter)', function($controller, $action, $parameter = null) use($app){
    
    include_once "classes/{$controller}.php";

    $classe = new $controller();

    $retorno = call_user_func_array(array($classe, "get_" . $action), array($parameter);

    echo "{'result':".json_encode($retorno)."}";

});

// POST não possui parâmetro na URL, e sim na requisição
$app->post('/:controller/:action', function($controller, $action) use($app){

    $request = json_decode(\Slim\Slim::getInstance()->request()->getBody());

    include_once "classes/{$controller}.php";

    $classe = new $controller();

    $retorno = call_user_func_array(array($classe, "post_" . $action, array($request));

    echo "{'result':" . json_encode($retorno) . "}";

});

$app->run();