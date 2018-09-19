Vue.component("common-menu", {
    props: ["current"],
    template: `
      <div class="ui uisecondary green inverted massive menu">
        <a class="item" href="./index.html" v-bind:class="{active: current==='home'}">Home</a>
        <div class="right menu" v-if="loginStatus">
          <button class="item" v-on:click="logout">Logout</button>
        </div>
        <div class="right menu" v-else>
          <button class="item" v-on:click="login">Login</button>
        </div>
      </div>
    `,
    computed: {
        loginStatus: function() {
            return localStorage.getItem("token");
        }
    },
    methods: {
        logout: function() {
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            location.href = "./login.html";
        },
        login: function() {
            location.href = "./login.html";
        }
    }
});
