var vm = new Vue({
    el: "#app",
    data: {
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
        }
    }
});
