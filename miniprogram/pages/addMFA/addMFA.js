import { Form } from 'antd-mini/es/Form/form';
let app = getApp();

Page({
  data: {
    mfaInfos: []
  },
  handleRef(ref) {
    this.form.addItem(ref);
  },
  
  async onLoad(){
    this.form = new Form();
    const context = await my.cloud.createCloudContext({
      env: 'env-00jxgs70qucx' //修改为自己的环境 ID 
    });

    await context.init();

    this.cloudContext = context;
  

  },
  async submit() {
    const values = await this.form.submit();
    const account = values.account;
    const secret = values.secret;
    const curOtp= `otpauth://totp/${account}?secret=${secret}`;

    let curData = app.formatDate(new Date())

    const curMFAData = {
      name : account,
      joinTime: curData,
      mfa: curOtp
    }

    let mfaInfos = [];
    const that = this;

    // get MFAStrList from stroage
    await my.getStorage({
      key: 'mfaInfos',
      success: (res) => {
        console.log(res);
        if (res.success) {
          console.log(res.data,"res.data,执行成功");
          const previousList = res.data;
          that.mfaInfos = [...previousList, curMFAData];
          app.syncData(that.mfaInfos)
          // go back to INDEX page and refresh
          that.router.navigateTo({
            url: '../index/index'
          });
          // display success message
        my.showToast({
          type: 'success',
          content: '操作成功',
          duration: 2000,
          success: () => {
            // go back to INDEX page and refresh
            that.setData({
              basicShow: false
            })
          },
        });
        }
      },
      fail: (err) => {
        console.log(err)
      }
    });   
  
}

});
