import { LayoutComponent } from "./layout.js";
import { ChatComponent } from "./chat.js";
import { AdminComponent } from "./admin.js";
import { useStore } from "./store.js";

const { ref, reactive, toRefs, onUnmounted } = Vue;
const { createRouter, createWebHistory, useRouter } = VueRouter;
const { createDiscreteApi } = naive;
const { message } = createDiscreteApi(["message"]);

const notFoundComponent = {
  setup() {
    return { router };
  },
  template: `
    <div class="flex flex-col justify-center h-full">
        <div class="text-center">
            <img class="m-auto" width="350" src="/static/404.svg" alt="" />
        </div>
        <div class="text-center">
            <h1 class="text-base text-gray-500 p-5">访问出错啦！</h1>
            <n-button @click="router.push('/')" type="info" class="bg-[#2080f0] hover:bg-[#4098fc]">返回主页</n-button>
        </div>
    </div>
    `,
};

const loginComponent = {
  template: "#login",
  setup() {
    const formRef = ref(null);
    const state = reactive({
      autoLogin: false,
      loading: false,
    });
    const account = reactive({
      username: "",
      password: "",
    });

    document.body.style.backgroundColor = "#fff";
    const router = useRouter();

    const loginTheme = {
      Input: {
        heightLarge: "52px",
      },
      Button: {
        colorHoverPrimary: "#10a37f",
      },
    };

    const rules = {
      username: { required: true, message: "请输入账号", trigger: "blur" },
      password: { required: true, message: "请输入密码", trigger: "blur" },
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      formRef.value?.validate(async (errors) => {
        if (!errors) {
          const { username, password } = account;
          state.loading = true;

          try {
            fetch("/login", {
              method: "POST",
              body: JSON.stringify({
                username: username.trim(),
                password: password.trim(),
              }),
            }).then(async (response) => {
              const data = await response.json();

              if (response.ok) {
                message.success(data.message || "登录成功");
                router.replace("/");
              } else {
                message.error(data.message || "登录失败");
              }
            });
          } finally {
            state.loading = false;
          }
        }
      });
    };

    onUnmounted(() => {
      document.body.style.backgroundColor = "";
    });

    return {
      formRef,
      ...toRefs(state),
      account,
      rules,
      loginTheme,
      handleSubmit,
    };
  },
};

const signupComponent = {
  template: "#signup",
  setup() {
    const formRef = ref(null);
    const state = reactive({
      autoLogin: false,
      loading: false,
    });
    const account = reactive({
      username: "",
      password: "",
    });

    document.body.style.backgroundColor = "#fff";
    const router = useRouter();

    const signupTheme = {
      Input: {
        heightLarge: "52px",
      },
      Button: {
        colorHoverPrimary: "#10a37f",
      },
    };

    const rules = {
      username: {
        required: true,
        trigger: "blur",
        validator: (rule, value) => {
          const regex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
          return regex.test(value)
            ? Promise.resolve()
            : Promise.reject("请输入正确的邮箱格式");
        },
      },
      password: { required: true, message: "请输入密码", trigger: "blur" },
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      formRef.value?.validate(async (errors) => {
        if (!errors) {
          const { username, password } = account;
          state.loading = true;

          try {
            fetch("/user", {
              method: "POST",
              body: JSON.stringify({
                username,
                password,
              }),
            }).then(async (response) => {
              const data = await response.json();

              if (response.ok) {
                message.success("注册成功");
                account.username = "";
                account.password = "";
              } else {
                message.error(data.message || "注册失败");
              }
            });
          } finally {
            state.loading = false;
          }
        }
      });
    };

    onUnmounted(() => {
      document.body.style.backgroundColor = "";
    });

    return {
      formRef,
      ...toRefs(state),
      account,
      rules,
      signupTheme,
      handleSubmit,
    };
  },
};

const routes = [
  {
    path: "/",
    component: LayoutComponent,
    meta: { requiresAuth: true },
    children: [
      {
        path: "/c/:id",
        components: {
          chat: ChatComponent,
        },
        name: "chat",
      },
    ],
  },
  { path: "/login", component: loginComponent, name: "login" },
  { path: "/signup", component: signupComponent, name: "signup" },
  { path: "/admin", component: AdminComponent, name: "admin" },
  { path: "/:pathMatch(.*)*", component: notFoundComponent, name: "404" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const userSession = Cookies.get(useStore().sessionId);

  if (userSession && !useStore().user.username) {
    const response = await fetch("/userinfo", { cache: "no-cache" });
    if (response.ok) {
      const data = await response.json();
      useStore().user = data;
      useStore().setUserChatData(data.username);
    } else {
      Cookies.remove(useStore().sessionId);
      next({ name: "login", query: { redirect: to.path } });
    }
  }

  if (to.matched.some((record) => record.meta.requiresAuth) && !userSession) {
    next({ name: "login", query: { redirect: to.path } });
  } else if (from.path === "/login" && to.path === "/signup") {
    next();
  } else if (to.path === "/login" && userSession) {
    next("/");
  } else {
    if (to.path === "/admin" && useStore().user.role != "admin") {
      next("/404");
    } else {
      if (to.path === from.query.redirect) {
        next();
      } else {
        next(from.query.redirect);
      }
    }
  }
});

const indexComponent = {
  template: "<router-view></router-view>",
};

const md = window.markdownit({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          `<pre><div class="flex items-center relative text-gray-200 bg-slate-700 px-4 py-2 text-xs font-sans justify-between rounded-t-md"><span>${lang}</span><button class="flex ml-auto gap-2" onclick="handleCopy(this)"><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1rem" width="1rem" xmlns="http://www.w3.org/2000/svg"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>Copy code</button></div>` +
          '<code class="hljs">' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          "</code></pre>"
        );
      } catch (__) {}
    }

    return (
      '<pre><code class="hljs">' + md.utils.escapeHtml(str) + "</code></pre>"
    );
  },
});

const pinia = Pinia.createPinia();
const app = Vue.createApp(indexComponent);

app.use(router);
app.use(naive);
app.use(pinia);
app.provide("md", md);
app.provide("store", useStore());
app.mount("#app");
