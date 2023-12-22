const { ref, watch, toRefs, inject, onMounted, onUnmounted, nextTick } = Vue;
const { useRoute, useRouter } = VueRouter;

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
      <div class="flex p-4 gap-4 text-base md:gap-6 md:max-w-2xl lg:max-w-[38rem] xl:max-w-3xl md:py-6 lg:px-0 m-auto">
        <div class="w-[30px] flex flex-col relative items-end">
            <div class="relative h-[30px] w-[30px] p-1 rounded-sm text-white flex items-center justify-center bg-[#7989FF]">
                <svg stroke="currentColor" fill="none" stroke-width="1.5" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
                </svg>
            </div>
        </div>
        
        <div class="relative flex w-[calc(100%-50px)] flex-col gap-1 md:gap-3 lg:w-[calc(100%-115px)] whitespace-pre-wrap break-words">
          <div>{{ content }}</div>
        </div>
      </div>
    </div>
    `,
};

const ReplyComponent = {
  props: ["content", "index"],
  setup() {
    const store = inject("store");
    const md = inject("md");

    return {
      ...toRefs(store.$state),
      md,
    };
  },
  template: `
    <div class="group w-full text-gray-800 dark:text-gray-100 border-b border-black/10 dark:border-gray-900/50 bg-gray-50 dark:bg-[#444654]">
      <div class="flex p-4 gap-4 text-base md:gap-6 md:max-w-2xl lg:max-w-[38rem] xl:max-w-3xl md:py-6 lg:px-0 m-auto">
        <div class="w-[30px] flex-shrink-0 flex flex-col relative items-end">
          <div v-if="modelLabel === 'GPT-4'" class="relative h-[30px] w-[30px] p-1 rounded-sm text-white flex items-center justify-center" style="background-color: rgb(171, 104, 255);">
            <svg width="41" height="41" viewBox="0 0 41 41" fill="none"
                xmlns="http://www.w3.org/2000/svg" stroke-width="1.5">
              <path
                  d="M37.5324 16.8707C37.9808 15.5241 38.1363 14.0974 37.9886 12.6859C37.8409 11.2744 37.3934 9.91076 36.676 8.68622C35.6126 6.83404 33.9882 5.3676 32.0373 4.4985C30.0864 3.62941 27.9098 3.40259 25.8215 3.85078C24.8796 2.7893 23.7219 1.94125 22.4257 1.36341C21.1295 0.785575 19.7249 0.491269 18.3058 0.500197C16.1708 0.495044 14.0893 1.16803 12.3614 2.42214C10.6335 3.67624 9.34853 5.44666 8.6917 7.47815C7.30085 7.76286 5.98686 8.3414 4.8377 9.17505C3.68854 10.0087 2.73073 11.0782 2.02839 12.312C0.956464 14.1591 0.498905 16.2988 0.721698 18.4228C0.944492 20.5467 1.83612 22.5449 3.268 24.1293C2.81966 25.4759 2.66413 26.9026 2.81182 28.3141C2.95951 29.7256 3.40701 31.0892 4.12437 32.3138C5.18791 34.1659 6.8123 35.6322 8.76321 36.5013C10.7141 37.3704 12.8907 37.5973 14.9789 37.1492C15.9208 38.2107 17.0786 39.0587 18.3747 39.6366C19.6709 40.2144 21.0755 40.5087 22.4946 40.4998C24.6307 40.5054 26.7133 39.8321 28.4418 38.5772C30.1704 37.3223 31.4556 35.5506 32.1119 33.5179C33.5027 33.2332 34.8167 32.6547 35.9659 31.821C37.115 30.9874 38.0728 29.9178 38.7752 28.684C39.8458 26.8371 40.3023 24.6979 40.0789 22.5748C39.8556 20.4517 38.9639 18.4544 37.5324 16.8707ZM22.4978 37.8849C20.7443 37.8874 19.0459 37.2733 17.6994 36.1501C17.7601 36.117 17.8666 36.0586 17.936 36.0161L25.9004 31.4156C26.1003 31.3019 26.2663 31.137 26.3813 30.9378C26.4964 30.7386 26.5563 30.5124 26.5549 30.2825V19.0542L29.9213 20.998C29.9389 21.0068 29.9541 21.0198 29.9656 21.0359C29.977 21.052 29.9842 21.0707 29.9867 21.0902V30.3889C29.9842 32.375 29.1946 34.2791 27.7909 35.6841C26.3872 37.0892 24.4838 37.8806 22.4978 37.8849ZM6.39227 31.0064C5.51397 29.4888 5.19742 27.7107 5.49804 25.9832C5.55718 26.0187 5.66048 26.0818 5.73461 26.1244L13.699 30.7248C13.8975 30.8408 14.1233 30.902 14.3532 30.902C14.583 30.902 14.8088 30.8408 15.0073 30.7248L24.731 25.1103V28.9979C24.7321 29.0177 24.7283 29.0376 24.7199 29.0556C24.7115 29.0736 24.6988 29.0893 24.6829 29.1012L16.6317 33.7497C14.9096 34.7416 12.8643 35.0097 10.9447 34.4954C9.02506 33.9811 7.38785 32.7263 6.39227 31.0064ZM4.29707 13.6194C5.17156 12.0998 6.55279 10.9364 8.19885 10.3327C8.19885 10.4013 8.19491 10.5228 8.19491 10.6071V19.808C8.19351 20.0378 8.25334 20.2638 8.36823 20.4629C8.48312 20.6619 8.64893 20.8267 8.84863 20.9404L18.5723 26.5542L15.206 28.4979C15.1894 28.5089 15.1703 28.5155 15.1505 28.5173C15.1307 28.5191 15.1107 28.516 15.0924 28.5082L7.04046 23.8557C5.32135 22.8601 4.06716 21.2235 3.55289 19.3046C3.03862 17.3858 3.30624 15.3413 4.29707 13.6194ZM31.955 20.0556L22.2312 14.4411L25.5976 12.4981C25.6142 12.4872 25.6333 12.4805 25.6531 12.4787C25.6729 12.4769 25.6928 12.4801 25.7111 12.4879L33.7631 17.1364C34.9967 17.849 36.0017 18.8982 36.6606 20.1613C37.3194 21.4244 37.6047 22.849 37.4832 24.2684C37.3617 25.6878 36.8382 27.0432 35.9743 28.1759C35.1103 29.3086 33.9415 30.1717 32.6047 30.6641C32.6047 30.5947 32.6047 30.4733 32.6047 30.3889V21.188C32.6066 20.9586 32.5474 20.7328 32.4332 20.5338C32.319 20.3348 32.154 20.1698 31.955 20.0556ZM35.3055 15.0128C35.2464 14.9765 35.1431 14.9142 35.069 14.8717L27.1045 10.2712C26.906 10.1554 26.6803 10.0943 26.4504 10.0943C26.2206 10.0943 25.9948 10.1554 25.7963 10.2712L16.0726 15.8858V11.9982C16.0715 11.9783 16.0753 11.9585 16.0837 11.9405C16.0921 11.9225 16.1048 11.9068 16.1207 11.8949L24.1719 7.25025C25.4053 6.53903 26.8158 6.19376 28.2383 6.25482C29.6608 6.31589 31.0364 6.78077 32.2044 7.59508C33.3723 8.40939 34.2842 9.53945 34.8334 10.8531C35.3826 12.1667 35.5464 13.6095 35.3055 15.0128ZM14.2424 21.9419L10.8752 19.9981C10.8576 19.9893 10.8423 19.9763 10.8309 19.9602C10.8195 19.9441 10.8122 19.9254 10.8098 19.9058V10.6071C10.8107 9.18295 11.2173 7.78848 11.9819 6.58696C12.7466 5.38544 13.8377 4.42659 15.1275 3.82264C16.4173 3.21869 17.8524 2.99464 19.2649 3.1767C20.6775 3.35876 22.0089 3.93941 23.1034 4.85067C23.0427 4.88379 22.937 4.94215 22.8668 4.98473L14.9024 9.58517C14.7025 9.69878 14.5366 9.86356 14.4215 10.0626C14.3065 10.2616 14.2466 10.4877 14.2479 10.7175L14.2424 21.9419ZM16.071 17.9991L20.4018 15.4978L24.7325 17.9975V22.9985L20.4018 25.4983L16.071 22.9985V17.9991Z"
                  fill="currentColor"></path>
            </svg>
          </div>

          <div v-else-if="modelLabel === 'GeMini'" class="relative rounded-sm h-[30px] w-[30px] text-white flex items-center justify-center" style="background-color: #e2e8f0;">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 36 36">
              <path fill="#3B88C3" d="M36 32a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4h28a4 4 0 0 1 4 4z"/><path fill="#FFF" d="M25.66 15.915c1.953 0 2.729.992 2.729 2.977c0 5.984-3.906 10.48-10.108 10.48c-6.294 0-10.666-4.992-10.666-11.41c0-6.449 4.341-11.41 10.666-11.41c4.682 0 8.526 2.201 8.526 4.372c0 1.333-.836 2.17-1.922 2.17c-2.108 0-2.542-2.263-6.604-2.263c-3.875 0-5.829 3.379-5.829 7.131c0 3.782 1.892 7.132 5.829 7.132c2.45 0 5.272-1.365 5.272-4.899h-3.164c-1.271 0-2.17-.899-2.17-2.17c0-1.302.992-2.108 2.17-2.108h5.271z"/>
            </svg>
          </div>
        
          <div v-else class="relative p-1 rounded-sm h-[30px] w-[30px] text-white flex items-center justify-center" style="background-color: rgb(25, 195, 125);">
            <svg width="41" height="41" viewBox="0 0 41 41" fill="none"
              xmlns="http://www.w3.org/2000/svg" stroke-width="1.5" class="h-6 w-6" role="img">
              <path
                  d="M37.5324 16.8707C37.9808 15.5241 38.1363 14.0974 37.9886 12.6859C37.8409 11.2744 37.3934 9.91076 36.676 8.68622C35.6126 6.83404 33.9882 5.3676 32.0373 4.4985C30.0864 3.62941 27.9098 3.40259 25.8215 3.85078C24.8796 2.7893 23.7219 1.94125 22.4257 1.36341C21.1295 0.785575 19.7249 0.491269 18.3058 0.500197C16.1708 0.495044 14.0893 1.16803 12.3614 2.42214C10.6335 3.67624 9.34853 5.44666 8.6917 7.47815C7.30085 7.76286 5.98686 8.3414 4.8377 9.17505C3.68854 10.0087 2.73073 11.0782 2.02839 12.312C0.956464 14.1591 0.498905 16.2988 0.721698 18.4228C0.944492 20.5467 1.83612 22.5449 3.268 24.1293C2.81966 25.4759 2.66413 26.9026 2.81182 28.3141C2.95951 29.7256 3.40701 31.0892 4.12437 32.3138C5.18791 34.1659 6.8123 35.6322 8.76321 36.5013C10.7141 37.3704 12.8907 37.5973 14.9789 37.1492C15.9208 38.2107 17.0786 39.0587 18.3747 39.6366C19.6709 40.2144 21.0755 40.5087 22.4946 40.4998C24.6307 40.5054 26.7133 39.8321 28.4418 38.5772C30.1704 37.3223 31.4556 35.5506 32.1119 33.5179C33.5027 33.2332 34.8167 32.6547 35.9659 31.821C37.115 30.9874 38.0728 29.9178 38.7752 28.684C39.8458 26.8371 40.3023 24.6979 40.0789 22.5748C39.8556 20.4517 38.9639 18.4544 37.5324 16.8707ZM22.4978 37.8849C20.7443 37.8874 19.0459 37.2733 17.6994 36.1501C17.7601 36.117 17.8666 36.0586 17.936 36.0161L25.9004 31.4156C26.1003 31.3019 26.2663 31.137 26.3813 30.9378C26.4964 30.7386 26.5563 30.5124 26.5549 30.2825V19.0542L29.9213 20.998C29.9389 21.0068 29.9541 21.0198 29.9656 21.0359C29.977 21.052 29.9842 21.0707 29.9867 21.0902V30.3889C29.9842 32.375 29.1946 34.2791 27.7909 35.6841C26.3872 37.0892 24.4838 37.8806 22.4978 37.8849ZM6.39227 31.0064C5.51397 29.4888 5.19742 27.7107 5.49804 25.9832C5.55718 26.0187 5.66048 26.0818 5.73461 26.1244L13.699 30.7248C13.8975 30.8408 14.1233 30.902 14.3532 30.902C14.583 30.902 14.8088 30.8408 15.0073 30.7248L24.731 25.1103V28.9979C24.7321 29.0177 24.7283 29.0376 24.7199 29.0556C24.7115 29.0736 24.6988 29.0893 24.6829 29.1012L16.6317 33.7497C14.9096 34.7416 12.8643 35.0097 10.9447 34.4954C9.02506 33.9811 7.38785 32.7263 6.39227 31.0064ZM4.29707 13.6194C5.17156 12.0998 6.55279 10.9364 8.19885 10.3327C8.19885 10.4013 8.19491 10.5228 8.19491 10.6071V19.808C8.19351 20.0378 8.25334 20.2638 8.36823 20.4629C8.48312 20.6619 8.64893 20.8267 8.84863 20.9404L18.5723 26.5542L15.206 28.4979C15.1894 28.5089 15.1703 28.5155 15.1505 28.5173C15.1307 28.5191 15.1107 28.516 15.0924 28.5082L7.04046 23.8557C5.32135 22.8601 4.06716 21.2235 3.55289 19.3046C3.03862 17.3858 3.30624 15.3413 4.29707 13.6194ZM31.955 20.0556L22.2312 14.4411L25.5976 12.4981C25.6142 12.4872 25.6333 12.4805 25.6531 12.4787C25.6729 12.4769 25.6928 12.4801 25.7111 12.4879L33.7631 17.1364C34.9967 17.849 36.0017 18.8982 36.6606 20.1613C37.3194 21.4244 37.6047 22.849 37.4832 24.2684C37.3617 25.6878 36.8382 27.0432 35.9743 28.1759C35.1103 29.3086 33.9415 30.1717 32.6047 30.6641C32.6047 30.5947 32.6047 30.4733 32.6047 30.3889V21.188C32.6066 20.9586 32.5474 20.7328 32.4332 20.5338C32.319 20.3348 32.154 20.1698 31.955 20.0556ZM35.3055 15.0128C35.2464 14.9765 35.1431 14.9142 35.069 14.8717L27.1045 10.2712C26.906 10.1554 26.6803 10.0943 26.4504 10.0943C26.2206 10.0943 25.9948 10.1554 25.7963 10.2712L16.0726 15.8858V11.9982C16.0715 11.9783 16.0753 11.9585 16.0837 11.9405C16.0921 11.9225 16.1048 11.9068 16.1207 11.8949L24.1719 7.25025C25.4053 6.53903 26.8158 6.19376 28.2383 6.25482C29.6608 6.31589 31.0364 6.78077 32.2044 7.59508C33.3723 8.40939 34.2842 9.53945 34.8334 10.8531C35.3826 12.1667 35.5464 13.6095 35.3055 15.0128ZM14.2424 21.9419L10.8752 19.9981C10.8576 19.9893 10.8423 19.9763 10.8309 19.9602C10.8195 19.9441 10.8122 19.9254 10.8098 19.9058V10.6071C10.8107 9.18295 11.2173 7.78848 11.9819 6.58696C12.7466 5.38544 13.8377 4.42659 15.1275 3.82264C16.4173 3.21869 17.8524 2.99464 19.2649 3.1767C20.6775 3.35876 22.0089 3.93941 23.1034 4.85067C23.0427 4.88379 22.937 4.94215 22.8668 4.98473L14.9024 9.58517C14.7025 9.69878 14.5366 9.86356 14.4215 10.0626C14.3065 10.2616 14.2466 10.4877 14.2479 10.7175L14.2424 21.9419ZM16.071 17.9991L20.4018 15.4978L24.7325 17.9975V22.9985L20.4018 25.4983L16.071 22.9985V17.9991Z"
                  fill="currentColor"></path>
            </svg>
          </div>
        </div>

        <div class="relative flex w-[calc(100%-50px)] flex-col gap-1 md:gap-3 lg:w-[calc(100%-115px)]">
          <div :class="index === qIndex ? 'markdown prose !max-w-none w-full break-words dark:prose-invert light result-streaming' : 'markdown prose !max-w-none w-full break-words dark:prose-invert light'" v-html="md.render(content)"></div>

          <div class="flex justify-between empty:hidden gizmo:justify-start gizmo:gap-3 lg:block gizmo:lg:flex">
            <div class="text-gray-400 flex self-end lg:self-center justify-center gizmo:lg:justify-start mt-2 gizmo:mt-0 visible lg:gap-1 lg:absolute lg:top-0 lg:translate-x-full lg:right-0 lg:mt-0 lg:pl-2 gap-2 md:gap-3">
              <button onclick="handleCopyContent(this)" class="flex ml-auto gizmo:ml-0 gap-2 items-center rounded-md p-1 gizmo:gap-1.5 gizmo:pl-0 dark:text-gray-400 dark:hover:text-gray-200 disabled:dark:hover:text-gray-400 hover:text-gray-700">
                <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="icon-sm" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
              </button>

              <div class="flex gap-1">
                <button class="p-1 gizmo:pl-0 rounded-md disabled:dark:hover:text-gray-400 dark:hover:text-gray-200 dark:text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700">
                  <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="icon-sm" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                  </svg>
                </button>
                <button class="p-1 gizmo:pl-0 rounded-md disabled:dark:hover:text-gray-400 dark:hover:text-gray-200 dark:text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700">
                  <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="icon-sm" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    `,
};

export const ChatComponent = {
  props: [],
  template: "#chat",
  delimiters: ["{%", "%}"],
  components: {
    ModelComponent,
    QuestionComponent,
    ReplyComponent,
  },
  emits: ["data-from-child"],
  setup(props, context) {
    const chatContainerRef = ref(null);
    const router = useRouter();
    const route = useRoute();
    const store = inject("store");

    const setHandleSendMsg = inject("setHandleSendMsg");
    const setFetchData = inject("setFetchData");
    const chatData = store.chatData;

    const fetchData = () => {
      const cid = route.params.id;

      store.setCursorClass(store.chatData[cid].chatList.length - 1);
      store.requesting = true;
      store.sendMsg = "";
      store.setController();

      let messages;

      if (store.chatContext) {
        messages = store.chatData[cid].chatList
          .slice(0, -1)
          .slice(-(store.chatNum * 2));
      } else {
        messages = store.chatData[cid].chatList.slice(0, -1).slice(-1);
      }

      fetch(store.apiUrl, {
        method: "POST",
        signal: store.controller.signal,
        body: JSON.stringify({
          messages,
          model: store.chatData[cid].model,
        }),
      })
        .then(async (response) => {
          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || data.error || response.statusText);
          }

          return response.body;
        })
        .then((stream) => {
          store.runing = 1;
          const reader = stream.getReader();

          const read = () => {
            reader
              .read()
              .then(({ value, done }) => {
                if (done) {
                  reader.cancel();
                  store.runing = 0;
                  store.requesting = false;
                  store.setCursorClass("");
                  return;
                }

                const decoder = new TextDecoder("utf-8");
                store.chatData[cid].chatList[
                  store.chatData[cid].chatList.length - 1
                ].content += decoder.decode(value);

                if (store.chatAutoScroll) {
                  nextTick(() => {
                    chatContainerRef.value.scrollTop =
                      chatContainerRef.value.scrollHeight;
                  });
                }

                read();
              })
              .catch((error) => {});
          };

          read();
        })
        .catch((error) => {
          console.error(error.message);
          store.setCursorClass("");
          store.runing = 0;
          store.requesting = false;

          if (error.message === "会话已达到限制") {
            const txt =
              "当天会话已达到限制！（系统会优先保证赞助过的用户使用）。";
            store.chatData[cid].chatList[
              store.chatData[cid].chatList.length - 1
            ].content = `<div class="py-2 px-3 border text-gray-600 rounded-md text-sm dark:text-gray-100 border-blue-500 bg-blue-500/10">${txt}</div>`;
          } else {
            const txt =
              "发生了一个错误。您的请求达到限制或者处理您的请求时出现了其他问题。如果重试后问题持续存在，请尝试刷新页面或是等待20s后再试。";
            store.chatData[cid].chatList[
              store.chatData[cid].chatList.length - 1
            ].content = `<div class="py-2 px-3 border text-gray-600 rounded-md text-sm dark:text-gray-100 border-red-500 bg-red-500/10">${txt}</div>`;
          }
        });
    };

    const handleSendMsg = () => {
      store.chatData[route.params.id].chatList.push({
        role: "user",
        content: store.sendMsg,
      });
      store.chatData[route.params.id].chatList.push({
        role: "assistant",
        content: "",
      });

      if (store.chatAutoScroll) {
        nextTick(
          () =>
            (chatContainerRef.value.scrollTop =
              chatContainerRef.value.scrollHeight)
        );
      }

      store.runing = -1;

      fetchData();
    };

    const handleScroll = (e) => {
      nextTick(() => {
        const { scrollHeight, scrollTop, clientHeight } = e.target;
        store.chatAutoScroll = scrollHeight - scrollTop === clientHeight;
      });
    };

    function isUUID(uuid) {
      let s = "" + uuid;
      s = s.toLowerCase();
      var regex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
      return regex.test(s);
    }

    setHandleSendMsg(handleSendMsg);
    setFetchData(fetchData);

    window.handleCopy = (e) => {
      if (!navigator.clipboard) return;

      const text = e.parentElement.nextSibling.textContent;
      navigator.clipboard.writeText(text).then(() => {
        e.innerHTML =
          '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1rem" width="1rem" xmlns="http://www.w3.org/2000/svg"><polyline points="20 6 9 17 4 12"></polyline></svg>Copied!';

        setTimeout(() => {
          e.innerHTML =
            '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1rem" width="1rem" xmlns="http://www.w3.org/2000/svg"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>Copy code';
        }, 2000);
      });
    };

    window.handleCopyContent = (e) => {
      if (!navigator.clipboard) return;

      const text = e.parentNode.parentNode.previousSibling.textContent?.trim();
      navigator.clipboard.writeText(text).then(() => {
        e.innerHTML =
          '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="icon-sm" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="20 6 9 17 4 12"></polyline></svg>';

        setTimeout(() => {
          e.innerHTML =
            '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="icon-sm" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>';
        }, 2000);
      });
    };

    watch(
      () => route.params.id,
      (val) => {
        if (isUUID(val)) {
          store.updateActiveMenu(val);

          if (store.runing) {
            store.runing = 0;
            store.requesting = false;
            store.controller.abort();
            store.setCursorClass("");
          }

          if (!chatData[route.params.id])
            store.chatData[route.params.id] = {
              chatList: [],
              model: store.model,
            };

          store.models.forEach((i) => {
            if (i.value === chatData[route.params.id]?.model) {
              store.modelLabel = i.label;
            }
          });

          nextTick(
            () =>
              (chatContainerRef.value.scrollTop =
                chatContainerRef.value.scrollHeight)
          );
        } else {
          if (val) router.push({ name: "404" });
        }
      },
      { immediate: true }
    );

    onMounted(() => {
      store.runing = 0;
    });

    onUnmounted(() => {
      store.requesting = false;
      store.updateActiveMenu("");
    });

    return {
      ...toRefs(store.$state),
      chatData,
      chatContainerRef,
      target: () => chatContainerRef.value,
      handleScroll,
    };
  },
};
