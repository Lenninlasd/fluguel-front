 <div id="datepickerclass" class="col-md-5 col-md-offset-7 margen-bottom fontSize2">
    <div class="input-group date">
        <input type="text" type="text" placeholder="fecha de asistencia" readonly class="form-control input-lg">
        <span class="input-group-addon"><i class="glyphicon glyphicon-th"></i></span>
    </div>
 </div>

<script>
    $('#datepickerclass .input-group.date').datepicker({
        format: "yyyy-mm-dd",
        todayBtn: "linked",
        language: "es",
        daysOfWeekDisabled: "0,6",
        autoclose: true,
        todayHighlight: true
    });
</script>

<?php foreach ($listaAlumnos['listaEstudiantes'] as $estudiante): ?>
	<div class="media well-white bloque-top col-md-12" style="margin: 0px;">
        <div class="col-md-5 col-xs-7">
            <a class="pull-left hidden-xs" href="#" style="padding-right: 20px;">
                <img class="media-object img-rounded" data-src="holder.js/64x64" alt="64x64" style="width: 50px; height: 50px;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAACZ0lEQVR4Xu2Y3YupURTGHyMSEimfUS4MIheSKDf+efksH0W4QKLIx43PZJxZq5xmOs2Z037PTBNr33gbe693r2c9e/3M1q3X6yseeOhEAHGAHAHpAQ/cAyFNUCggFBAKCAWEAg+sgGBQMCgYFAwKBh8YAvLPkGBQMCgYFAwKBgWDD6yAYFArBlerFfr9Pg6HA6xWKxKJBMxm8ztP1et1bDYbxONxeL3eT/32FTE/eqkmB5xOJxSLRTgcDvj9fvR6PX6mRG9jPB5jNBrhfD7/kwBfEfNvimsSYDqdotvtIpvNcvWv1yt0Ot3v9+12O1SrVYTDYZ53cwCJMhgMkEqlWLBarcYCZTIZzOdzpZif2uqDCZoEoCQomUAggMViAaPRiEgkArvdzmJQYpSgx+NBqVR654BGo4Htdgufz8cOSafTsNlsLIxqTBUR/osAoVAITqcTnU4HLy8vyOfzGA6HXE2q6n6//0MAqni5XMbxeMTz8zOCwSDv/yaASsxvF2AymfC5z+VysFgs/Ex/KxQKqFQqnPjtSJAw9EzJkmPoO5pzuVy4f0SjUd6/lpjfLgBVj5qg2+1mK5MDnp6eWBCiAiVNg5JtNpvcC2ieXq/n3kBzqfLtdhvJZBIul4sdoRLTYDCo5K/9PmC5XLJtaePUCGOxGH++HXTW3/YAcspsNuPjQc5ptVp4xTE3U5PJBJWYStm/LtLUA1Rf+pPWiQBafwn+pGqq7EUcIA6QKzG5EpMrMZXueS9rhAJCAaGAUEAocC8dXSUPoYBQQCggFBAKqHTPe1kjFBAKCAWEAkKBe+noKnk8PAV+AdqfV5+BvqppAAAAAElFTkSuQmCC">
            </a>
            <div class="media-body" style="padding-top: 15px;">
                <h5 class="media-heading text-success"><?php echo $estudiante['nombre'] .' '. $estudiante['apellido']; ?></h5>
            </div>
        </div>
        <div class="col-md-6 col-xs-5">   
            <div class="btn-group" data-toggle="buttons">
                <label class="btn btn-default active">
                    <input type="radio" name="options" id="option1"> <span class="glyphicon glyphicon-ok"></span>
                </label>
                <label class="btn btn-default">
                    <input type="radio" name="options" id="option2"> <span class="glyphicon glyphicon-remove"></span>
                </label>
            </div> 
        </div>

	</div>
<?php endforeach; ?>