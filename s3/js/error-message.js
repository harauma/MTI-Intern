Vue.component("error-message", {
    props: ["message"],
    template: `
      <div class="ui message" v-if="message">
        <div class="header">
          メッセージ
        </div>
        <p>{{message}}</p>
      </div>
    `
});
