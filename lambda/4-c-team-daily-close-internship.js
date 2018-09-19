const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const userTableName = "team-C-User-internship";
const taskTableName = "team-C-Task-internship";
const dailyHistoryTableName = "team-C-DailyHistory-internship";
const weeklyHistoryTableName = "team-C-WeeklyHistory-internship";

exports.handler = (event, context, callback) => {
    let response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({ message: "" })
    };

    if (!event.headers || event.headers.Authorization !== "mti-internship") {
        response.statusCode = 500;
        response.body = JSON.stringify({ message: "ログインが必要です" });
        callback(null, response);
        return;
    }

    let body = JSON.parse(event.body);

    // ユーザの継続日数更新のためのParam
    let userUpdateParam = {
        TableName: userTableName,
        Key: {
            userId: body.userId
        },
        ExpressionAttributeNames: {
            "#d": "days"
        },
        ExpressionAttributeValues: {
            ":d": body.days + 1
        },
        UpdateExpression: "SET #d = :d",
        ReturnValues: "UPDATED_NEW"
    };
    console.log("userUpdateParam: ", userUpdateParam);

    // 完了したタスクを検索するためのParam
    let taskParam = {
        TableName: taskTableName,
        KeyConditionExpression: "userId = :uid",
        FilterExpression: "done = :d",
        ExpressionAttributeValues: {
            ":uid": body.userId,
            ":d": true
        }
    };

    // ユーザ情報更新
    dynamo.update(userUpdateParam, function(err, data) {
        if (err) {
            console.log(err);
            response.statusCode = 500;
            response.body = JSON.stringify({
                message: "予期せぬエラーが発生しました1"
            });
            callback(null, response);
            return;
        }

        // 完了したタスクを検索
        dynamo.query(taskParam, function(err, data) {
            if (err) {
                response.statusCode = 500;
                response.body = JSON.stringify({
                    message: "予期せぬエラーが発生しました2"
                });
                console.log(err);
                callback(null, response);
                return;
            }

            // 一日の消費カロリーを計算
            let sumCalorie = 0;
            data.Items.forEach(function(task) {
                sumCalorie += Math.round(
                    task.intensity * body.weight * (task.time / 60) * 1.05
                );
            });
            console.log("sumCalorie: ", sumCalorie);

            // 日次履歴を作成
            let dailyHistoryParam = {
                TableName: dailyHistoryTableName,
                Item: {
                    userId: body.userId,
                    days: body.days,
                    calorie: sumCalorie
                }
            };
            dynamo.put(dailyHistoryParam, function(err, data) {
                if (err) {
                    response.statusCode = 500;
                    response.body = JSON.stringify({
                        message: "予期せぬエラーが発生しました3"
                    });
                    callback(null, response);
                    return;
                }
            });

            // 週次履歴を作成
            if (body.days % 7 === 0) {
                let weeklyDailyHistoryParam = {
                    TableName: dailyHistoryTableName,
                    KeyConditionExpression:
                        "userId = :uid and days between :d1 and :d2",
                    ExpressionAttributeValues: {
                        ":uid": body.userId,
                        ":d1": body.days - 6,
                        ":d2": body.days + 1
                    }
                };
                let weeklySumCalorie = 0;
                dynamo.query(weeklyDailyHistoryParam, function(err, data) {
                    if (err) {
                        response.statusCode = 500;
                        response.body = JSON.stringify({
                            message: "予期せぬエラーが発生しました2"
                        });
                        console.log(err);
                        callback(null, response);
                        return;
                    }
                    data.Items.forEach(function(history) {
                        console.log(history);
                        weeklySumCalorie += history.calorie;
                    });
                    console.log("weeklySumCalorie: ", weeklySumCalorie);
                    let weeklyHistoryParam = {
                        TableName: weeklyHistoryTableName,
                        Item: {
                            userId: body.userId,
                            week: body.days / 7,
                            calorie: weeklySumCalorie
                        }
                    };
                    dynamo.put(weeklyHistoryParam, function(err, data) {
                        if (err) {
                            response.statusCode = 500;
                            response.body = JSON.stringify({
                                message: "予期せぬエラーが発生しました3"
                            });
                            callback(null, response);
                            return;
                        }
                    });
                    let userUpdateParam = {
                        TableName: userTableName,
                        Key: {
                            userId: body.userId
                        },
                        ExpressionAttributeNames: {
                            "#r": "rate"
                        },
                        ExpressionAttributeValues: {
                            ":r": Math.round(weeklySumCalorie / 7)
                        },
                        UpdateExpression: "SET #r = :r",
                        ReturnValues: "UPDATED_NEW"
                    };
                    console.log("userUpdateParam: ", userUpdateParam);
                    dynamo.update(userUpdateParam, function(err, data) {
                        if (err) {
                            console.log(err);
                            response.statusCode = 500;
                            response.body = JSON.stringify({
                                message: "予期せぬエラーが発生しました1"
                            });
                            callback(null, response);
                            return;
                        }
                    });
                });
            }

            // 完了のタスクを未完了に直す
            let updateTaskParam = [];
            data.Items.forEach(function(task) {
                updateTaskParam.push({
                    TableName: taskTableName,
                    Item: {
                        userId: body.userId,
                        taskName: task.taskName,
                        done: false,
                        intensity: task.intensity,
                        kind: task.kind,
                        time: task.time,
                        week: task.week
                    }
                });
            });
            updateTaskParam.forEach(function(param) {
                console.log("task: ", param);
                dynamo.put(param, function(err, data) {
                    if (err) {
                        response.statusCode = 500;
                        response.body = JSON.stringify({
                            message: "予期せぬエラーが発生しました3"
                        });
                        callback(null, response);
                        return;
                    }
                });
            });
        });

        response.body = JSON.stringify({
            message: "日付の更新を行いました"
        });
        callback(null, response);
    });
};
