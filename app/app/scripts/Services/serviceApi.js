'use strict';
angular.module('SerFlugel', ['ngResource'])

.factory('Config', function () {

	return {

		version : '0.2.2',
		ip: location.hostname,
		port: 3001

	};
})
.factory('Docente',['$resource', 'Config', function ContenidoFactory($resource, Config){
	'use strict';
	return {
		listaClases : $resource('http://' + Config.ip + ':' + Config.port + '/' +  Config.version + '/docente/listaclases.json'),
		contenido : $resource('http://' + Config.ip + ':' + Config.port + '/' +  Config.version + '/docente/contenido.json', {}, { update: {method: 'PUT'}}),
		calificaciones: $resource('http://' + Config.ip + ':' + Config.port + '/' +  Config.version + '/docente/calificaciones.json', {}, { update: {method: 'PUT'}}),
		notas: $resource('http://' + Config.ip + ':' + Config.port + '/' + Config.version +'/docente/notas.json', {}, { update: {method: 'PUT'}}),
		estudiantes: $resource('http://' + Config.ip + ':' + Config.port + '/' + Config.version +'/docente/estudiante.json', {}, { update: {method: 'PUT'}}),
		asistencia: $resource('http://' + Config.ip + ':' + Config.port + '/' + Config.version + '/docente/asistencia.json')
	};
}])
.factory('Usuario',['$resource', 'Config', function ContenidoFactory($resource, Config){
	'use strict';
	return {
		login : $resource('http://' + Config.ip + ':' + Config.port + '/' +  Config.version + '/usuario/login.json'),
		logout : $resource('http://' + Config.ip + ':' + Config.port + '/' +  Config.version + '/usuario/logout.json')
	};
}])
.factory('Coordinador',['$resource', 'Config', function ContenidoFactory($resource, Config){
	'use strict';
	return {
		estudiantes : $resource('http://' + Config.ip + ':' + Config.port + '/' +  Config.version + '/coordinador/estudiante.json'),
		cursos: $resource('http://' + Config.ip + ':' + Config.port + '/' + Config.version + '/coordinador/cursos.json'),
		profesores : $resource('http://' + Config.ip + ':' + Config.port + '/' + Config.version + '/coordinador/profesor.json', {}, { update: {method: 'PUT'}}),
		materias: $resource('http://' + Config.ip + ':' + Config.port + '/' + Config.version + '/coordinador/materias.json')
	};
}])
.factory('Analytics',['$resource', 'Config', function ContenidoFactory($resource, Config){
	'use strict';
	return {
			promedioVsMaterias : $resource('http://' + Config.ip + ':' + Config.port + '/' +  Config.version + '/stat/notasmaterias.json'),
			promedioVsGrados : $resource('http://' + Config.ip + ':' + Config.port + '/' + Config.version + '/stat/notasgrados.json', {}, { update: {method: 'PUT'}}),
	};
}]);
