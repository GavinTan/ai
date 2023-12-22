const {
  reactive,
  ref,
  toRefs,
  inject,
  computed,
  watch,
  onUnmounted,
  h,
  nextTick,
  provide,
  onMounted,
  Fragment,
} = Vue;
const { useRouter, useRoute } = VueRouter;
const { darkTheme, createDiscreteApi, NDivider, NPopconfirm, NText, NButton } =
  naive;
const { message, notification, dialog, loadingBar } = createDiscreteApi([
  "message",
  "dialog",
  "notification",
  "loadingBar",
]);

const ModelComponent = {
  props: ["content"],
  template: `
    <div class="flex w-full items-center justify-center gap-1 border-b border-black/10 bg-gray-50 p-3 text-gray-500 dark:border-gray-900/50 dark:bg-gray-700 dark:text-gray-300">
        Model: {{ content }}
    </div>
    `,
};

const QuestionComponent = {
  props: ["content"],
  template: `
    <div class="group w-full text-gray-800 dark:text-gray-100 border-b border-black/10 dark:border-gray-900/50 dark:bg-gray-800">
        <div class="text-base gap-4 md:gap-6 md:max-w-2xl lg:max-w-xl xl:max-w-3xl p-4 md:py-6 flex lg:px-0 m-auto">
            <div class="w-[30px] flex flex-col relative items-end">
            <div class="relative h-[30px] w-[30px] p-1 rounded-sm text-white flex items-center justify-center" style="background-color: green;">
                <svg xmlns="http://www.w3.org/2000/svg" width="41" height="41" viewBox="0 96 960 960">
                    <path d="M353.775 673Q331 673 315.5 657.275q-15.5-15.726-15.5-38.5Q300 596 315.725 580.5q15.726-15.5 38.5-15.5Q377 565 392.5 580.725q15.5 15.726 15.5 38.5Q408 642 392.275 657.5q-15.726 15.5-38.5 15.5Zm253 0Q584 673 568.5 657.275q-15.5-15.726-15.5-38.5Q553 596 568.725 580.5q15.726-15.5 38.5-15.5Q630 565 645.5 580.725q15.5 15.726 15.5 38.5Q661 642 645.275 657.5q-15.726 15.5-38.5 15.5ZM480 916q142.375 0 241.188-98.948Q820 718.105 820 575.535 820 550 816 525q-4-25-10-46-20 5-43.262 7-23.261 2-48.738 2-97.115 0-183.557-40Q444 408 383 334q-34 81-97.5 141.5T140 569v7q0 142.375 98.812 241.188Q337.625 916 480 916Zm0 60q-83 0-156-31.5T197 859q-54-54-85.5-127T80 576q0-83 31.5-156T197 293q54-54 127-85.5T480 176q83 0 156 31.5T763 293q54 54 85.5 127T880 576q0 83-31.5 156T763 859q-54 54-127 85.5T480 976Zm-92-727q88 103 162.5 141T714 428q24 0 38-1t31-6q-45-81-122.5-133T480 236q-27 0-51 4t-41 9ZM149 498q48-18 109.5-81.5T346 263q-87 39-131.5 99.5T149 498Zm239-249Zm-42 14Z"/>
                </svg>
                </div>
            </div>
            <div class="relative flex w-[calc(100%-50px)] flex-col gap-1 md:gap-3 lg:w-[calc(100%-115px)]">
                {{ content }}
            </div>
        </div>
    </div>
    `,
};

