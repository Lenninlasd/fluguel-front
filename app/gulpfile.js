var gulp = require('gulp');
var plumber = require('gulp-plumber');
var plugins = require('gulp-load-plugins')();
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var imageminOptipng = require('imagemin-optipng');
var gulpFilter = require('gulp-filter');
var del = require('del');
var es = require('event-stream');
var bowerFiles = require('main-bower-files');
var print = require('gulp-print');
var Q = require('q');

// == PATH STRINGS ========

var paths = {
    scripts: 'app/**/*.js',
    styles: ['./app/**/*.css', './app/**/*.scss'],
    images: ['./app/images/**/*','./app/images/**/*.png'],
    index: './app/index.html',
    partials: ['app/**/*.html', '!app/index.html'],
    distDev: './dist.dev',
    distProd: './dist.prod',
    distScriptsProd: './dist.prod/scripts',
    scriptsDevServer: 'devServer/**/*.js'
};

// == PIPE SEGMENTS ========

var pipes = {};

pipes.orderedVendorScripts = function() {
    return plugins.order(['jquery.js', 'angular.js']);
};

pipes.orderedAppScripts = function() {
    return plugins.angularFilesort();
};

pipes.minifiedFileName = function() {
    return plugins.rename(function (path) {
        path.extname = '.min' + path.extname;
    });
};

pipes.validatedAppScripts = function() {
    return gulp.src(paths.scripts)
    .pipe(plumber())
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));
};

pipes.builtAppScriptsDev = function() {
    return pipes.validatedAppScripts()
        .pipe(gulp.dest(paths.distDev));
};

pipes.builtAppScriptsProd = function() {
    var scriptedPartials = pipes.scriptedPartials();
    var validatedAppScripts = pipes.validatedAppScripts();

    return es.merge(scriptedPartials, validatedAppScripts)
        .pipe(pipes.orderedAppScripts())
        .pipe(plugins.sourcemaps.init())
        .pipe(plumber())
            .pipe(plugins.concat('app.min.js'))
            .pipe(plugins.uglify())
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest(paths.distScriptsProd));
};

pipes.builtVendorScriptsDev = function() {
    return gulp.src(bowerFiles())
    .pipe(plumber())
        .pipe(gulp.dest('dist.dev/bower_components'));
};

pipes.builtVendorScriptsProd = function() {
    var jsFilter = gulpFilter('**/*.js')
    var cssFilter = gulpFilter('**/*.css')
    return gulp.src(bowerFiles())
        .pipe(plumber())
        .pipe(pipes.orderedVendorScripts())
        .pipe(jsFilter)
        //.pipe(plugins.minifyCss())
        .pipe(plugins.uglify())
        .pipe(plugins.concat('vendor.min.js'))
        //.pipe(plugins.uglify())
        .pipe(gulp.dest(paths.distScriptsProd))
        .pipe(jsFilter.restore())
         .pipe(cssFilter)
         .pipe(plugins.minifyCss())
         .pipe(plugins.concat('vendor.min.css'))
         .pipe(gulp.dest(paths.distProd + '/styles'))
        .pipe(cssFilter.restore());


};

pipes.validatedDevServerScripts = function() {
    return gulp.src(paths.scriptsDevServer)
    .pipe(plumber())
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));
};

pipes.validatedPartials = function() {
    return gulp.src(paths.partials)
    .pipe(plumber())
        .pipe(plugins.htmlhint({'doctype-first': false}))
        .pipe(plugins.htmlhint.reporter());
};

pipes.builtPartialsDev = function() {
    return pipes.validatedPartials()
    .pipe(plumber())
        .pipe(gulp.dest(paths.distDev));
};

pipes.scriptedPartials = function() {
    return pipes.validatedPartials()
    .pipe(plumber())
        .pipe(plugins.htmlhint.failReporter())
        .pipe(plugins.htmlmin({collapseWhitespace: true, removeComments: true}))
        .pipe(plugins.ngHtml2js({
            moduleName: "healthyGulpAngularApp"
        }));
};

pipes.builtStylesDev = function() {
    return gulp.src(paths.styles)
    .pipe(plumber())
        .pipe(plugins.sass())
        .pipe(gulp.dest(paths.distDev));
};

