import * as OTPAuth from "otpauth";
let app = getApp();
Page({
  data:{
    visible: false,
    mfaInfos:[],
    //titleBarHeight: 0,
    //statusBarHeight: 0,
    tabs: [
      {
          icon: 'CheckCircleFill',
          activeIcon: 'CheckCircleFill',
          text: 'MFA',
      },
      {
          icon: 'SetOutline',
          activeIcon: 'SetOutline',
          text: '设置',
      }
  ],
  actions: [
      {
          text: '扫描二维码添加',
          key: 'scan',
      },
      {
          text: '输入激活码添加',
          key: 'input',
      }
  ],
  data_list:[],
  formatList:[],
  basicShow: false,
  },
  cards:[]
,
 async onLoad() {

  const context = my.cloud.createCloudContext({
    env: 'env-00jxgs70qucx' //修改为自己的环境 ID 
  });
  await context.init();

  this.cloudContext = context;

    // this.readMFA();
    this.readMFAInfoData();
    // this.readMFAByStore();

    // this.syncData()



    my.showLoading({
      content: '加载中...',
      delay: '100',
    });
    let that = this;

    // 开始定时器，每隔1000毫秒（1秒）执行一次tick函数
    const timerId = setInterval(this.refreshData.bind(this), 1000);
    // 将定时器的 ID 保存到数据中
    this.setData({
      timerId: timerId
    });

  },
  handlePopupClose() {
    this.setData({
      basicShow: false
    })
  },
  addMFA() {
      this.setData({
        basicShow: true
      })
    
  },
  addMFAByScanCode() {
      // 从网络上读取数据  并保存到本地文件中
      const that = this; // 保存页面实例的引用
      let MFAList = [];
  
      my.scan({
        type: 'qr', // 扫码类型，支持 qr、bar 和 datamatrix 三种类型，默认为 qr
        success: (res) => {
          console.log('扫码成功', res);
          const curOtp = res.code;
          let totp = OTPAuth.URI.parse(curOtp);
          let curData = app.formatDate(new Date())
          let name = `${totp.issuer}:${totp.label}`;  

          console.log(name)
          const curMFAData = {
            name : name,
            joinTime: curData,
            mfa: curOtp
          }
          const mfaInfos = that.data.mfaInfos
          that.mfaInfos = [...mfaInfos, curMFAData];
          that.addMFAInfoData(that.mfaInfos)
          that.syncMFAInfoData(that.mfaInfos)
          that.saveToStroage(that.mfaInfos)

        },
        fail: (res) => {
          console.log('扫码失败', res);
          // 处理扫码失败的逻辑
        }
      });
  
    

  },
  addToStore(curMFAData){
    const that = this;
    my.getStorageSync({
      key: 'mfaInfos',
      success: (res) => {
        console.log(res);
        if (res.success) {
          const previousList = res.data;
          that.mfaInfos = [...previousList, curMFAData];
          that.addMFAInfoData(that.mfaInfos)
          that.syncMFAInfoData(that.mfaInfos)
          that.saveToStroage(that.mfaInfos)
        }else{
          that.mfaInfos = [curMFAData];
          that.addMFAInfoData(that.mfaInfos)
          that.syncMFAInfoData(that.mfaInfos)
          that.saveToStroage(that.mfaInfos)
        }
      },
      fail: (err) => {
        console.log(err)
      }
    }); 
  }
  ,
  addMFAByInput() {
   my.navigateTo({
    url: '/pages/addMFA/addMFA'
   })
  },
  cancelAdd() {
    this.setData({
      basicShow: false
    })

  },
  readMFAByStore(){
    const that = this; // 保存页面实例的引用
    my.getStorage({
      key: 'mfaInfos',
      success: (res) => {
        console.log(res);
        if (res.success) {
          console.log(res.data,"res.data,执行成功");
          that.addMFAInfoData(res.data)
        }
      },
      fail: (err) => {
        console.log(err)
      }
    }); 
  },
  readMFAInfoData(){

    const fs =  my.getFileSystemManager();

    const that = this; // 保存页面实例的引用


    // 加载时读取本地文件数据  若文件不存在则读取线上数据
    fs.readFile({
      filePath:  `${my.env.USER_DATA_PATH}/user_data.json`, // 用户本地文件地址，
      encoding: 'utf8',
      success: res => {
        console.log("读取文件成功", res.data)

        let data = JSON.parse(res.data);
        that.addMFAInfoData(data)
        that.saveToStroage(data)
      },
      fail(err) {
        console.log(err);
        that.downloadMfaInfoData();
        //my.hideLoading();
      }
    });
  },
  saveToStroage(data) {

    this.setData({
      mfaInfos:data
    })

    console.log(data, '-----------')
    my.setStorage({
      key: 'mfaInfos',
      data:data,
      success: (res) => {        //my.alert({ title: "setStorage success" });
      },
      fail: (error) => {
      },
    });
    
  },
  formatMFAInfoData(mfaInfos){
    if(!mfaInfos){
      return []
    }
    let cardInfos = [];
    for (let i = 0 ; i < mfaInfos.length; i++){
      let mfaInfo = mfaInfos[i];
      let totp = OTPAuth.URI.parse(mfaInfo.mfa);
      cardInfos.push({totp:totp,joinTime:mfaInfo.joinTime,title:mfaInfo.name})
    }
    const formatedList = cardInfos.map(item =>{
      const totp = item.totp;
      totp.inited = true;
      let {second,progress} = this.calculateTimeAndProgress(totp)
          return {
              'inited': false,
              'second': second,
              'progress': progress,
              'totp': totp,
              'code': totp.generate(),
              'title': item.title,
              'joinTime': item.joinTime
          }
   })
   return formatedList;
  },
  formatDataList(MFAStrList){
    if(!MFAStrList){
      return []
    }
    let MFAList = [];
    for (let i = 0 ; i < MFAStrList.length; i++){
      //let totp = OTPAuth.URI.parse("otpauth://totp/GitHub:baiyang0910?secret=AMTTPHN3YRPRWJFZ&issuer=GitHub");
      let totp = OTPAuth.URI.parse(MFAStrList[i]);
      MFAList.push({totp:totp})
    }
    const formatedList = MFAList.map(item =>{
      const totp = item.totp;
      totp.inited = true;
      let {second,progress} = this.calculateTimeAndProgress(totp)
          return {
              'inited': false,
              'second': second,
              'progress': progress,
              'totp': totp,
              'code': totp.generate()
          }
   })
   return formatedList;
  },
  calculateTimeAndProgress(totp){

    let second = (totp.period * (1 - ((Date.now() / 1000 / totp.period) % 1))) | 0;
    let progress = Math.round((second / 30) * 100);
    return {second,progress}
  },
  downloadMfaInfoData() {
    // 从网络上读取数据  并保存到本地文件中
    const that = this; // 保存页面实例的引用

    this.cloudContext.callFunction({
      name: 'get',
      success: function (res) {
        my.hideLoading();
        console.log("读取成功", res)
        if (!res?.result?.mfaInfos){
          return
        }
        console.log("开始刷新数据")
        that.addMFAInfoData(res?.result?.mfaInfos)
        that.saveToStroage(res?.result?.mfaInfos)


        console.log("开始写入文件")
        const fs =  my.getFileSystemManager();
        fs.writeFile({
          filePath: `${my.env.USER_DATA_PATH}/user_data.json`,
          data: JSON.stringify(res?.result?.mfaInfos),
          success(res) {
            console.log('文件写入成功',res);
          },
          fail(err) {
            console.log('文件写入失败',res);
            console.log(err);
            my.hideLoading();

          }
        });
      },
      fail: function (res) {
        my.hideLoading();

        console.log("用户无数据", res)
        

      }

    });

  }
  ,
  //  format data
  addMFAInfoData(mfaInfos){
    console.log(mfaInfos,"刷新数据")
    let formatedList = this.formatMFAInfoData(mfaInfos);


    this.$batchedUpdates(() => {
      this.setData({
        formatList:[...formatedList]
      });
  
      this.setData({
       data_list: [...formatedList]
     });
    });

   my.hideLoading();

  
  },
  refreshData(){
    let formatList = this.data.formatList;
    const finalArr = [];
    if (formatList.length >= 0){
      
      for (let i = 0; i < formatList.length; i ++){
        let data = formatList[i]
        let {second,progress} = this.calculateTimeAndProgress(data.totp)
        data.second = second;
        data.progress = progress;
        data.code = data.totp.generate();
        finalArr.push(data)
      }

      this.setData({data_list:[...finalArr]})

    }
  }, 
  syncMFAInfoData(mfaInfos){
    // 把内容保存到线上数据库
    const that = this;
    this.cloudContext.callFunction({
      name: 'sync',
      data: {mfaInfos:mfaInfos},
      success: function (res) {
        console.log("更新成功", res)
        // update local file
        const fs =  my.getFileSystemManager();
        console.log(JSON.stringify(mfaInfos),'JSON.stringify(that.MFAList)')
        fs.writeFile({
          filePath: `${my.env.USER_DATA_PATH}/user_data.json`,
          data: JSON.stringify(mfaInfos),
          success(res) {
            console.log('文件更新成功',res);
          },
          fail(err) {
            console.log('文件更新失败',res);
            console.log(err);

          }
        });
      },
      fail: function (res) {
        console.log("更新失败", res)

      }


    });
    
  },// 页面卸载时执行的函数
  onUnload() {
    // 清除定时器
    clearInterval(this.data.timerId);
  },onShow(){

    this.readMFAByStore();

  },onReady(){

  },editRemark(value,event){
    console.log(event)
    let mfaInfos = this.data.mfaInfos;
    let index = event.target.dataset.index
    mfaInfos[index].name = value
    this.updateData(mfaInfos)

  },editRemark(value,event){
    console.log(event)
    let mfaInfos = this.data.mfaInfos;
    let index = event.target.dataset.index
    mfaInfos[index].name = value
    this.updateData(mfaInfos)

  },deleteItem(event){
    let index = event.target.dataset.index
    let mfaInfos = this.data.mfaInfos;
    mfaInfos.splice(index,1)
    this.updateData(mfaInfos)
  },updateData(mfaInfos){
    this.addMFAInfoData(mfaInfos)
    this.syncMFAInfoData(mfaInfos)
    this.saveToStroage(mfaInfos)
  },addToCard(cardThat){
    let cards = this.cards;
    cards.push(cardThat)

  },handleCloseCardMenus(){
    for (let i = 0; i < this.cards.length; i ++){
      cards[i].hideMenus()
    }
  },handleAction(item, index, e) {
    if (item.key === 'scan') {
        this.addMFAByScanCode()
        return;
    }
    if (item.key === 'input') {
      this.addMFAByInput()
      return;
  }
},
handleCloseBasic(e) {
    this.setData({
        visible: false,
    });
},
handleOpenBasic(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({
        visible: true,
    });
},onChangeSearch(value, e){
  const searchArray = this.data.mfaInfos.filter(obj => obj.name.includes(value))
  this.addMFAInfoData(searchArray);
}

})