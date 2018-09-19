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
        KeyConditionExpression: "userId = :uid",
        FilterExpression: "#pass = :pass",
        ExpressionAttributeNames: {
            "#pass": "password"
        },
        ExpressionAttributeValues: {
            ":uid": body.userId,
            ":pass": body.password
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
        if (data.Items.length === 0) {
            response.statusCode = 401;
            response.body = JSON.stringify({
                message: "認証に失敗しました"
            });
            callback(null, response);
            return;
        }
        console.log(data);
        response.body = JSON.stringify({
            token: "mti-internship",
            userId: data.Items[0].userId,
            weight: data.Items[0].weight
        });
        callback(null, response);
        return;
    });
};
