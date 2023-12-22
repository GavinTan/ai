const {
  ref,
  watch,
  reactive,
  toRefs,
  inject,
  h,
  onMounted,
  onUnmounted,
  nextTick,
  computed,
} = Vue;
const { NButton, NTag, createDiscreteApi } = naive;
const { message } = createDiscreteApi(["message"]);
const { useDateFormat } = VueUse;

export const AdminComponent = {
  template: "#admin",
  delimiters: ["{%", "%}"],
  setup() {
    const addFormRef = ref(null);
    const searchInputRef = ref(null);
    const state = reactive({
      menuOptions: [{ label: "账号管理", key: "account" }],
      columns: [
        {
          title: "用户名",
          key: "username",
        },
        {
          title: "姓名",
          key: "name",
        },
        {
          title: "角色",
          key: "role",
        },
        {
          title: "GPT3次数",
          key: "gpt3",
          sorter: "default",
        },
        {
          title: "GPT4次数",
          key: "gpt4",
          sorter: "default",
        },
        {
          title: "M",
          key: "m",
          sorter: "default",
        },
        {
          title: "状态",
          key: "disabled",
          render(row) {
            return h(
              NTag,
              {},
              { default: () => (row.disabled ? "禁止" : "允许") }
            );
          },
        },
        {
          title: "创建时间",
          key: "createdAt",
          render(row) {
            return useDateFormat(row.createdAt, "YYYY-MM-DD HH:mm:ss").value;
          },
          sorter: "default",
          defaultSortOrder: "descend",
        },
        {
          title: "操作",
          key: "actions",
          render(row) {
            return h(
              "div",
              {
                class: "flex space-x-4",
              },
              {
                default: () => [
                  h(
                    NButton,
                    {
                      text: true,
                      class: "text-[#2080f0] hover:!text-[#2080f0]",
                      onClick: () => {
                        state.edit = true;
                        Object.assign(account, row);
                        state.showAddModal = true;
                      },
                    },
                    { default: () => "编辑" }
                  ),
                  h(
                    NButton,
                    {
                      text: true,
                      class: "text-[#2080f0] hover:!text-[#2080f0]",
                      onClick: () => handleDelete(row),
                    },
                    { default: () => "删除" }
                  ),
                ],
              }
            );
          },
        },
      ],
      roleOptions: [
        { label: "游客", value: "guest" },
        { label: "用户", value: "user" },
        { label: "管理员", value: "admin" },
      ],
      data: [],
      showAddModal: false,
      collapsed: false,
      edit: false,
      search: "",
    });

    const account = reactive({
      username: "",
      password: "",
      name: "",
      role: "user",
      gpt3: 0,
      gpt4: 0,
      m: 0,
      disabled: false,
    });

    const addFormRules = {
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

    const tableData = computed(() => {
      if (state.search) {
        return state.data.filter((item) => {
          return Object.keys(item).some((key) => {
            return String(item[key]).toLowerCase().indexOf(state.search) > -1;
          });
        });
      }
      return state.data;
    });

    const store = inject("store");

    const globalTheme = {
      common: {
        baseColor: "#fff",
        primaryColor: "#10a37f",
        primaryColorHover: "#1a7f64",
      },
      Button: {},
    };

    const fetchData = async () => {
      const response = await fetch("/user", { cache: "no-cache" });
      state.data = await response.json();
    };

    const handleAdd = (e) => {
      e.preventDefault();
      addFormRef.value?.validate(async (errors) => {
        if (!errors) {
          state.showAddModal = false;

          fetch("/user", {
            method: "POST",
            body: JSON.stringify(account),
          }).then(async (response) => {
            const data = await response.json();

            if (response.ok) {
              fetchData();
              message.success(data.message || "添加成功");
            } else {
              message.error(data.message || "添加失败");
            }
          });
        }
      });
    };

    const handleEdit = (e) => {
      e.preventDefault();
      addFormRef.value?.validate(async (errors) => {
        if (!errors) {
          state.showAddModal = false;
          state.edit = false;

          fetch("/user", {
            method: "PUT",
            body: JSON.stringify(account),
          }).then(async (response) => {
            const data = await response.json();

            if (response.ok) {
              fetchData();
              message.success(data.message || "更新成功");
            } else {
              message.error(data.message || "更新失败");
            }
          });
        }
      });
    };

    const handleDelete = (row) => {
      fetch("/user", {
        method: "DELETE",
        body: JSON.stringify({ id: row.id }),
      }).then(async (response) => {
        const data = await response.json();

        if (response.ok) {
          fetchData();
          message.success(data.message || "删除成功");
        } else {
          message.error(data.message || "删除失败");
        }
      });
    };

    const handleReload = () => {
      state.search = "";
      searchInputRef.value?.blur();
      fetchData();
    };

    const resetFields = () => {
      Object.assign(account, {
        username: "",
        password: "",
        name: "",
        role: "user",
      });
    };

    fetchData();

    // watch(() => state.search, (val) => {
    //     state.data =state.data.filter(item => {
    //         return Object.keys(item).some(key => {
    //             return String(item[key]).toLowerCase().indexOf(val) > -1;
    //         });
    //     });
    // });

    return {
      ...toRefs(state),
      ...toRefs(store.$state),
      searchInputRef,
      addFormRef,
      addFormRules,
      account,
      tableData,
      handleReload,
      handleAdd,
      handleEdit,
      handleDelete,
      resetFields,
      globalTheme,
    };
  },
};
