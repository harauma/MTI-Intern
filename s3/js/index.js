var vm = new Vue({
    el: "#app",
    data: {
        // サンプルタスク
        tasks: []
    },
    computed: {
        NecessaryTasks: function(){
            return this.tasks.filter(function(target){
                return target.kind === "necessary";
            });
        },
        OptionalTasks: function(){
            return this.tasks.filter(function(target){
                return target.kind === "optional";
            });
        }
    },
    created: function() {
        if (!localStorage.getItem("token")) {
            location.href = "./login.html";
        }
        // タスクを取りに行く
        fetch(url + "/user/tasks?userId=" + localStorage.getItem('userId'), {
            method: "POST"
        })
            .then(function(response) {
                if(response.status == 200){
                    return response.json();
                }
                return response.json().then(function(json){
                    throw new Error(json.message);
                });
            })
            .then(function(json){
                console.log(json);
                vm.tasks = json.Items;
            })
            .catch(function(err){
                console.log(err);
            });
    },
    methods: {}
});
