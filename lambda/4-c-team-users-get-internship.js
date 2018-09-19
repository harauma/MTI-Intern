/*********************************/
/*     ユーザー情報を全件取得        */
/*********************************/

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

    if (!event.headers || event.headers.Authorization !== "mti-internship") {
        response.statusCode = 401;
        response.body = JSON.stringify({ message: "ログインが必要です" });
        callback(null, response);
        return;
    }
    
    var param = {
        "TableName": tableName
    };

    dynamo.scan(param, function(err, data){
        if(err){
            response.statusCode = 500;
            response.body = JSON.stringify({
                "message": "予期せぬエラー"
            });
            callback(null, response);
            return;
        }

        if(data.Items){
            data.Items.forEach(function(val){
                delete val.password;
            });
        }
        response.body = JSON.stringify({data});
        callback(null, response);
    });
};
