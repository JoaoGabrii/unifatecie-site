const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const cleanCSS = require("gulp-clean-css");
const sourcemaps = require("gulp-sourcemaps");
const browserSync = require("browser-sync").create();
const { deleteAsync } = require("del");

// caminhos
const paths = {
  scss: "src/scss/**/*.scss",
  cssOut: "src/css",
  html: "src/**/*.html",
  js: "src/js/**/*.js",
  data: "src/data/**/*",
  assets: "src/assets/**/*",
  dist: "dist"
};



// SCSS -> CSS (dev)
function stylesDev() {
  return gulp.src("src/scss/main.scss")
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(paths.cssOut))
    .pipe(browserSync.stream());
}

// SCSS -> CSS (build minificado)
function stylesBuild() {
  return gulp.src("src/scss/main.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(cleanCSS())
    .pipe(gulp.dest(paths.dist + "/css"));
}

function clean() {
  return deleteAsync([paths.dist]);
}

// copia arquivos pro dist
function copyToDist() {
  return gulp.src([
    "src/**/*.html",
    "src/js/**/*",
    "src/data/**/*",
    "src/assets/**/*"
  ], { base: "src" })
  .pipe(gulp.dest(paths.dist));
}

// servidor dev (raiz = src)
function devServer() {
  browserSync.init({
    server: { baseDir: "src" },
    port: 3000
  });

  gulp.watch(paths.scss, stylesDev);
  gulp.watch([paths.html, paths.js, paths.data, paths.assets]).on("change", browserSync.reload);
}

exports.dev = gulp.series(stylesDev, devServer);
exports.build = gulp.series(clean, gulp.parallel(stylesBuild, copyToDist));