pipes.builtStylesProd = function() {
    return gulp.src(paths.styles)
         .pipe(plumber())
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.sass())
        .pipe(plugins.minifyCss())
        .pipe(plugins.sourcemaps.write())
        .pipe(pipes.minifiedFileName())
        .pipe(gulp.dest(paths.distProd));
};

pipes.processedImagesDev = function() {
    return gulp.src(paths.images)
        .pipe(plumber())
        .pipe(gulp.dest(paths.distDev + '/images/'));
};

pipes.processedImagesProd = function() {
    return gulp.src(paths.images)
        .pipe(imagemin({ progressive: true, use: [pngquant()] }))
         .pipe(imageminOptipng({optimizationLevel: 3})())
        .pipe(gulp.dest(paths.distProd + '/images/'));
};

pipes.validatedIndex = function() {
    return gulp.src(paths.index)
        .pipe(plumber())
        .pipe(plugins.htmlhint())
        .pipe(plugins.htmlhint.reporter());
};

pipes.builtIndexDev = function() {

    var orderedVendorScripts = pipes.builtVendorScriptsDev()
        .pipe(pipes.orderedVendorScripts());

    var orderedAppScripts = pipes.builtAppScriptsDev()
        .pipe(pipes.orderedAppScripts());

    var appStyles = pipes.builtStylesDev();

    return pipes.validatedIndex()
        .pipe(gulp.dest(paths.distDev)) // write first to get relative path for inject
        .pipe(plumber())
        .pipe(plugins.inject(orderedVendorScripts, {relative: true, name: 'bower'}))
        .pipe(plugins.inject(orderedAppScripts, {relative: true}))
        .pipe(plugins.inject(appStyles, {relative: true}))
        .pipe(gulp.dest(paths.distDev));
};

pipes.builtIndexProd = function() {

    var vendorScripts = pipes.builtVendorScriptsProd()
    var appScripts = pipes.builtAppScriptsProd()
    var appStyles = pipes.builtStylesProd()

    return pipes.validatedIndex()
        .pipe(plumber())
        .pipe(gulp.dest(paths.distProd)) // write first to get relative path for inject
        .pipe(plugins.inject(vendorScripts, { ignorePath:'/dist.prod', name: 'bower'}))
        .pipe(plugins.inject(appScripts, {addRootSlash: false, ignorePath:'/dist.prod'}))
        .pipe(plugins.inject(appStyles, {addRootSlash: false, ignorePath:'/dist.prod'}))
          .pipe(plugins.htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(paths.distProd));
};

pipes.builtAppDev = function() {
    return es.merge(pipes.builtIndexDev(), pipes.builtPartialsDev(), pipes.processedImagesDev());
};

pipes.builtAppProd = function() {
    return es.merge(pipes.builtIndexProd(), pipes.processedImagesProd());
};

// == TASKS ========

// removes all compiled dev files
gulp.task('clean-dev', function() {
    var deferred = Q.defer();
    del(paths.distDev, function() {
        deferred.resolve();
    });
    return deferred.promise;
});

// removes all compiled production files
gulp.task('clean-prod', function() {
    var deferred = Q.defer();
    del(paths.distProd, function() {
        deferred.resolve();
    });
    return deferred.promise;
});

// checks html source files for syntax errors
gulp.task('validate-partials', pipes.validatedPartials);

// checks index.html for syntax errors
gulp.task('validate-index', pipes.validatedIndex);

// moves html source files into the dev environment
gulp.task('build-partials-dev', pipes.builtPartialsDev);

// converts partials to javascript using html2js
gulp.task('convert-partials-to-js', pipes.scriptedPartials);

// runs jshint on the dev server scripts
gulp.task('validate-devserver-scripts', pipes.validatedDevServerScripts);

// runs jshint on the app scripts
gulp.task('validate-app-scripts', pipes.validatedAppScripts);

// moves app scripts into the dev environment
gulp.task('build-app-scripts-dev', pipes.builtAppScriptsDev);

// concatenates, uglifies, and moves app scripts and partials into the prod environment
gulp.task('build-app-scripts-prod', pipes.builtAppScriptsProd);

// compiles app sass and moves to the dev environment
gulp.task('build-styles-dev', pipes.builtStylesDev);

// compiles and minifies app sass to css and moves to the prod environment
gulp.task('build-styles-prod', pipes.builtStylesProd);

