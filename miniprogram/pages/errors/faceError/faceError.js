Page({

  onRetry(){
    let app = getApp();
    app.startIfaaAuthentication();
    console.log("重试")
  }
});
