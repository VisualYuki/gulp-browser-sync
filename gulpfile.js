const gulp = require("gulp");
const autoprefixer = require("gulp-autoprefixer");
const less = require("gulp-less");
const sourcemaps = require("gulp-sourcemaps");
const shorthand = require("gulp-shorthand");
const cleanCSS = require("gulp-clean-css");
const rename = require("gulp-rename");
const plumber = require("gulp-plumber");
const gulpif = require("gulp-if");
const concat = require("gulp-concat");
const browserSync = require("browser-sync").create();
const cache = require("gulp-cache");
const eslint = require("gulp-eslint");
const babel = require("gulp-babel");
const terser = require("gulp-terser");

let isDev = false;
let isProd = !isDev;
let srcMap = false;

function style () {
   let src = "frontend/web/css/style.less";
   let dest = "frontend/web/css";

   return gulp
      .src(src)
      .pipe(plumber())
      .pipe(gulpif(srcMap, sourcemaps.init()))
      .pipe(less())
      .pipe(gulpif(isProd, autoprefixer()))
      .pipe(gulpif(isProd, shorthand()))
      .pipe(
         gulpif(
            isProd,
            cleanCSS({
               level: 2,
            })
         )
      )
      .pipe(gulpif(srcMap, sourcemaps.write()))
      .pipe(gulp.dest(dest));
};

gulp.task("style", style);

gulp.task("browser-sync", function () {
   browserSync.init({
      proxy: "http://",
      port: 4000,
      open: false,
   });
});

gulp.task("clearCache", async function () {
   gulp.src("frontend/web/css/styles.css").pipe(cache.clear());
   cache.clearAll();
});

function script() {
	let src = "";
	let dest = "";
	
   return gulp
      .src("src/js/main.js")
      .pipe(gulpif(isProd, eslint()))
      .pipe(gulpif(isProd, eslint.format()))
      .pipe(gulpif(isProd, sourcemaps.init()))
      .pipe(
         gulpif(
            isProd,
            babel({
               presets: ["@babel/env"],
            })
         )
      )
      .pipe(gulpif(isProd, terser()))
      .pipe(gulpif(isProd, sourcemaps.write()))
      .pipe(rename({ suffix: ".min" }))
      .pipe(gulp.dest("dist/js"));
};


gulp.task("watch", function () {
   gulp.watch("frontend/web/js/**/*.js").on("change", browserSync.reload);
   gulp.watch("**/*.twig").on("change", browserSync.reload);
   gulp.watch("frontend/web/**/*.css").on("change", browserSync.reload);
   gulp.watch("**/*.php").on("change", browserSync.reload);
	gulp.watch("**/*.js").on("change", browserSync.reload);

   gulp.watch("frontend/web/css/style.less", style);

   //gulp.watch("frontend", gulp.parallel("clearCache"));
});

gulp.task("default", gulp.parallel("browser-sync","watch"));
