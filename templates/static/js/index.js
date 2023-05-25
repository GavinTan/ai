import { LayoutComponent } from './layout.js';
import { ChatComponent } from './chat.js';
import { useStore } from './store.js';


const { createRouter, createWebHistory } = VueRouter;

const notFoundComponent = {
    template: `
    <n-result status="404" title="404" description="访问出错啦！">
        <template #footer>
            <n-button>
                <router-link to="/">返回主页</router-link>
            </n-button>
        </template>
    </n-result>
    `
}

const routes = [
    {
        path: '/',
        component: LayoutComponent,
        children: [
            {
                path: '/c/:id',
                components: {
                    chat: ChatComponent
                },
                name: 'chat'
            },
        ]
    },

    { path: '/:pathMatch(.*)*', component: notFoundComponent, name: '404'}
]

const router = createRouter({
    history: createWebHistory(),
    routes,
});

const indexComponent = {
    template: '<router-view></router-view>',
};

const md = window.markdownit({
    html: true,
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return `<pre><div class="flex items-center relative text-gray-200 bg-gray-800 px-4 py-2 text-xs font-sans justify-between rounded-t-md"><span>${lang}</span><button class="flex ml-auto gap-2" onclick="handleCopy(this)"><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1rem" width="1rem" xmlns="http://www.w3.org/2000/svg"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>Copy code</button></div>` +
                    '<code class="hljs">' +
                    hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                    '</code></pre>';
            } catch (__) { }
        }

        return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>';
    }
});

const pinia = Pinia.createPinia();
const app = Vue.createApp(indexComponent);

app.use(router)
app.use(naive)
app.use(pinia)
app.provide('md', md);
app.provide('store', useStore());
app.mount("#app");