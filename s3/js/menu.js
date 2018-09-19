Vue.component("common-menu", {
    props: ["current"],
    template: `
      <section class="hero is-dark is-shadowless is-medium">
			<div class="hero-head">
				<div class="container">
					<nav class="navbar inverttooltips navbartooltips is-dark">
						<!--			画像部分あとで変えたい			-->
						<div class="navbar-brand">
							<a href="https://mod.io" class="navbar-item navbar-logo" style="margin-right: auto;">
								<img src="https://static.mod.io/v1/images/default/logo.svg" alt="mod.io">
							</a>
							<a href="https://mod.io/members/login/widget" class="navbar-item thickbox is-hidden-tablet is-paddingless" rel="iframe=true;innerHeight=640;innerWidth=800" target="_self">Login</a>
							<div class="navbar-burger burger" style="margin-left: 0;">
								<span></span>
								<span></span>
								<span></span>
							</div>
						</div>

						<!--		menu START				-->
						<div class="navbar-menu">
							<div class="navbar-start">
								<a class="navbar-item" href="./index.html" v-bind:class="{active: current==='home'}">Home</a>
							</div>
							<div class="navbar-end">
								<a href="https://mod.io/members/login/widget" class="navbar-item thickbox is-guest is-hidden-tablet" rel="iframe=true;innerHeight=640;innerWidth=800" target="_self">Login</a>
								
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
						<!--			menu END			-->
					</nav>
				</div>
			</div>
		</section>
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
