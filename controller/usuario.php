<?php
require_once("../config/conexion.php");
require_once("../models/Usuario.php");
require_once("../models/SeguridadPassword.php");
require_once("../models/RegistroLog.php");
$usuario = new Usuario();
$RegistroLog= new RegistroLog();

if (isset($_GET["op"])) {
    switch ($_GET["op"]) {
        case "add_usuario":
            $datos = $usuario->add_usuario($_POST['usu_nom'],
            $_POST['usu_ape'],
            $_POST['usu_correo'],
            $_POST['usu_name'],
            $_POST['usu_pass'],
            $_POST['fecha_crea'],
            $_POST['estado'],
            $_POST['usu_tipo']);
            if ($datos == true) {
                $seguridadPassword = new  SeguridadPassword();
                $seguridadPassword->add_password_info($_POST['usu_correo'],$_POST['usu_name'], $_POST['usu_pass']);
                echo 1;
                $RegistroLog->add_log_registro($_SESSION["usu_id"],$_GET['op'],"el usuario {$_SESSION['usu_nom']} crea al usuario {$_POST['usu_name']}");
            } else {
                echo 0;
                $RegistroLog->add_log_registro($_SESSION["usu_id"],$_GET['op'],"el usuario {$_SESSION['usu_nom']} intenta crear usuario: {$_POST['usu_name']} operaccion fallida");
            }
            break;

        case "get_tipo":

            $usu_tipo = $_POST['#usu_tipo'];

            $datos = $usuario->get_tipo($usu_tipo);

            if (count($datos) > 0){
                $resultado = $datos["usu_tipo"];
                echo $resultado;
            }else{
                echo false;
            }
            break;
        
        case "get_todos_usuarios":
            $datos = $usuario->get_todos_usuarios();

            if (is_array($datos) == true and count($datos) > 0) {
                $html = "";
                foreach ($datos as $row) {
                    $html .= "<option value=" . $row['usu_tipo_id'] . ">" . $row['usu_tipo_nom'] . "</option>";
                }
                echo $html;
            }
            break;
            
    }
}
