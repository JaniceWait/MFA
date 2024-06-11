Component({
  mixins: [],
  data: {
    visible: false,
    remarkVisible: false,
    actions: [
      {
          text: '删除',
          key: 'deleted',
      },
      {
          text: '修改备注',
          key: 'modify',
      },
  ]
  },
  props: {
    onCardClick: function onCardClick() {},
    title: '标题',
    code: '123456',
    progress:100,
    index:0
  },
  didMount() {
    this.$page.addToCard(this)
  },
  didUpdate() {
    console.log('1111112221111444555')
  },
  didUnmount() {},
  onLoad() {
    console.log('1111111111111')
  },
  test(e){
    console.log(e,'eeeeeeeeeeee')
  },
  onReady() {
    console.log("尝试读取内容",this.MFAStrList)
        // 开始定时器，每隔1000毫秒（1秒）执行一次tick函数
        const timerId = setInterval(this.refreshData.bind(this), 1000);
        // 将定时器的 ID 保存到数据中
        this.setData({
          timerId: timerId
        });
    // 页面加载完成
  },
  methods: {
    showMore(item) {
      this.showMenus()
    },
    editRemark(value,event){
      this.$page.editRemark(value,event)
      this.hideRemarks()
    },
    deleteItem(event,index){
      this.$page.deleteItem(event)
    },hideMenus(){
      this.setData({
        visible: false
      })
    },showMenus(){
      this.setData({
        visible: true
      })
    },hideRemarks(){
      this.setData({
        remarkVisible: false
      })
    },handleAction(item, index, e){
      if (item.key === 'deleted') {
        this.deleteItem(index)
      }else if(item.key === 'modify'){
        this.editRemark(index)
      }
    },handleCloseMore(e){
      this.hideMenus()
    },
    handleVisibleChange(visible, e) {
        console.log(visible, e);
        this.setData({ visible });
    },
    handleCancelButtonTap(){
      this.setData({ remarkVisible:false });
    },
    handleShowButtonTap(){
      this.setData({ remarkVisible:true });
      this.handleCloseMore();
    },handleEditRemarkRef(value,event){
      this.input = event
      this.inputValue = value

    },async submitEditRemark(){
      console.log(this.input)

      this.editRemark(this.inputValue,this.input)

    }
  }
});
