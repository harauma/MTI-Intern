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
                console.log(this.user);
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
        toggle: function(task) {
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
                .then(function(json) {});
        }
    }
});
