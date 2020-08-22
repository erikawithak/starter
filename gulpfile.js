// Initialize modules
// Importing specific gulp API functions lets us write them below as series() instead of gulp.series()
const { src, dest, watch, series, parallel } = require("gulp");
// Importing all the Gulp-related packages we want to use
const babel = require("gulp-babel");
const sourcemaps = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const replace = require("gulp-replace");
const browserSync = require("browser-sync").create();

// File paths
const files = {
	scssPath: "app/scss/**/*.scss",
	jsPath: "app/js/**/*.js",
	indexPath: "./index.html",
};

// Sass task: compiles the style.scss file into style.css
function scssTask() {
	return src(files.scssPath)
		.pipe(sourcemaps.init()) // initialize sourcemaps first
		.pipe(sass()) // compile SCSS to CSS
		.pipe(postcss([autoprefixer(), cssnano()])) // PostCSS plugins
		.pipe(sourcemaps.write(".")) // write sourcemaps file in current directory
		.pipe(dest("dist"))
		.pipe(browserSync.stream()); // put final CSS in dist folder
}

// JS task: concatenates and uglifies JS files to script.js
function jsTask() {
	return src([
		"node_modules/babel-polyfill/dist/polyfill.js",
		files.jsPath,
		//,'!' + 'includes/js/jquery.min.js', // to exclude any specific files
	])
		.pipe(babel({ presets: ["@babel/env"] }))
		.pipe(concat("all.js"))
		.pipe(uglify())
		.pipe(dest("dist"));
}

// Watch task: watch SCSS and JS files for changes
// If any change, run scss and js tasks simultaneously
function watchTask() {
	browserSync.init({
		server: {
			baseDir: "./",
			index: "./index.html",
		},
	});
	watch(
		[files.scssPath, files.jsPath, files.indexPath],
		parallel(scssTask, jsTask)
	).on("change", browserSync.reload);
}

// Export the default Gulp task so it can be run
// Runs the scss and js tasks simultaneously
// then runs cacheBust, then watch task
exports.default = series(
	parallel(scssTask, jsTask)
	//cacheBustTask
);

// Compile SASS
exports.sass = series(scssTask);

// Watch
exports.watch = series(parallel(scssTask, jsTask), watchTask);

//Compile JS
exports.js = series(jsTask);
