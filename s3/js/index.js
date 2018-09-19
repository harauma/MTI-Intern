var vm = new Vue({
    el: "#app",
    data: {
        tasks: [],
        currentLevel: null,
        currentRate: null,
        currentExp: null
    },
    computed: {
        necessaryTasks: function() {
            return this.tasks.filter(function(target) {
                return target.kind === "necessary";
            });
        },
        optionalTasks: function() {
            return this.tasks.filter(function(target) {
                return target.kind === "optional";
            });
        }
    },
    created: function() {
        if (!localStorage.getItem("token")) {
            location.href = "./login.html";
        }
        // タスクを取りに行く
        fetch(url + "/user/tasks?userId=" + localStorage.getItem("userId"), {
            method: "POST"
        })
            .then(function(response) {
                if (response.status == 200) {
                    return response.json();
                }
                return response.json().then(function(json) {
                    throw new Error(json.message);
                });
            })
            .then(function(json) {
                vm.tasks = json.Items;
            })
            .catch(function(err) {
                console.log(err);
            });
        // ユーザーの現在のレベル，レート，累計取得経験値を登録
        fetch(url + "/user?userId=" + localStorage.getItem('userId'), {
            method: "GET"
        })
            .then(function(response){
                if(response.status == 200){
                    return response.json();
                }
                return response.json().then(function(json){
                    throw new Error(json.message);
                });
            })
            .then(function(json){
                // 現在のレベル，レート，経験値を保存
                // 右辺はこれで動くのか?
                vm.currentLevel = json.level;
                vm.currentRate = json.rate;
                vm.currentExp = json.exp;
            })
            .catch(function(err){
                console.log(err);
            });
    },
    methods: {
        calorie: function(task) {
            console.log(task);
            return (
                Math.round(
                    task.intensity *
                        localStorage.getItem("weight") *
                        (task.time / 60) *
                        1.05
                ) + "kcal"
            );
        },
        sumCalorie: function(tasks) {
            let sum = 0;
            tasks.forEach(task => {
                sum += Math.round(
                    task.intensity *
                        localStorage.getItem("weight") *
                        (task.time / 60) *
                        1.05
                );
            });
            return sum;
        },
        regist: function(task) {
            console.log(task);
            task.done = !task.done;
            fetch(url + "/tasks", {
                method: "PUT",
                headers: new Headers({
                    Authorization: localStorage.getItem("mti-intern")
                }),
                body: JSON.stringify(task)
            })
                .then(function(response) {
                    if (response.status == 200) {
                        return response.json();
                    }
                    return response.json().then(function(json) {
                        throw new Error(json.message);
                    });
                })
                .then(function(json) {});
        },
        // 追加タスクを必須タスクへ移動させるメソッド
        // この関数を呼ぶと，条件を満たす全てのタスクが移動する
        moveOpt2Nec: function(){
            vm.optionalTasks.forEach(function(task){
                // 達成回数が5回未満なら処理を飛ばす
                if(task.week < 5){
                    return;
                }
                fetch(url + "tasks", {
                    method: "PUT",
                    body: JSON.stringify({
                        userId: task.userId,
                        taskName: task.taskName,
                        done: false, // 未実行に設定
                        intensity: task.intensity,
                        kind: "necessary",
                        time: task.time,
                        week: 0 // 0回に初期化
                    })
                })
                    .then(function(response){
                        if(response.statusCode == 200){
                            return response.json();
                        }
                        return response.json().then(function(json){
                            throw new Error(json.message);
                        });
                    })
                    .then(function(json){
                        console.log("[moveOpt2Nec]成功");
                    })
                    .catch(function(err){
                        console.log("[moveOpt2Nec]失敗");
                        console.log(err);
                    });
            });
        },
        // レベルアップの判定 (わりとやっつけな実装)
        // 新たに得た経験値を受け取り，bool値を返す
        CanLevelUp:function(exp){
            let cond = 0;
            for(let i = 1; i <= vm.currentLevel; i++){
                // 別にここは5000と1000である必要はない, とりあえずの数値
                cond += 5000 + (i-1)*1000;
            }
            return exp >= cond;
        },
        // 経験値を加算&レートやレベルのアップデート
        // 引数は消費カロリーの合計値
        calcAndUpdate: function(cal){
            let newExp = vm.currentExp + cal;
            // 条件を満たしていたらインクリメント
            let newLevel = vm.CanLevelUp(cal) ? vm.currentLevel + 1 : vm.currentLevel;
            // レートの計算は未実装
            fetch(url + "/user", {
                // 4-c-team-update-userがデプロイされたパスを指定する
                // ここではとりあえず/userのPUTで決め打ちしてる
                method:"PUT",
                body:JSON.stringify({
                    userId: localStorage.getItem('userId'),
                    level: newLevel,
                    exp: newExp,
                    rate: vm.currentRate
                })
            })
                .then(function(response){
                    if(response.status == 200){
                        return response.json();
                    }
                    return response.json().then(function(json){
                        throw new Error(json.message);
                    });
                })
                .then(function(json){
                    console.log("[calcAndUpdate]更新成功");
                })
                .catch(function(err){
                    console.log("[calcAndUpdate]更新失敗");
                    console.log(err);
                });
        }
    }
});
