<?php
require_once("../../config/conexion.php");
require_once("../../models/Permisos.php");
Permisos::redirigirSiNoAutorizado();
?>

<!DOCTYPE html>
<html>
    <?php require_once("../MainHead/head.php") ?>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@sweetalert2/theme-bootstrap-4/bootstrap-4.css">
    <link rel="stylesheet" href="./emergenciadetalle.css">
    <script src="../../public/js/sweetaler2v11-11-0.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.min.js"></script>
    <title>Sistema Emergencia</title>
</head>

<body class="with-side-menu">

    <?php require_once("../MainHeader/header.php"); ?>

    <div class="mobile-menu-left-overlay"></div>

    <?php require_once("../MainNav/nav.php"); ?>

    <main class="page-content">
        <div class="container-fluid">
            <header class="section-header">
                <div class="tbl">
                    <div class="tbl-row">
                        <div class="tbl-cell">
                            <h3>Detalle Eventos Emergencias</h3>
                            <ol class="breadcrumb breadcrumb-simple">
                                <li><a href="../Home/">Inicio</a></li>
                                <li class="active">Detalle de las emergencias</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </header>

            <div class="datos-evento">
                <div class="card">
                    <div class="card-body"> 
                        <label class="form-label semibold" for="lblNomIdTicket">Evento ID:</label>
                        <div id="lblNomIdTicket"></div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-body"> 
                        <label class="form-label semibold" for="cat_nom">Categoria:</label>
                        <div id="cat_nom"></div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-body"> 
                        <label class="form-label semibold" for="ev_direc">Dirección:</label>
                        <div id="ev_direc"></div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-body"> 
                        <label class="form-label semibold" for="lblEstado">Estado del evento:</label>
                        <div class="label label-pill" id="lblEstado"></div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-body">
                        <label class="form-label semibold" for="lblNomUsuario">Evento creado por:</label>
                        <div class="label label-pill label-primary" id="lblNomUsuario"></div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-body"> 
                        <label class="form-label semibold" for="lblFechaCrea">Fecha de creación:</label>
                        <div class="label label-pill label-warning" id="lblFechaCrea"></div>
                    </div>
                </div>
            </div>   

            <div class="card">
                <div class="card-body"> 
                    <label class="form-label semibold" for="tic_descripUsu">Descripción del evento</label>
                    <div class="summernote-theme-1">
                        <textarea class="tic_descripUsu" name="tic_descripUsu" id="tic_descripUsu"></textarea>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="lista">
                    <div class="card">
                        <div class="card-body"> 
                            <label class="form-label semibold" for="listaParticipantes">Lista de participantes:</label>
                            <ul id="listaParticipantes" class="list-group">
                                <li class="list-group-item"></li>
                            </ul>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-body">
                            <label class="form-label semibold" for="btnPanelDerivar">Rederivar:</label>
                            <button id='btnPanelDerivar'><i class='fa-solid fa-up-right-from-square'></i></button>
                        </div>
                    </div>
                </div>
            </div>


            <section class="activity-line" id="lblDetalle"></section>

            <div class="box-typical box-typical-padding" id="pnlDetalle">
                <p class="fw-bold">Actualizar estado de la emergencia</p>

                <div class="row">
                    <div class="col-lg-12">
              <div class="form-check">
                 <input type="checkbox" class="form-check-input" id="value_privado">
                <label class="form-check-label" for="exampleCheck1">
                  <i class="fa fa-lock"></i>
                  <span>Privado</span>
                </label>
               </div>
                        <fieldset class="form-group">
                            <label class="form-label semibold" for="ev_desc">Descripción</label>
                            <div class="summernote-theme-1">
                                <textarea class="ev_desc" id="ev_desc"></textarea>
                            </div>
                        </fieldset>
                    </div>
                    <div class="col-lg-12">
                        <button type="button" id="btnEnviar" class="btn btn-rounded btn-inline btn-primary">Enviar</button>
                    </div>
    <?php
            if (Permisos::isPermited("Cerrar Evento")){
               echo '<div class="col-lg-12">';
               echo " <button id='btnPanelCerrar' type='button' class='btn btn-rounded btn-danger ladda-button modal-btn'> <i class='fa-solid fa-square-xmark'></i> Cerrar Evento</button>";
               echo '</div>';
            }
    ?>
                </div>

            </div>

		</div>
    </main>

<!--.page-content-->

    <?php require_once("../MainFooter/footer.php"); ?>

    <?php
require_once('modalCerrar.php');
include("../../view/ControlEventos/modalDerivar.php"); 
require_once("../MainJs/js.php");
?>
</body>
<script type="text/javascript" src="./emergenciadetalle.js"></script>
<script type="text/javascript" src="../ControlEventos/derivar.js"></script>

</html>
