// ユーザーのレベルと累計経験値とレートを更新
const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const tableName = "team-C-User-internship";

exports.handler = (event, context, callback) => {
    let response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({ message: "" })
    };

    let body = JSON.parse(event.body);

    let param = {
        TableName: tableName,
        Key: {
            userId: body.userId
        },
        ExpressionAttributeNames: {
            "#l": "level",
            "#e": "exp"
        },
        ExpressionAttributeValues: {
            ":l": Number(body.level),
            ":e": Number(body.exp)
        },
        UpdateExpression: "SET #l = :l, #e = :e",
        ReturnValues: "UPDATED_NEW"
    };
    dynamo.update(param, function(err, data) {
        if (err) {
            console.log(err);
            response.statusCode = 500;
            response.body = JSON.stringify({
                message: "予期せぬエラーが発生しました"
            });
            callback(null, response);
            return;
        } else {
            response.body = JSON.stringify({
                message: "経験値の更新が完了しました"
            });
            callback(null, response);
        }
    });
};