const ReplyComponent = {
  props: ["content"],
  template: `
    <div class="group w-full text-gray-800 dark:text-gray-100 border-b border-black/10 dark:border-gray-900/50 bg-gray-50 dark:bg-[#444654]">
        <div class="text-base gap-4 md:gap-6 md:max-w-2xl lg:max-w-xl xl:max-w-3xl p-4 md:py-6 flex lg:px-0 m-auto">
            <div class="w-[30px] flex flex-col relative items-end">
            <div class="relative h-[30px] w-[30px] p-1 rounded-sm text-white flex items-center justify-center" style="background-color: black;">
                <svg width="41" height="41" viewBox="0 0 41 41" fill="none"
                    xmlns="http://www.w3.org/2000/svg" stroke-width="1.5">
                    <path
                        d="M37.5324 16.8707C37.9808 15.5241 38.1363 14.0974 37.9886 12.6859C37.8409 11.2744 37.3934 9.91076 36.676 8.68622C35.6126 6.83404 33.9882 5.3676 32.0373 4.4985C30.0864 3.62941 27.9098 3.40259 25.8215 3.85078C24.8796 2.7893 23.7219 1.94125 22.4257 1.36341C21.1295 0.785575 19.7249 0.491269 18.3058 0.500197C16.1708 0.495044 14.0893 1.16803 12.3614 2.42214C10.6335 3.67624 9.34853 5.44666 8.6917 7.47815C7.30085 7.76286 5.98686 8.3414 4.8377 9.17505C3.68854 10.0087 2.73073 11.0782 2.02839 12.312C0.956464 14.1591 0.498905 16.2988 0.721698 18.4228C0.944492 20.5467 1.83612 22.5449 3.268 24.1293C2.81966 25.4759 2.66413 26.9026 2.81182 28.3141C2.95951 29.7256 3.40701 31.0892 4.12437 32.3138C5.18791 34.1659 6.8123 35.6322 8.76321 36.5013C10.7141 37.3704 12.8907 37.5973 14.9789 37.1492C15.9208 38.2107 17.0786 39.0587 18.3747 39.6366C19.6709 40.2144 21.0755 40.5087 22.4946 40.4998C24.6307 40.5054 26.7133 39.8321 28.4418 38.5772C30.1704 37.3223 31.4556 35.5506 32.1119 33.5179C33.5027 33.2332 34.8167 32.6547 35.9659 31.821C37.115 30.9874 38.0728 29.9178 38.7752 28.684C39.8458 26.8371 40.3023 24.6979 40.0789 22.5748C39.8556 20.4517 38.9639 18.4544 37.5324 16.8707ZM22.4978 37.8849C20.7443 37.8874 19.0459 37.2733 17.6994 36.1501C17.7601 36.117 17.8666 36.0586 17.936 36.0161L25.9004 31.4156C26.1003 31.3019 26.2663 31.137 26.3813 30.9378C26.4964 30.7386 26.5563 30.5124 26.5549 30.2825V19.0542L29.9213 20.998C29.9389 21.0068 29.9541 21.0198 29.9656 21.0359C29.977 21.052 29.9842 21.0707 29.9867 21.0902V30.3889C29.9842 32.375 29.1946 34.2791 27.7909 35.6841C26.3872 37.0892 24.4838 37.8806 22.4978 37.8849ZM6.39227 31.0064C5.51397 29.4888 5.19742 27.7107 5.49804 25.9832C5.55718 26.0187 5.66048 26.0818 5.73461 26.1244L13.699 30.7248C13.8975 30.8408 14.1233 30.902 14.3532 30.902C14.583 30.902 14.8088 30.8408 15.0073 30.7248L24.731 25.1103V28.9979C24.7321 29.0177 24.7283 29.0376 24.7199 29.0556C24.7115 29.0736 24.6988 29.0893 24.6829 29.1012L16.6317 33.7497C14.9096 34.7416 12.8643 35.0097 10.9447 34.4954C9.02506 33.9811 7.38785 32.7263 6.39227 31.0064ZM4.29707 13.6194C5.17156 12.0998 6.55279 10.9364 8.19885 10.3327C8.19885 10.4013 8.19491 10.5228 8.19491 10.6071V19.808C8.19351 20.0378 8.25334 20.2638 8.36823 20.4629C8.48312 20.6619 8.64893 20.8267 8.84863 20.9404L18.5723 26.5542L15.206 28.4979C15.1894 28.5089 15.1703 28.5155 15.1505 28.5173C15.1307 28.5191 15.1107 28.516 15.0924 28.5082L7.04046 23.8557C5.32135 22.8601 4.06716 21.2235 3.55289 19.3046C3.03862 17.3858 3.30624 15.3413 4.29707 13.6194ZM31.955 20.0556L22.2312 14.4411L25.5976 12.4981C25.6142 12.4872 25.6333 12.4805 25.6531 12.4787C25.6729 12.4769 25.6928 12.4801 25.7111 12.4879L33.7631 17.1364C34.9967 17.849 36.0017 18.8982 36.6606 20.1613C37.3194 21.4244 37.6047 22.849 37.4832 24.2684C37.3617 25.6878 36.8382 27.0432 35.9743 28.1759C35.1103 29.3086 33.9415 30.1717 32.6047 30.6641C32.6047 30.5947 32.6047 30.4733 32.6047 30.3889V21.188C32.6066 20.9586 32.5474 20.7328 32.4332 20.5338C32.319 20.3348 32.154 20.1698 31.955 20.0556ZM35.3055 15.0128C35.2464 14.9765 35.1431 14.9142 35.069 14.8717L27.1045 10.2712C26.906 10.1554 26.6803 10.0943 26.4504 10.0943C26.2206 10.0943 25.9948 10.1554 25.7963 10.2712L16.0726 15.8858V11.9982C16.0715 11.9783 16.0753 11.9585 16.0837 11.9405C16.0921 11.9225 16.1048 11.9068 16.1207 11.8949L24.1719 7.25025C25.4053 6.53903 26.8158 6.19376 28.2383 6.25482C29.6608 6.31589 31.0364 6.78077 32.2044 7.59508C33.3723 8.40939 34.2842 9.53945 34.8334 10.8531C35.3826 12.1667 35.5464 13.6095 35.3055 15.0128ZM14.2424 21.9419L10.8752 19.9981C10.8576 19.9893 10.8423 19.9763 10.8309 19.9602C10.8195 19.9441 10.8122 19.9254 10.8098 19.9058V10.6071C10.8107 9.18295 11.2173 7.78848 11.9819 6.58696C12.7466 5.38544 13.8377 4.42659 15.1275 3.82264C16.4173 3.21869 17.8524 2.99464 19.2649 3.1767C20.6775 3.35876 22.0089 3.93941 23.1034 4.85067C23.0427 4.88379 22.937 4.94215 22.8668 4.98473L14.9024 9.58517C14.7025 9.69878 14.5366 9.86356 14.4215 10.0626C14.3065 10.2616 14.2466 10.4877 14.2479 10.7175L14.2424 21.9419ZM16.071 17.9991L20.4018 15.4978L24.7325 17.9975V22.9985L20.4018 25.4983L16.071 22.9985V17.9991Z"
                        fill="currentColor"></path>
                </svg>
                </div>
            </div>
            <div class="relative flex w-[calc(100%-50px)] flex-col gap-1 md:gap-3 lg:w-[calc(100%-115px)]">
                <div class="markdown" v-html="content">
                </div>
            </div>
        </div>
    </div>
    `,
};