// moves vendor scripts into the dev environment
gulp.task('build-vendor-scripts-dev', pipes.builtVendorScriptsDev);

// concatenates, uglifies, and moves vendor scripts into the prod environment
gulp.task('build-vendor-scripts-prod', pipes.builtVendorScriptsProd);

// validates and injects sources into index.html and moves it to the dev environment
gulp.task('build-index-dev', pipes.builtIndexDev);

// validates and injects sources into index.html, minifies and moves it to the dev environment
gulp.task('build-index-prod', pipes.builtIndexProd);

// builds a complete dev environment
gulp.task('build-app-dev', pipes.builtAppDev);

// builds a complete prod environment
gulp.task('build-app-prod', pipes.builtAppProd);

// cleans and builds a complete dev environment
gulp.task('clean-build-app-dev', ['clean-dev'], pipes.builtAppDev);

// cleans and builds a complete prod environment
gulp.task('clean-build-app-prod', ['clean-prod'], pipes.builtAppProd);

// clean, build, and watch live changes to the dev environment
gulp.task('watch-dev', ['clean-build-app-dev', 'validate-devserver-scripts'], function() {

    // start nodemon to auto-reload the dev server
    plugins.nodemon({ script: 'server.js', ext: 'js', watch: ['devServer/'], env: {NODE_ENV : 'development'} })
        .on('change', ['validate-devserver-scripts'])
        .on('restart', function () {
            console.log('[nodemon] restarted dev server');
        });

    // start live-reload server
    plugins.livereload.listen({ start: true });

    // watch index
    gulp.watch(paths.index, function() {
        return pipes.builtIndexDev()
            .pipe(plugins.livereload());
    });

    // watch app scripts
    gulp.watch(paths.scripts, function() {
        return pipes.builtAppScriptsDev()
            .pipe(plugins.livereload());
    });

    // watch html partials
    gulp.watch(paths.partials, function() {
        return pipes.builtPartialsDev()
            .pipe(plugins.livereload());
    });

    // watch styles
    gulp.watch(paths.styles, function() {
        return pipes.builtStylesDev()
            .pipe(plugins.livereload());
    });

});

// clean, build, and watch live changes to the prod environment
gulp.task('watch-prod', ['clean-build-app-prod', 'validate-devserver-scripts'], function() {

    // start nodemon to auto-reload the dev server
    plugins.nodemon({ script: 'server.js', ext: 'js', watch: ['devServer/'], env: {NODE_ENV : 'production'} })
        .on('change', ['validate-devserver-scripts'])
        .on('restart', function () {
            console.log('[nodemon] restarted dev server');
        });

    // start live-reload server
    plugins.livereload.listen({start: true});

    // watch index
    gulp.watch(paths.index, function() {
        return pipes.builtIndexProd()
            .pipe(plugins.livereload());
    });

    // watch app scripts
    gulp.watch(paths.scripts, function() {
        return pipes.builtAppScriptsProd()
            .pipe(plugins.livereload());
    });

    // watch hhtml partials
    gulp.watch(paths.partials, function() {
        return pipes.builtAppScriptsProd()
            .pipe(plugins.livereload());
    });

    // watch styles
    gulp.watch(paths.styles, function() {
        return pipes.builtStylesProd()
            .pipe(plugins.livereload());
    });

});

// default task builds for prod
gulp.task('default', ['clean-build-app-prod']);





