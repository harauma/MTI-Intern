var vm = new Vue({
    el: "#app", // Vue.jsを使うタグのIDを指定
    data: {
        // テスト用
        /*users:[
            {
                userId: "sample1",
                weight: 72,
                level: 10,
                rate: 1000
            },
            {
                userId: "sample2",
                weight: 69,
                level: 11,
                rate: 980
            },
            {
                userId: "sample3",
                weight: 80,
                level: 9,
                rate: 1200
            }
        ]*/
        users:[]
    },
    computed: {
        sortedUsers: function(){
            // レート順にソート
            return this.users.sort(function(a, b){
                if(a.rate >= b.rate){
                    return -1;
                }else{
                    return 1;
                }
            });
        }
    },
    created: function() {
        // ユーザーを全件取得, とりあえずAPIは/userのGETと決め打ち(デプロイしてない)
        // APIの内容は'lambda/4-c-team-users-get-internship'を参照
        fetch(url + "/user", {
            method: "GET"
        })
            .then(function(response){
                if(response.status == 200) {
                    return response.json();
                }
                return response.json().then(function(json){
                    throw new Error(json.message);
                });
            })
            .then(function(json){
                vm.users = json.Items;
            })
            .catch(function(err){
                console.log(err);
            });
    },
    methods: {
        // Vue.jsで使う関数はここで記述する
    }
});
