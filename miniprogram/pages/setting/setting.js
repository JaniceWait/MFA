var app = getApp();
Page({
  data: {        
    configs: {
      facial: false,
      version: 'v1.0.0'
    },
    copywriting:{
      appTitle: "在线MFA验证器",
    }
  },
  onSyncData(){

    app.downloadData();

    my.showToast({
      content: "数据已经同步",
    });

  }
  ,
  handleSetRadius(checked,that) {
    that.setData({
      'configs.facial': checked,
    });
    app.globalData.config.useFaceRecognition = checked
    app.saveConfig();
    if (checked){
      my.showToast({
        content: "人脸识别已开启",
      });
    }else{
      my.showToast({
        content: "设备不支持人脸识别",
      });
    }
  },
  onClientVersion(){
        // 同步数据的具体实现
      my.showToast({
          content: "当前版本:"+this.data.configs.version,
      });
  }
  ,
  showAboutUs() {
    // 展示关于我们的具体实现
    my.navigateTo({
      url: '/pages/settings/about-us/about-us'
    });
  },  showFeatureIntroduction() {
    // 展示功能介绍的具体实现
    my.navigateTo({
      url: '/pages/settings/feature-introduction/feature-introduction'
    });
  },
  onEnableFacialRecognition(checked) {

    let that = this
    if (!checked){
      
      that.handleSetRadius(false,that)             
      return
    }

    if (my.canIUse('checkIsSupportIfaaAuthentication')) {
      my.checkIsSupportIfaaAuthentication({
        success(res) {
          if (res.supportMode.indexOf('facial')){
            if (my.canIUse('checkIsIfaaEnrolledInDevice')) {
              my.checkIsIfaaEnrolledInDevice({
                checkAuthMode: 'facial',
                success(res) {
                  that.handleSetRadius(checked,that)             
                },
                fail(res) {
                  that.handleSetRadius(false,that)             
                }
              });
            }
          }else{
            that.handleSetRadius(false,that)             
          }
        },
        fail(res) {
          that.handleSetRadius(false,that)             
        }
      }) 
    }
  },
  onLoad() {


  },
});
