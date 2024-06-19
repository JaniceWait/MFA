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
  },
  didUnmount() {},
  onLoad() {
  },
  onReady() {
  },
  methods: {
    showMore(item) {
      this.showMenus()
    },
    editRemark(value,event){
      this.hideRemarks()
      this.$page.editRemark(value,event)
    },
    deleteItem(event,index){
      this.hideMenus()
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
      if (!this.input){
        return
      }
      this.editRemark(this.inputValue,this.input)
    }
  }
});
