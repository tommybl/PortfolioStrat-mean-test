var gulp = require('gulp');
var bower = require('gulp-bower');
var less = require('gulp-less');
var path = require('path');

gulp.task('default', function() {
    return bower()
        .pipe(gulp.src('app/less/*.less'))
        .pipe(less({ paths: [ path.join(__dirname, 'less', 'includes') ] }))
        .pipe(gulp.dest('app/css'));
});

gulp.task('less', function() {
    return gulp.src('app/less/*.less')
        .pipe(less({ paths: [ path.join(__dirname, 'less', 'includes') ] }))
        .pipe(gulp.dest('app/css'));
});

gulp.task('bower', function() {
    return bower();
});