const gulp = require('gulp');
const concat = require('gulp-concat');
const terser = require('gulp-terser');

// Load ordered file paths
const files = require('./ordered-files');

gulp.task('build-debug', function () {
  return gulp.src(files)
    .pipe(concat('ext-all-debug.js'))
    .pipe(gulp.dest('./'));
});

gulp.task('build-min', function () {
  return gulp.src(files)
    .pipe(concat('ext-all.js'))
    .pipe(terser())
    .pipe(gulp.dest('./'));
});

gulp.task('default', gulp.series('build-debug', 'build-min'));
