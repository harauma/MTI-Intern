var AWS = require("aws-sdk");
var dynamo = new AWS.DynamoDB.DocumentClient();
var tableName = "team-C-User-internship";

exports.handler = (event, context, callback) => {
    var response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin" : "*"
        },
        body: JSON.stringify({"message" : ""})
    };

    var body = JSON.parse(event.body);

    //TODO: paramに更新対象のテーブル名と更新内容を記述
    var param = {
        TableName : tableName,
        Key : {
            "userId" : body.userId,
        },
        updateExpression: "set level = :l, exp = :e",
        ExpressionAttributeValues:{
            ":l": Number(body.level),
            ":e": Number(body.exp)
        },
        ReturnValues:"UPDATED_NEW"
    };
    console.log(param.Key);
    //dynamo.put()を用いてデータの更新k
    dynamo.update(param, function(err, data){
        if(err){
            //TODO: 更新に失敗した場合の処理を記述
            console.log(err);
            response.statusCode = 500;
            response.body = JSON.stringify({
                "message": "予期せぬエラーが発生しました"
            });
            callback(null, response);
            return;
        }else{
            //TODO: 更新に成功した場合の処理を記述
            response.body = JSON.stringify(param.Item);
            callback(null, response);
        }
    });
};
