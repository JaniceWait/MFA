Page({
  data: {},

  onLoad() {
    // 页面加载时的初始化操作
  },

  onShow() {
    // 页面显示时的操作
  },
  onTapGitee(){
    my.navigateTo({
      url: '/pages/settings/gitee/gitee'
    });
  },
  onTapGithub(){
    my.navigateTo({
      url: '/pages/settings/github/github'
    });
  }
});
