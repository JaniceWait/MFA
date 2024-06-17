Page({
  data: {
    giteeVisible: false,
    githubVisible: false,
  },

  onLoad() {
    // 页面加载时的初始化操作
  },

  onShow() {
    // 页面显示时的操作
  },
  handleGiteeVisibleChange(giteeVisible, e) {
      console.log(giteeVisible, e);
      this.setData({ giteeVisible });
  },
  handleGithubVisibleChange(githubVisible, e) {
    console.log(githubVisible, e);
    this.setData({ githubVisible });
  },
  onTapGitee(){
    this.onClipboard('https://gitee.com/wuhun0301/mfa')
    this.setData({ giteeVisible:false });

  },
  onTapGithub(){
    this.onClipboard('https://github.com/baiyang0910/MFA')
    this.setData({ githubVisible:false });
  },onClipboard(content){
    my.setClipboard ({
      text: content,
      success: function (res) {
        my.showToast({
          content: "已经复制到剪贴板",
        }); 
      },
      fail: function (err) {
        console.log (err);
      },
    });
  }
});
