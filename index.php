<?php

require 'Slim/Slim.php';

\Slim\Slim::registerAutoloader();

$app = new \Slim\Slim(array(
    'debug' => false
));

$app->error(function ( Exception $e ) use ($app) {

    $erroObj = new stdClass();
    $erroObj->message = $e->getMessage();
    //$erroObj->trace = $e->getTraceAsString();
    $erroObj->file = $e->getFile();
    $erroObj->line = $e->getLine();

    echo "{'erro':".json_encode($erroObj)."}";

});

$app->get('/:controller/:action(/:parameter)', function($controller, $action, $parameter = null){
    
    include_once "classes/{$controller}.php";

    $classe = new $controller();

    $chamada = call_user_func_array(array($classe, $action), array($parameter));

    echo "{'result':".json_encode($chamada)."}";

});

$app->run();