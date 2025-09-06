var gulp = require('gulp');
var path = require('path');
var sass = require('gulp-sass')(require('sass'));
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var open = require('gulp-open');
var fileInclude = require('gulp-file-include');
var rename = require('gulp-rename');

var Paths = {
  HERE: './',
  DIST: 'dist/',
  CSS: './assets/css/',
  SCSS_TOOLKIT_SOURCES: './assets/scss/black-dashboard.scss',
  SCSS: './assets/scss/**/**',
  HTML: './index.html',
  COMPONENTS: './assets/components/'
};

// Compile SCSS
gulp.task('compile-scss', function () {
  return gulp.src(Paths.SCSS_TOOLKIT_SOURCES)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write(Paths.HERE))
    .pipe(gulp.dest(Paths.CSS));
});

// Build HTML with partials (production)
gulp.task('html', function () {
  return gulp.src(Paths.HTML)
    .pipe(fileInclude({
      prefix: '@@',
      basepath: Paths.COMPONENTS
    }).on('error', function (err) { // ✅ prevent crash
      console.error('File include error:', err.message);
      this.emit('end');
    }))
    .pipe(gulp.dest(Paths.DIST));
});

// Build HTML with partials (dev version into index_dev.html)
gulp.task('html-dev', function () {
  return gulp.src(Paths.HTML)
    .pipe(fileInclude({
      prefix: '@@',
      basepath: Paths.COMPONENTS
    }).on('error', function (err) { // ✅ prevent crash
      console.error('File include error:', err.message);
      this.emit('end');
    }))
    .pipe(rename('index_dev.html'))
    .pipe(gulp.dest(Paths.HERE));
});

// Default build
gulp.task('build', gulp.series('compile-scss', 'html'));

// Watch task: SCSS + HTML -> dev output
gulp.task('watch', function () {
  gulp.watch(Paths.SCSS, gulp.series('compile-scss'));
  gulp.watch([Paths.HTML, Paths.COMPONENTS + '**/*.html'], gulp.series('html-dev'));
});
