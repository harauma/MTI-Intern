var vm = new Vue({
    el: "#app",
    data: {
        // サンプルタスク
        tasks: [
            {
                userId: "oguri_d",
                taskName: "サンプルタスク1",
                done: false,
                week: 0,
                time: 30,
                kind: "required"
            },
            {
                userId: "oguri_d",
                taskName: "サンプルタスク2",
                done: false,
                week: 0,
                time: 30,
                kind: "required"
            },
            {
                userId: "oguri_d",
                taskName: "サンプルタスク3",
                done: false,
                week: 0,
                time: 30,
                kind: "add"
            },
            {
                userId: "oguri_d",
                taskName: "サンプルタスク4",
                done: false,
                week: 0,
                time: 30,
                kind: "add"
            }
        ]
    },
    computed: {},
    created: function() {
        if (!localStorage.getItem("token")) {
            location.href = "./login.html";
        }
        // タスクを取りに行く
        // fetch(url + "/tasks", {
        //     method: "GET"
        // })
        //     .then(function(response) {
        //         if (response.status == 200) {
        //             return response.json();
        //         }
        //         return response.json().then(function(json) {
        //             throw new Error(json.message);
        //         });
        //     })
        //     .then(json => {
        //         this.tasks = json.tasks;
        //     })
        //     .catch(function(err) {
        //         // @TODO タスク取得エラー処理
        //     });
    },
    methods: {}
});
