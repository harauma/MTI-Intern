var vm = new Vue({
    el: "#app",
    data: {
        tasks: []
    },
    computed: {
        NecessaryTasks: function() {
            return this.tasks.filter(function(target) {
                return target.kind === "necessary";
            });
        },
        OptionalTasks: function() {
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

            // divide into "add" and "required"
            // for (var i = 0; i < list.length; i++) {
            //     if (list[i].kind == "add") {
            //         vm.add.add(list[i]);
            //     } else if (list[i].kind == "required") {
            //         vm.required.add(list[i]);
            //     }
            // }
        }
    }
});
