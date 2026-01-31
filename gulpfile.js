const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const cleanCSS = require("gulp-clean-css");
const sourcemaps = require("gulp-sourcemaps");
const browserSync = require("browser-sync").create();
const { deleteAsync } = require("del");
const terser = require("gulp-terser");
const htmlmin = require("gulp-htmlmin");
const javascriptObfuscator = require("gulp-javascript-obfuscator");


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

// copia HTML, JSON, assets (sem mexer)
function copyHtmlToDist() {
  return gulp.src("src/**/*.html", { base: "src" })
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true,
      minifyCSS: true
      // minifyJS: true  // eu NÃO recomendo aqui porque já minificamos JS separado
    }))
    .pipe(gulp.dest(paths.dist));
}

function copyDataAndAssetsToDist() {
  return gulp.src([
    "src/data/**/*",
    "src/assets/**/*"
  ], { base: "src" })
  .pipe(gulp.dest(paths.dist));
}

// copia JS MINIFICADO
function copyJsToDist() {
  return gulp.src("src/js/**/*.js", { base: "src" })
    .pipe(terser()) // 1) minifica primeiro
    .pipe(javascriptObfuscator({
      compact: true,
      stringArray: true,
      stringArrayThreshold: 0.6,
      deadCodeInjection: false,     // eu deixaria false pra evitar bugs
      stringArray: true,
      stringArrayThreshold: 0.75
    }))
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
exports.build = gulp.series(
  clean,
  gulp.parallel(stylesBuild, copyHtmlToDist, copyJsToDist, copyDataAndAssetsToDist)
);
