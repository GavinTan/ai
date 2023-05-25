const { breakpointsTailwind, useBreakpoints, useStorage, useDark } = VueUse;


export const useStore = Pinia.defineStore('main', {
    state: () => ({
        apiUrl: '/ai',
        isLoading: true,
        noNewChat: false,
        activeMenu: '',
        selectModelVisible: false,
        modelLabel: '',
        model: 'gpt-3.5-turbo',
        models: [
            { value: 'gpt-3.5-turbo', label: 'Default (GPT-3.5)' },
            { value: 'gpt-4', label: 'GPT-4' }
        ],
        isMobile: useBreakpoints(breakpointsTailwind).smaller('sm'),
        chatData: useStorage('chatData', {}),
        cid: '',
        sendMsg: '',
        qIndex: '',
        requesting: false,
        runing: '',
        controller: null,
        chatAutoScroll: true,
        chatNum: 5,
        isDark: useDark()

    }),
    actions: {
        updateIsLoading(value) {
            this.isLoading = value;
        },
        updateNoNewChat(value) {
            this.noNewChat = value;
        },
        updateActiveMenu(value) {
            this.activeMenu = value;
        },
        updateSelectModelVisible(value) {
            this.selectModelVisible = value;
        },
        updateModel(value) {
            this.model = value;
        },
        updateChatData(value) {
            this.chatData = useStorage('chatData', value);
        },
        updateCid(value) {
            this.cid = value;
        },
        delChatData(id) {
            delete this.chatData[id];
        },
        setDefaultModel() {
            this.model = '';
            this.model = 'gpt-3.5-turbo';
        },
        setCursorClass(value) {
            this.qIndex = value;
        },
        setController() {
            this.controller = new AbortController();
        }
    }
});