export const LayoutComponent = {
  template: "#layout",
  delimiters: ["{%", "%}"],
  components: {
    ModelComponent,
    QuestionComponent,
    ReplyComponent,
  },
  setup() {
    const switchModelRef = ref(null);
    const state = reactive({
      chatMenuList: [],
      promptList: [],
      theme: null,
      collapsed: false,
      promptOptions: computed(() => {
        return state.promptList.map((i) => ({ label: i.prompt, value: i.act }));
      }),
      getShow: (val) => val === "/",
      showPopover: false,
      showMenuListSelect: false,
      cid: null,
      menuList: [
        {
          render: () =>
            h("a", {
              class:
                "flex p-3 items-center gap-3 transition-colors duration-200 text-white cursor-pointer text-sm hover:bg-gray-700",
              onClick: () => {
                const deleteAllWarning = dialog.warning({
                  title: "警告",
                  content: "确认清除所有对话历史记录吗？",
                  positiveText: "确定删除",
                  negativeText: "取消",
                  closable: false,
                  autoFocus: false,
                  class: "bg-white dark:bg-gray-900 dark:text-white",
                  action: () =>
                    h("div", { class: "flex gap-3" }, [
                      h(
                        NButton,
                        {
                          class: "btn-neutral",
                          bordered: false,
                          onClick: () => deleteAllWarning.destroy(),
                        },
                        { default: () => "取消" }
                      ),
                      h(
                        NButton,
                        {
                          class:
                            "!bg-[rgba(16,163,127,1)] hover:!bg-[rgba(26,127,100,1)] text-white focus:shadow-neutral",
                          type: "success",
                          bordered: false,
                          onClick: () => {
                            store.chatData = {};
                            state.showMenuListSelect = false;
                            newView();
                            deleteAllWarning.destroy();
                          },
                        },
                        { default: () => "确认删除" }
                      ),
                    ]),
                });
              },
              innerHTML:
                '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>Clear conversations',
            }),
        },
        {
          render: () =>
            h("a", {
              class:
                "flex p-3 items-center gap-3 transition-colors duration-200 text-white cursor-pointer text-sm hover:bg-gray-700",
              href: "https://github.com/gavintan/ai",
              target: "_blank",
              innerHTML:
                '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>Help &amp; FAQ',
            }),
        },
        {
          render: () => h(NDivider, { style: "margin: 4px 0px" }),
        },
        {
          render: () =>
            h("a", {
              class:
                "flex p-3 items-center gap-3 transition-colors duration-200 text-white cursor-pointer text-sm hover:bg-gray-700",
              onClick: () => {
                store.user = {};
                fetch("/logout");
                Cookies.remove(store.sessionId);
                switchModelObserver?.disconnect();
                router.replace({
                  name: "login",
                  query: { redirect: route.path },
                });
              },
              innerHTML:
                '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>Log out',
            }),
        },
      ],
    });

    const switchModel = reactive({
      width: "auto",
      x: 0,
      y: 0,
      hover: "",
    });

    const switchModelObserver = new ResizeObserver(() => {
      switchModel.width = switchModelRef.value.getBoundingClientRect().width;
      switchModel.x = switchModelRef.value.getBoundingClientRect().x;
      switchModel.y = store.isMobile
        ? switchModelRef.value.getBoundingClientRect().y + 55
        : switchModelRef.value.getBoundingClientRect().y + 50;
    });

    const router = useRouter();
    const route = useRoute();
    const store = inject("store");

    let clidHandleSendMsg = null;
    let clidFetchData = null;
    provide("setHandleSendMsg", (func) => (clidHandleSendMsg = func));
    provide("setFetchData", (func) => (clidFetchData = func));

    const delay = (ms) => {
      return new Promise((resolve) => setTimeout(resolve, ms));
    };

    const inputTheme = {
      Input: {
        borderHover: "none",
        borderFocus: "none",
        border: "none",
        fontSizeMedium: "auto",
        boxShadowFocus: "none",
        caretColor: "none",
        heightMedium: "100%",
        textColor: "none",
        paddingMedium: "0px",
        colorFocus: "none",
      },
    };

    const globalTheme = {
      Menu: {
        itemColorHover: "none",
        itemColorActiveHover: "none",
        itemColorActive: "none",
        itemColorCollapsed: "none",
      },
      InternalSelectMenu: {
        optionTextColor: "",
      },
      Popover: {
        boxShadow: "",
      },
    };

    const popselectTheme = {
      Popover: {
        color: "rgba(5,5,9)",
        spaceArrow: "8px",
      },
    };

    const buttonTheme = {
      Button: {
        border: "",
        borderHover: "",
        borderPressed: "",
        borderFocus: "",
        textColorHover: "",
        textColorPressed: "",
        textColorFocus: "",
        rippleColor: "",
      },
    };

    const fetchPromptData = async () => {
      const response = await fetch("/static/prompts-zh.json");
      state.promptList = await response.json();
    };

    const handleUpdateCollapsed = () => {
      state.collapsed = !state.collapsed;
    };

    const getMobileClass = computed(() => {
      if (store.isMobile) {
        return {
          position: "fixed",
          zIndex: 50,
        };
      }
      return {};
    });

    const getContainerClass = computed(() => {
      return [
        "h-full",
        "z-40",
        { "pl-[260px]": !store.isMobile && !state.collapsed },
      ];
    });

    const renderLabel = (option) => {
      return [option.value];
    };

    const newView = () => {
      store.setDefaultModel();
      router.push({ path: "/" });
      state.isNewChat = true;

      const masking = document.querySelector(".masking");
      if (masking) {
        masking.style.display = "";
      }
    };

    const handleSendMsg = async () => {
      if (store.sendMsg && !store.requesting) {
        if (!route.params.id) {
          state.cid = uuidv4();
          store.chatData[state.cid] = { chatList: [], model: store.model };
          await router.push({ name: "chat", params: { id: state.cid } });
        }

        clidHandleSendMsg();
      }
    };

    const handleStop = () => {
      store.controller.abort();
      store.runing = 0;
      store.requesting = false;
      store.setCursorClass("");
    };

    const handleRegen = () => {
      store.runing = -1;
      store.chatData[route.params.id].chatList[
        store.chatData[route.params.id].chatList.length - 1
      ].content = "";
      clidFetchData();
    };

    const onScrollToTop = () => {
      const scrollRef = document.querySelector("#chatContainer");
      if (scrollRef) nextTick(() => (scrollRef.scrollTop = 0));
    };

    const handleShiftEnter = (e) => {
      e.preventDefault();
      store.sendMsg += "\n";
    };

    const showPayModal = () => {
      dialog.info({
        title: "打赏",
        autoFocus: false,
        showIcon: false,
        content: () =>
          h(Fragment, [
            h("img", { class: "h-80 m-auto", src: "/static/pay.png" }),
            h(
              NText,
              { class: "block text-center mt-5", type: "info" },
              {
                default: () =>
                  "如果你觉得该网站对你有帮助，请作者喝一杯咖啡给予支持。（请在付款备注带上账号）",
              }
            ),
          ]),
      });
    };

    const handleSwitchModel = (model) => {
      if (model !== "gpt-4") {
        store.model = model;
      }
    };

    fetchPromptData();

    watch(
      () => store.isMobile,
      (val) => {
        state.collapsed = val;
      },
      { immediate: true, flush: "post" }
    );

    watch(
      () => store.chatData,
      (newVal, oldVal) => {
        state.chatMenuList = [];

        Object.entries(newVal)
          .reverse()
          .forEach(async (i, index) => {
            const menu = {
              label: () =>
                h(
                  "a",
                  {
                    class:
                      "!text-white flex items-center cursor-pointer break-all hover:pr-2 group",
                    onClick: (e) => {
                      router.push({ name: "chat", params: { id: i[0] } });
                    },
                    "data-projection-id": i[0],
                  },
                  {
                    default: () => [
                      h(
                        "div",
                        {
                          class: "flex-1 overflow-hidden break-all relative",
                        },
                        [
                          i[1]["chatList"][0]?.content,
                          h("div", {
                            class:
                              "absolute inset-y-0 right-0 w-8 z-10 bg-gradient-to-l from-gray-900 group-hover:from-[#2A2B32] masking",
                          }),
                        ]
                      ),
                      h(
                        "div",
                        {
                          class:
                            "btn-tools absolute flex right-1 z-10 text-gray-300",
                        },
                        [
                          h("button", {
                            class: "p-1 hover:text-white",
                            innerHTML:
                              '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>',
                          }),
                          h(
                            NPopconfirm,
                            {
                              style:
                                "color: white;background-color: rgba(52,53,65,1);",
                              negativeText: "取消",
                              positiveText: "确认",
                              showIcon: false,
                              positiveButtonProps: {
                                size: "tiny",
                                color: "#007293",
                              },
                              negativeButtonProps: {
                                size: "tiny",
                                color: "#007293",
                              },
                              onPositiveClick: (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                store.delChatData(i[0]);
                                newView();
                              },
                            },
                            {
                              trigger: () =>
                                h("button", {
                                  class: "p-1 hover:text-white",
                                  innerHTML:
                                    '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>',
                                }),
                              default: () => "确认删除吗？",
                            }
                          ),
                        ]
                      ),
                    ],
                  }
                ),
              key: i[0],
              icon: () =>
                h("iconify-icon", {
                  icon: "mdi:message-outline",
                  class: "text-white",
                  width: "1rem",
                  height: "1rem",
                }),
            };

            state.chatMenuList.push(menu);

            if (i[0] !== state.cid) {
              nextTick(() => {
                document
                  .querySelector(`[data-projection-id='${i[0]}']`)
                  ?.parentNode.parentNode.parentNode.classList.remove(
                    "animate-flash"
                  );
              });
            }
          });

        nextTick(() => {
          const newChatItem = document.querySelector(
            `[data-projection-id='${state.cid}']`
          );
          newChatItem?.parentNode.parentNode.classList.add("animate-flash");

          const masking = document.querySelector(".animate-flash .masking");
          if (masking) {
            masking.style.display = "none";
          }
        });
      },
      { immediate: true, deep: true }
    );

    watch(
      () => switchModelRef.value,
      (val) => {
        if (val) {
          switchModelObserver.observe(switchModelRef.value);
          switchModelObserver.observe(document.body);
        } else {
          switchModelObserver.disconnect();
        }
      }
    );

    onMounted(() => {
      if (store.user.role === "guest") {
        notification["info"]({
          content: "通知",
          duration: 1000 * 10,
          meta: "欢迎使用Moss，目前免费使用（但会在高峰期优先保证赞助过的用户使用）！",
          keepAliveOnHover: true,
        });
      }
    });

    return {
      darkTheme,
      ...toRefs(state),
      ...toRefs(store.$state),
      switchModel,
      switchModelRef,
      handleUpdateCollapsed,
      handleSendMsg,
      handleStop,
      handleRegen,
      handleShiftEnter,
      handleSwitchModel,
      getMobileClass,
      getContainerClass,
      inputTheme,
      popselectTheme,
      globalTheme,
      buttonTheme,
      renderLabel,
      newView,
      onScrollToTop,
      showPayModal,
    };
  },
};
