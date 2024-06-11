App({
  globalData: {
    config: {
      useFaceRecognition: false // 初始默认值
    },
    mfaInfos: [{
      name: "name",
      join_time: "2023-04-05 00:00:00",
      mfa: "otpauth://totp/GitHub:baiyang0910?secret=AMTTPHN3YRPRWJFZ&issuer=GitHub"
    }]
  }, 
  async onLaunch(options) {

    // 初始化阿里云的配置
    this.initAliCloud()

    // 读取配置信息 并加入到全局数据中
    this.readConfig();

  },
  onShow(options) {
    this.initAliCloud()
  },
  async initAliCloud() {
    if(this.globalData.initAliCloud){
      return this.aliCloudContext;
    }
    const context = my.cloud.createCloudContext({
      env: 'env-00jxgs70qucx' //修改为自己的环境 ID 
    });
    await context.init();

    this.aliCloudContext = context;
    this.globalData.initAliCloud = true;
    return this.aliCloudContext;
  },
  startIfaaAuthentication() {
    if (this.globalData.config.useFaceRecognition && my.canIUse('startIfaaAuthentication')) {
      my.startIfaaAuthentication({
        requestAuthModes: ['facial'],
        challenge: 'MFA',
        success(res) {
          console.log(res.verifyId);
        },
        fail(res) {
          // 认证失败
          my.navigateTo({
            url: '/pages/errors/faceError/faceError'
          });
        }
      })
    }
  },
  // 格式化日期时间为YYYY-MM-DD HH:mm:ss
formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
},
  readConfig() {
    const fs = my.getFileSystemManager();
    const that = this; // 保存页面实例的引用
    fs.readFileSync({
      filePath: `${my.env.USER_DATA_PATH}/config_data.json`, // 用户本地文件地址，
      encoding: 'utf8',
      success: res => {
        console.log("读取文件成功", res.data)
        // 将内容写入到全局信息中
        that.globalData.config = JSON.parse(res.data)
        this.startIfaaAuthentication();
      },
      fail(err) {
        console.log("无需处理")
      }
    });
  },
  saveConfig() {
    let config = this.globalData.config;

    const fs = my.getFileSystemManager();

    fs.writeFile({
      filePath: `${my.env.USER_DATA_PATH}/config_data.json`,
      data: JSON.stringify(config),
      success(res) {
        console.log('文件写入成功', res);
      },
      fail(err) {
        console.log('文件写入失败', err);
      }
    });
  },
  downloadData() {
    // 从网络上读取数据  并保存到本地文件中
    const that = this; // 保存页面实例的引用

    this.aliCloudContext.callFunction({
      name: 'get',
      success: function (res) {
        console.log("读取成功", res)
        if (!res.result.mfaInfos) {
          return
        }
        let data = res?.result?.mfaInfos;
        console.log("开始刷新数据")

        that.saveToStroage(data)
        console.log("开始写入文件")
        const fs = my.getFileSystemManager();
        fs.writeFile({
          filePath: `${my.env.USER_DATA_PATH}/user_data.json`,
          data: JSON.stringify(res.result.mfaInfos),
          success(res) {
            console.log('文件写入成功', res);
          },
          fail(err) {
            console.log('文件写入失败', err);
            console.log(err);
          }
        });
      },
      fail: function (res) {
        console.log("用户无数据", res)
      }

    });

  },
  syncData(mfaInfos) {
    // 把内容保存到线上数据库
    const that = this;
    this.aliCloudContext.callFunction({
      name: 'sync',
      data: {
        mfaInfos: mfaInfos
      },
      success: function (res) {
        console.log("更新成功", res)
        // update local file
        const fs = my.getFileSystemManager();
        console.log(JSON.stringify(mfaInfos), 'JSON.stringify(that.MFAList)')

        // 同步刷新页面信息
        that.saveToStroage(mfaInfos);

        fs.writeFile({
          filePath: `${my.env.USER_DATA_PATH}/user_data.json`,
          data: JSON.stringify(mfaInfos),
          success(res) {
            console.log('文件更新成功', res);
          },
          fail(err) {
            console.log('文件更新失败', err);
            console.log(err);
          }
        });

      },
      fail: function (res) {
        console.log("更新失败", res)
      }


    });

  },
  saveToStroage(data) {
    my.setStorage({
      key: 'mfaInfos',
      data: data,
      success: (res) => { //my.alert({ title: "setStorage success" });
      },
      fail: (error) => {},
    });
  },
  readMFAInfos(){
    const fs =  my.getFileSystemManager();

    const that = this; // 保存页面实例的引用


    // 加载时读取本地文件数据  若文件不存在则读取线上数据
    fs.readFile({
      filePath:  `${my.env.USER_DATA_PATH}/user_data.json`, // 用户本地文件地址，
      encoding: 'utf8',
      success: res => {
        console.log("读取文件成功", res.data)

        let data = JSON.parse(res.data);
        that.saveToStroage(data);
      },
      fail(err) {
        console.log(err);
        that.downloadData();
      }
    });
  }

});