//
// //inicializando GULP
//
// var gulp = require('gulp')
//     uglify = require('gulp-uglify')
//     concat = require('gulp-concat')
//     imagemin= require('gulp-imagemin')
//     pngquant = require('imagemin-pngquant')
//     clean = require('gulp-clean')
//     minifyCSS = require('gulp-minify-css');
//
//
//     var bases = {
//     	app: 'app/',
//     	dist: 'dist/'
//     };
//
//     //Limpia el Directorio dist
// gulp.task('clean', function(){
//     	gulp.src(bases.dist)
//     	.pipe(clean());
// });
//
// gulp.task('minjs', ['clean'], function(){
// 	gulp.src('scripts/**/*.js', {cwd: bases.app})
// 	.pipe(uglify())
//   .pipe(concat('app.min.js'))
// 	.pipe(gulp.dest(bases.dist + 'app/scripts'));
// });
//
// gulp.task('css', ['clean'], function(){
//  //acá va la tarea para minificar el css
//    gulp.src('styles/*.css', {cwd: bases.app})
//   .pipe(minifyCSS({compatibility: 'ie8'}))
// 	.pipe(concat('app.min.css'))
// 	.pipe(gulp.dest(bases.dist + 'app/styles'));
// });
//
// gulp.task('minImg',['clean'], function () {
// 	// tarea para la minificación de img
// 	gulp.src('images/**/*.png',{cwd: bases.app})
// 	.pipe(imagemin())
// 	.pipe(gulp.dest(bases.dist + 'app/images/'));
// });
//
// gulp.task('vendor',['clean'], function() {
//   //tarea para stream bower_components
//   gulp.src('bower_components/**')
//   .pipe(concat('vendor.min.js'))
//   .pipe(uglify())
// 	.pipe(gulp.dest(bases.dist + 'app/scripts'));
//
// });
//
// gulp.task('buildIndexPro', ['clean'], function () {
//   // inyecta las dependencias al index
//
//
//
// })
//
// gulp.task('copy',['clean'], function () {
// 	// copia html en la carpeta destino
// 	gulp.src('index.html',{cwd: bases.app})
// 	 .pipe(gulp.dest(bases.dist + 'app'));
//
//    gulp.src('views/**', {cwd: bases.app} )
//    .pipe(gulp.dest(bases.dist + 'app/views'))
//
// });
//
// gulp.task('default', ['css', 'minjs', 'minImg', 'clean', 'copy']);
//
// //
// // // Cargando los plugins de gulp
// // var clean = require('gulp-clean');
// // var jshint = require('gulp-jshint');
// // var concat = require('gulp-concat');
// // var minifyCSS = require('gulp-minify-css');
// // var uglify= require('gulp-uglify');
// // var imagemin= require('gulp-imagemin');
// // var pngquant = require('imagemin-pngquant');
// //
// // var bases = {
// // 	app: 'app/',
// // 	dist: 'dist/'
// // };
// //
// // var paths = {
// // 	scripts: [],
// // 	libs: [],
// // 	styles: [],
// // 	html: [],
// // 	images: [],
// // 	extras: []
// // };
// //
// // //Limpia el Directorio dist
// // gulp.task('clean', function(){
// // 	return gulp.src(bases.dist)
// // 	.pipe(clean());
// // });
// //
// // gulp.task('minjs', ['clean'], function(){
// // 	//tarea para la minificación de los archivos js
// // 	 gulp.src('scripts/**/*.js', {cwd: bases.app})
// // 	.pipe(jshint())
// // 	.pipe(jshint.reporter('default'))
// // 	.pipe(uglify())
// // 	.pipe(concat('app.min.js'))
// // 	.pipe(gulp.dest(bases.dist + 'scripts/'));
// // });
// //
// // gulp.task('css', ['clean'], function(){
// //  //acá va la tarea para minificar el css
// //    gulp.src('styles/*.css')
// //   .pipe(minifyCSS({compatibility: 'ie8'}))
// // 	.pipe(concat('app.min.css'))
// // 	.pipe(gulp.dest(bases.dist + 'styles/'));
// // });
// //
// //
// //
// // gulp.task('minImg',['clean'], function () {
// // 	// tarea para la minificación de img
// // 	gulp.src('./images/**/*.png',{cwd: bases.app})
// // 	.pipe(imagemin())
// // 	.pipe(gulp.dest(bases.dist + 'images/'));
// // });
// //
// // gulp.task('copy',['clean'], function () {
// // 	// copia html en la carpeta destino
// // 	gulp.src('index.html',{cwd: bases.app})
// // 	 .pipe(gulp.dest(bases.dist));
// // 	//copia css en la carpeta destino
// // 	gulp.src('styles/**/*.css',{cwd: bases.app})
// // 	.pipe(gulp.dest(bases.dist + 'styles'));
// //
// // 	//copia librerias de scripts
// // 	gulp.src('scripts/**', {cwd: 'app/**'})
// // 	.pipe(gulp.dest(bases.dist));
// //
// //
// // });
// //
// // // A development task to run anytime a file changes
// // gulp.task('watch', function() {
// //  gulp.watch('app/**/*', ['minjs', 'copy']);
// // });
// //
// // // Define the default task as a sequence of the above tasks
// // gulp.task('default', ['clean', 'minjs', 'minImg', 'css', 'copy']);
