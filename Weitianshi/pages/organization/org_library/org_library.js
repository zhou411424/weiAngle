// pages/organization/org_library/org_library.js
var app = getApp();
var url = app.globalData.url;
var url_common = app.globalData.url_common;
import * as SearchModel from '../../../utils/searchModel';
import * as ShareModel from '../../../utils/shareModel';
Page({
  data: {
    //筛选搜索
    SearchInit: SearchModel.data,
    imgUrls: app.globalData.picUrl.invest_org
  },
  onLoad: function (options) {
    let label = options.label;
    let itemId = options.itemId;
    let that = this;
    wx.showLoading({
      title: 'loading',
      mask: true,
    })

    //更改搜索模块初始化设置
    SearchModel.reInitSearch(that, {
      tab: [
        { type:2, name: '领域', label: 'label_industry', itemId: 'industry_id', itemName: 'industry_name', longCheckBox: false, page:'0'},
        { type: 1, name: '地区', label: "label_area", itemId: 'area_id', itemName: 'area_title', longCheckBox: false },
        { type: 1, name: '风格', label: "label_style", itemId: 'style_id', itemName: 'style_name', longCheckBox: false },
        { type: 1, name: '类型', label: "label_type", itemId: 'type_id', itemName: 'type_name', longCheckBox: true },
      ],
    })

    // 页面间跳转传值筛选
    SearchModel.detialItemSearch(label,itemId,that,searchData=>{
      console.log(searchData)
    })
    
    app.httpPost({
      url: url_common + '/api/investment/list',
      data: {}
    }).then(res => {
      wx.hideLoading()
      let investormentList = res.data.data;
      let investment_list = investormentList.investment_list.list;
      that.setData({
        investormentList: investormentList,
        investment_list: investment_list
      })
      wx.hideLoading();
    })

  },

  onShow: function () {
    this.setData({
      requestCheck: true,
      currentPage: 1,
      page_end: false
    })
  },
  // 上拉加载
  loadMore: function () {
    console.log("loadMore")
    let that = this;
    let currentPage = this.data.currentPage;
    let investment_list = this.data.investment_list;
    var request = {
      url: url_common + '/api/investment/list',
      data: {
        page: currentPage
      }
    }
    //调用通用加载函数
    app.loadMore2(that, request, res => {
      let investment_list_new = res.data.data.investment_list.list
      let page_end = res.data.data.investment_list.page_end;
      if (investment_list) {
        investment_list = investment_list.concat(investment_list_new)
        currentPage++;
        that.setData({
          investment_list: investment_list,
          page_end: page_end,
          requestCheck: true
        })
        console.log(investment_list)
      }
      if (page_end == true) {
        app.errorHide(that, '没有更多了', 3000)
      }
    })
    console.log(investment_list)
  },

  //跳转机构详情
  institutionalDetails: function (e) {
    let id = e.currentTarget.dataset.id;

  },

  // --------------------------筛选搜索--------------------------------------------------

  // 下拉框
  move(e) {
    let that = this;
    let SearchInit = this.data.SearchInit;
    SearchModel.move(e, that)
  },
  // 标签选择
  tagsCheck(e) {
    SearchModel.tagsCheck(e, this)
  },
  // 展示项删除
  labelDelete(e){
    SearchModel.labelDelete(e,this)
  },
  // 筛选重置
  reset() {
    SearchModel.reset(this)
  },
  // 筛选全部重置
  allReset() {
    SearchModel.allReset(this)
  },
  // 筛选确定
  searchCertain() {
    let that = this;
    let current = this.data.currentTab;
    let SearchInit = this.data.SearchInit;
    let searchData = SearchModel.searchCertain(that);
    SearchInit.searchData = searchData;
    this.setData({
      searchInit: SearchInit
    })
  },
  // 点击modal层
  modal() {
    let that = this;
    SearchModel.modal(that)
  },
  // 搜索
  searchSth() {
    let that = this;
    let str;
    str = this.data.currentTab == 0 ? "selected" : "newest"
    SearchModel.searchSth(that, str)
  },
  // 一级联动选择
  firstLinkCheck(e){
    SearchModel.firstLinkCheck(e,this);
  },
  // 联动选择全部
  linkCheckAll(e){
    SearchModel.linkCheckAll(e,this);
  },

  // -----------------------------------------------------------------------------------------
  //跳转帮助
  guideHelp() {
    app.href('/pages/organization/subPage/guide_help/guide_help')
  },
  //机构详情跳转
  institutionalDetails(e) {
    let id = e.currentTarget.dataset.id;
    app.href('/pages/organization/org_detail/org_detail?investment_id=' + id)
  },

  onShareAppMessage: function () {
    return ShareModel.projectListShare();
  },
})