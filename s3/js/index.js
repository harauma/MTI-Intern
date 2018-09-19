var vm = new Vue({
    el: "#app",
    data: {
        user: {
            userId: null,
            weight: null,
            level: null,
            exp: null
        },
        tasks: []
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
        // ユーザー情報を取得する
        fetch(url + "/user?userId=" + localStorage.getItem("userId"), {
            method: "GET",
            headers: new Headers({
                Authorization: localStorage.getItem("token")
            })
        })
            .then(function(response) {
                if (response.status == 200) {
                    return response.json();
                }
                return response.json().then(function(json) {
                    throw new Error(json.message);
                });
            })
            .then(json => {
                this.user = json;
            })
            .catch(function(err) {
                console.log(err);
            });
        // タスクを取りに行く
        fetch(url + "/tasks?userId=" + localStorage.getItem("userId"), {
            method: "GET",
            headers: new Headers({
                Authorization: localStorage.getItem("token")
            })
        })
            .then(function(response) {
                if (response.status == 200) {
                    return response.json();
                }
                return response.json().then(function(json) {
                    throw new Error(json.message);
                });
            })
            .then(json => {
                this.tasks = json;
            })
            .catch(function(err) {
                console.log(err);
            });
    },
    methods: {
        calorie: function(task) {
            return Math.round(
                task.intensity *
                    localStorage.getItem("weight") *
                    (task.time / 60) *
                    1.05
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
        toggle: function(task, calorie) {
            task.done = !task.done;
            fetch(url + "/tasks/toggle", {
                method: "PUT",
                headers: new Headers({
                    Authorization: localStorage.getItem("token")
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
                .then(json => {
                    this.updateUserExp(task, calorie);
                });
        },
        updateUserExp: function(task, calorie) {
            let exp = 0;
            let level = 0;
            if (task.done == true) {
                exp = this.user.exp + calorie;
            } else {
                exp = this.user.exp - calorie;
            }
            level = Math.round(exp / 300) + 1;
            fetch(url + "/user/exp", {
                method: "PUT",
                headers: new Headers({
                    Authorization: localStorage.getItem("token")
                }),
                body: JSON.stringify({
                    userId: localStorage.getItem("userId"),
                    exp: exp,
                    level: level
                })
            })
                .then(function(response) {
                    if (response.status == 200) {
                        vm.user.exp = exp;
                        vm.user.level = level;
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
        moveOpt2Nec: function() {
            vm.optionalTasks.forEach(function(task) {
                // 達成回数が5回未満なら処理を飛ばす
                if (task.week < 5) {
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
                    .then(function(response) {
                        if (response.statusCode == 200) {
                            return response.json();
                        }
                        return response.json().then(function(json) {
                            throw new Error(json.message);
                        });
                    })
                    .then(function(json) {
                        console.log("[moveOpt2Nec]成功");
                    })
                    .catch(function(err) {
                        console.log("[moveOpt2Nec]失敗");
                        console.log(err);
                    });
            });
        },
        // レベルアップの判定 (わりとやっつけな実装)
        // 新たに得た経験値を受け取り，bool値を返す
        CanLevelUp: function(exp) {
            let cond = 0;
            for (let i = 1; i <= vm.currentLevel; i++) {
                // 別にここは5000と1000である必要はない, とりあえずの数値
                cond += 5000 + (i - 1) * 1000;
            }
            return exp >= cond;
        },
        // レートの計算 (これもやっつけ実装)
        calcRate: function(tasks) {
            let sum = 0; //一週間あたりの総消費カロリー
            tasks.forEach(task => {
                sum += Math.round(
                    task.intensity *
                        localStorage.getItem("weight") *
                        (task.time / 60) *
                        1.05 *
                        task.week // sumCalorieと違うのはここ
                );
            });
            return sum / 7.0; //平均値をレートとして返す
        },
        // 経験値を加算&レートやレベルのアップデート
        // 引数は消費カロリーの合計値
        calcAndUpdate: function(cal) {
            let newExp = vm.currentExp + cal;
            // 条件を満たしていたらインクリメント
            let newLevel = vm.CanLevelUp(newExp)
                ? vm.currentLevel + 1
                : vm.currentLevel;
            // レートの計算は未実装
            fetch(url + "/user", {
                // 4-c-team-update-userがデプロイされたパスを指定する
                // ここではとりあえず/userのPUTで決め打ちしてる
                method: "PUT",
                body: JSON.stringify({
                    userId: localStorage.getItem("userId"),
                    level: newLevel,
                    exp: newExp,
                    rate: vm.currentRate
                })
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
                    console.log("[calcAndUpdate]更新成功");
                })
                .catch(function(err) {
                    console.log("[calcAndUpdate]更新失敗");
                    console.log(err);
                });
        }
    }
});
