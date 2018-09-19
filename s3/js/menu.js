Vue.component("common-menu", {
    props: ["current"],
    template: `
      <nav class="navbar is-dark">
        <!-- 画像部分あとで変えたい -->
        <div class="navbar-brand">
          <a class="navbar-item" href="https://bulma.io">
            <img src="https://bulma.io/images/bulma-logo.png" alt="Bulma: a modern CSS framework based on Flexbox" width="112"
              height="28">
          </a>
          <div class="navbar-burger burger" data-target="globalNavbar">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <!-- menu START -->
        <div id="globalNavbar" class="navbar-menu">
          <div class="navbar-start">
            <div class="navbar-item">
              <a href="./index.html" v-bind:class="{'is-active': current==='home'}">Home</a>
            </div>
          </div>

          <div class="navbar-end">
            <div class="navbar-item is-hidden-mobile is-guest">
              <div class="right menu" v-if="loginStatus">
                <button class="button thickbox is-primary is-uppercase" v-on:click="logout" rel="iframe=true;innerHeight=640;innerWidth=800" target="_self">Logout</button>
              </div>
              <div class="right menu" v-else>
                <button class="button thickbox is-primary is-uppercase" v-on:click="login" rel="iframe=true;innerHeight=640;innerWidth=800" target="_self">Login</button>
              </div>
            </div>
          </div>
        </div>
        <!-- menu END -->
      </nav>
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
            localStorage.removeItem("weight");
            location.href = "./login.html";
        },
        login: function() {
            location.href = "./login.html";
        }
    }
});
