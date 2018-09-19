let _dist = "./dist";
let _distZip = "./dist.zip";

var gulp = require("gulp");
var zip = require("gulp-zip");
var del = require("del");
var install = require("gulp-install");
var runSequence = require("run-sequence");
var awsLambda = require("node-aws-lambda");
var fs = require("fs");
var lambdaConfig = require("./lambda-config.js");

var awspublish = require("gulp-awspublish");

// distディレクトリのクリーンアップと作成済みのdist.zipの削除
gulp.task("clean", function(cb) {
    return del([_distZip, "./dist/**/*"], cb);
    //return del([_dist, _distZip], cb);
});

// AWS Lambdaファンクション本体(index.js)をdistディレクトリにコピー
gulp.task("js", function() {
    return gulp
        .src(["./lambda/*-internship.js", "!./lambda/username*"])
        .pipe(gulp.dest(_dist));
});

// AWS Lambdaファンクションのデプロイメントパッケージ(ZIPファイル)に含めるnode.jsパッケージをdistディレクトリにインストール
// ({production: true} を指定して、開発用のパッケージを除いてインストールを実施)
gulp.task("node-mods", function() {
    return gulp
        .src("./package.json")
        .pipe(gulp.dest(_dist))
        .pipe(
            install({
                production: true
            })
        );
});

// デプロイメントパッケージの作成(distディレクトリをZIP化)
gulp.task("zip", function() {
    return gulp
        .src(["dist/**/*", "!dist/package.json"])
        .pipe(zip(_distZip))
        .pipe(gulp.dest("./"));
});

// AWS Lambdaファンクションの登録(ZIPファイルのアップロード)
// (既にFunctionが登録済みの場合はFunctionの内容を更新)
gulp.task("upload", function(callback) {
    fs.readdir(_dist, function(err, files) {
        if (err) throw err;
        files = files.filter(function(e) {
            return e.match(/^.*.js$/);
        });
        var count = files.length;
        files.forEach(function(file) {
            awsLambda.deploy(
                _distZip,
                lambdaConfig.getDeployFile(file),
                function() {
                    count--;
                    if (count == 0) callback();
                }
            );
        });
    });
});

gulp.task("deploy-s3", function(callback) {
    var publisher = awspublish.create(require("./s3-config.json"));
    return gulp
        .src("./s3/**/*")
        .pipe(publisher.publish())
        .pipe(publisher.sync())
        .pipe(awspublish.reporter());
});

gulp.task("deploy-lambda", function(callback) {
    return runSequence(
        ["clean"],
        ["js", "node-mods"],
        ["zip"],
        ["upload"],
        callback
    );
});

gulp.task("deploy", function(callback) {
    return runSequence(["deploy-lambda"], ["deploy-s3"], callback);
});
