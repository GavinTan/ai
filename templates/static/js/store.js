const { breakpointsTailwind, useBreakpoints, useStorage, useDark } = VueUse;

const defaultModels = [
  {
    value: "gpt-3.5-turbo-16k",
    label: "GPT-3.5",
    desc: "GPT最快的模型，适用于大多数日常任务。",
  },
  {
    value: "gpt-4",
    label: "GPT-4",
    desc: "GPT最强大的模型，非常适合需要创造力和高级推理的任务。",
    disabled: false,
  },
  {
    value: "gemini-pro",
    label: "GeMini",
    desc: "来自 Google Gemini 系列的多模式模型，平衡了模型性能和速度。展现出强大的通才能力，尤其擅长跨模态推理，并支持 32k token 的上下文窗口。",
    disabled: false,
  },
];

export const useStore = Pinia.defineStore("main", {
  state: () => ({
    apiUrl: "/ai",
    chatgptApiUrl: "http://127.0.0.1:8000",
    isLoading: true,
    noNewChat: false,
    activeMenu: "",
    selectModelVisible: false,
    modelLabel: "",
    model: defaultModels[0].value,
    models: defaultModels,
    isMobile: useBreakpoints(breakpointsTailwind).smaller("sm"),
    chatData: useStorage("chatData", {}),
    sendMsg: "",
    qIndex: "",
    requesting: false,
    runing: "",
    controller: null,
    chatAutoScroll: true,
    chatContext: false,
    chatNum: 5,
    isDark: useDark(),
    maxTokens: 16000,
    sessionId: "user_session",
    user: {},
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
    delChatData(id) {
      delete this.chatData[id];
    },
    setUserChatData(user) {
      this.chatData = useStorage(`${user}_chatData`, {});
    },
    setDefaultModel() {
      this.model = "";
      this.model = defaultModels[0].value;
    },
    setCursorClass(value) {
      this.qIndex = value;
    },
    setController() {
      this.controller = new AbortController();
    },
  },
});
