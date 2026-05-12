<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

if (isset($_SERVER['REDIRECT_URL']) && str_starts_with($_SERVER['REDIRECT_URL'], '/api')) {
    $_SERVER['REQUEST_URI'] = $_SERVER['REDIRECT_URL'];
}

if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());
