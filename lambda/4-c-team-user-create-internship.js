const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const userTableName = "team-C-User-internship";
const userInfoTableName = "team-C-UserInfo-internship";

exports.handler = (event, context, callback) => {
    let response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({ message: "" })
    };

    let body = JSON.parse(event.body);

    //TODO: DBに登録するための情報をparamオブジェクトとして宣言する（中身を記述）
    let userParam = {
        TableName: userTableName,
        Item: {
            userId: body.userId,
            password: body.password,
            weight: body.weight
        },
        ReturnValues: "ALL_OLD"
    };

    // カテゴリーとサブカテゴリーに使用している文字列
    // category(subCategory)
    // commuteWork(walking, train, bicycle)
    // deskWork(deskWork)
    let userInfoParams = [
        {
            TableName: userInfoTableName,
            Item: {
                userId: body.userId,
                subCategory: "walking",
                category: "commuteWork",
                time: body.userInfo.walking
            }
        },
        {
            TableName: userInfoTableName,
            Item: {
                userId: body.userId,
                subCategory: "train",
                category: "commuteWork",
                time: body.userInfo.train
            }
        },
        {
            TableName: userInfoTableName,
            Item: {
                userId: body.userId,
                subCategory: "bicycle",
                category: "commuteWork",
                time: body.userInfo.bicycle
            }
        },
        {
            TableName: userInfoTableName,
            Item: {
                userId: body.userId,
                subCategory: "deskWork",
                category: "deskWork",
                time: body.userInfo.deskWork
            }
        }
    ];

    dynamo.put(userParam, function(err, data) {
        if (err) {
            response.statusCode = 500;
            response.body = JSON.stringify({
                message: "予期せぬエラーが発生しました"
            });
            callback(null, response);
            return;
        }
        // userInfoを全て登録
        userInfoParams.forEach(function(param) {
            dynamo.put(param, function(err, data) {
                if (err) {
                    response.statusCode = 500;
                    response.body = JSON.stringify({
                        message: "予期せぬエラーが発生しました"
                    });
                    callback(null, response);
                    return;
                }
            });
        });
        // @TODO 適切なメッセージを返す
        response.body = JSON.stringify({
            message: "ユーザー登録が完了しました"
        });
        callback(null, response);
        return;
    });
};
