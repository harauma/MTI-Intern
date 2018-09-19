var AWS = require("aws-sdk");
var dynamo = new AWS.DynamoDB.DocumentClient();
var tableName = "team-C-Task-internship";

exports.handler = (event, context, callback) => {
    var response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({ message: "" })
    };

    var body = JSON.parse(event.body);

    var param = {
        TableName: tableName,
        Item: {
            userId: body.userId,
            taskName: body.taskName,
            intensity: body.intensity,
            done: body.done,
            week: body.week,
            time: body.time,
            kind: body.kind
        }
    };

    dynamo.put(param, function(err, data) {
        if (err) {
            console.log(err);
            response.statusCode = 500;
            response.body = JSON.stringify({
                message: "予期せぬエラーが発生しました"
            });
            callback(null, response);
            return;
        } else {
            response.body = JSON.stringify(param.Item);
            callback(null, response);
        }
    });
};
