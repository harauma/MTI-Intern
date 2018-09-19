const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const tableName = "team-C-Task-internship";

exports.handler = (event, context, callback) => {
    let response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({ message: "" })
    };

    if (!event.headers || event.headers.Authorization !== "mti-internship") {
        response.statusCode = 401;
        response.body = JSON.stringify({ message: "ログインが必要です" });
        callback(null, response);
        return;
    }

    let userId = event.queryStringParameters.userId;

    var param = {
        TableName: tableName,
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: {
            ":uid": userId
        }
    };

    dynamo.query(param, function(err, data) {
        if (err) {
            response.statusCode = 500;
            response.body = JSON.stringify({
                message: "予期せぬエラーが発生しました"
            });
            callback(null, response);
            return;
        }
        response.body = JSON.stringify(data.Items);
        callback(null, response);
        return;
    });
};
