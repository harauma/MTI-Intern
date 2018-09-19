var vm = new Vue({
    el: "#app",
    data: {
        mode: "login",
        submitText: "ログイン",
        toggleText: "新規登録",
        user: {
            userId: null,
            password: null,
            weight: 0,
            userInfo: {
                walking: 0,
                train: 0,
                bicycle: 0,
                deskWork: 0
            }
        }
    },
    computed: {},
    created: function() {},
    methods: {
        toggleMode: function() {
            if (this.mode === "login") {
                this.mode = "signup";
                this.submitText = "新規登録";
                this.toggleText = "ログイン";
            } else if (this.mode === "signup") {
                this.mode = "login";
                this.submitText = "ログイン";
                this.toggleText = "新規登録";
            }
        },
        submit: function() {
            if (this.mode === "login") {
                // ログイン処理
                fetch(url + "/user/login", {
                    method: "POST",
                    body: JSON.stringify({
                        userId: this.user.userId,
                        password: this.user.password
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
                        console.log(json);
                        var content = JSON.stringify(json, null, 2);
                        console.log(content);
                        // トークンをセット
                        localStorage.setItem("token", json.token);
                        localStorage.setItem("userId", json.userId);
                        localStorage.setItem("weight", json.weight);
                        location.href = "./index.html";
                    })
                    .catch(function(err) {
                        // @TODO ログイン失敗時のエラー処理
                    });
            } else if (this.mode === "signup") {
                // 新規登録処理
                fetch(url + "/user/signup", {
                    method: "POST",
                    body: JSON.stringify({
                        userId: this.user.userId,
                        password: this.user.password,
                        weight: Number(this.user.weight),
                        userInfo: {
                            walking: Number(this.user.userInfo.walking),
                            train: Number(this.user.userInfo.train),
                            bicycle: Number(this.user.userInfo.bicycle),
                            deskWork: Number(this.user.userInfo.deskWork)
                        }
                    })
                })
                    .then(function(response) {
                        if (response.status == 200) {
                            return response.json();
                        }
                        return response.json().then(function(json) {
                            vm.errorMessage = json.message;
                            throw new Error(json.message);
                        });
                    })
                    .then(json => {
                        var content = JSON.stringify(json, null, 2);
                        console.log(content);
                        // 入力をリセット
                        this.user.userId = null;
                        this.user.password = null;
                        this.user.weight = null;
                        this.user.userInfo.walking = null;
                        this.user.userInfo.train = null;
                        this.user.userInfo.bicycle = null;
                        this.user.userInfo.deskWork = null;
                    })
                    .catch(function(err) {
                        // @TODO 新規作成失敗のエラー処理
                    });
            }
        }
    }
});
