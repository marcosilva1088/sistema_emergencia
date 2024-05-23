// Crear los campos de entrada de fecha en tu HTML
var startDateInput = $('<input type="date" id="startDate" class="form-control">')
    .insertBefore('#tabla-log');
var endDateInput = $('<input type="date" id="endDate" class="form-control">')
    .insertBefore('#tabla-log');

// Crear el select en tu HTML
var select = $('<select id="mySelect" class="form-select"><option value="">todos</option></select>')
    .insertBefore('#tabla-log');

$.post('../../controller/registroLog.php', { op: 'registro_log' }, function(data) {
    // Verificar que data no esté vacío y sea un arreglo
    if (data.length === 0) {
        $('#tabla-log').append('<tr><td colspan="100%">No hay datos disponibles</td></tr>');
        return;
    }

    // Generar las columnas dinámicamente
    var columns = [];
    for (var key in data[0]) {
        columns.push({ title: key, data: key });
    }

    // Inicializa DataTables
    var table = $('#tabla-log').DataTable({
        data: data,
        columns: columns,
        columnDefs: [
            { searchable: false, targets: [6, 7] } // Deshabilita la búsqueda para las columnas 7 y 8
        ],
        initComplete: function () {
            var column = this.api().column(6); // Índice de la columna "operacion"

            // Agregar lista de opciones
            column
                .data()
                .unique()
                .sort()
                .each(function (d, j) {
                    select.append('<option value="' + d + '">' + d + '</option>');
                });

            // Agregar evento de cambio al select
            select.on('change', function () {
                var val = $.fn.dataTable.util.escapeRegex(
                    $(this).val()
                );

                column
                    .search(val ? '^' + val + '$' : '', true, false)
                    .draw();
            });

            // Agregar evento de cambio a los campos de entrada de fecha
            startDateInput.add(endDateInput).on('change', function () {
                table.draw();
            });
        }
    });

    // Extender la función de búsqueda de DataTables para incluir el filtrado por rango de fechas
    $.fn.dataTable.ext.search.push(
        function(settings, data, dataIndex) {
            var min = startDateInput.val() ? new Date(startDateInput.val()) : null;
            var max = endDateInput.val() ? new Date(endDateInput.val()) : null;
            var col_fecha = 5
            var date = new Date(data[col_fecha].split(" ")[0]); // Índice de la columna "fecha", ignorando la hora

            if ((min === null || date >= min) && (max === null || date <= max)) {
                return true;
            }
            return false;
        }
    );

}, 'json').fail(function(error) {
    console.log('Error: ', error);
});
