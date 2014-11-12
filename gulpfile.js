var gulp = require('gulp'),
    del = require('del'),
    mocha = require('gulp-mocha'),
    jshint = require('gulp-jshint'),
    header = require('gulp-header'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    browserify = require('gulp-browserify'),
    jsonfile = require('jsonfile'),
    exec = require('child_process').exec;

gulp.task('lint', function () {
    return gulp
        .src('./src/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('clean', ['lint'], function (cb) {
    del(['./dist/'], cb);
});

gulp.task('bundle', ['clean'], function () {
    return gulp
        .src('./src/brim.js')
        .pipe(browserify({
            //debug : true
        }))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('version', ['bundle'], function () {
    var pkg = jsonfile.readFileSync('./package.json'),
        distHeader = '/**\n * @version ' + pkg.version + '\n * @link https://github.com/gajus/' + pkg.name + ' for the canonical source repository\n * @license https://github.com/gajus/' + pkg.name + '/blob/master/LICENSE BSD 3-Clause\n */\n',
        bower = jsonfile.readFileSync('./bower.json');

    gulp
        .src('./dist/' + pkg.name + '.js')
        .pipe(header(distHeader))
        .pipe(gulp.dest('./dist/'))
        .pipe(uglify())
        .pipe(rename(pkg.name + '.min.js'))
        .pipe(header(distHeader))
        .pipe(gulp.dest('./dist/'));

    bower.name = pkg.name;
    bower.description = pkg.description;
    bower.version = pkg.version;
    bower.keywords = pkg.keywords;
    bower.license = pkg.license;
    bower.authors = [pkg.author];

    jsonfile.writeFileSync('./bower.json', bower);
});

gulp.task('test', ['version'], function (cb) {
    return gulp
        .src('./tests/*.js', {read: false})
        .pipe(mocha());
});

gulp.task('readme', function () {
    exec('ruby ./.readme/github_toc.rb ./.readme/README.md ./README.md', {cwd: __dirname});
});

gulp.task('watch', function () {
    gulp.watch(['./src/*', './tests/*', './package.json'], ['default']);
    gulp.watch('./.readme/README.md', ['readme']);
});

gulp.task('default', ['test']);