var AWS = require("aws-sdk");
var dynamo = new AWS.DynamoDB.DocumentClient();
var tableName = "team-C-Task-internship";

exports.handler = (event, context, callback) => {
    var response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin" : "*"
        },
        body: JSON.stringify({"message" : ""})
    };

    var body = JSON.parse(event.body);

    var userId = event.queryStringParameters.userId;

    //TODO: query()に渡すparamを宣言
    var param = {
        "TableName" : tableName ,
        //キー、インデックスによる検索の定義
        "KeyConditionExpression" :
            //"userId = :uid",
            "userId = :uid ",
        //検索値のプレースホルダの定義
        "ExpressionAttributeValues" : {
            ":uid": userId
        }
    };
    //dynamo.query()を用いてuserIdとpasswordが一致するデータの検索
    dynamo.query(param, function(err, posts){
        /*if(!event.headers || event.headers.Authorization !== "mti-intern"){
            response.statusCode = 500;
            response.body = JSON.stringify({
                "message": "ログインしてください"
            });
            callback(null, response);
            return;
        }*/
        //userの取得に失敗
        if(err){
            console.log(err);
            response.statusCode = 500;
            response.body = JSON.stringify({"message" : "予期せぬエラーが発生しました"});
            callback(null, response);
            return;
        }
        //TODO: 該当するデータが見つからない場合の処理を記述(ヒント：data.Itemsの中身が空)
        if(posts.Items.length === 0){
            response.statusCode = 401;
            response.body = JSON.stringify({"message": "Not Found"});
            console.log(userId);            
            callback(null, response);
            return;
        }
        //TODO: 認証が成功した場合のレスポンスボディとコールバックを記述
        response.body = JSON.stringify(posts);
        console.log("[search]検索に成功");
        callback(null, response);
    });
};
