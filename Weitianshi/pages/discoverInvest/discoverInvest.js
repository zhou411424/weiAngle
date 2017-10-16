var app = getApp();
var url = app.globalData.url;
var url_common = app.globalData.url_common;
import * as SearchModel from '../../utils/searchModel';
import * as ShareModel from '../../utils/shareModel';
Page({
  data: {
    investorList: [],
    faList: [],
    myContacts: [],
    //选项卡
    winWidth: 0,
    winHeight: 0,
    currentTab: 0,
    slectProject: '',
    // 筛选搜索
    SearchInit: SearchModel.data,
    activtyBanner: app.globalData.picUrl.activtyBanner,
  },
  onLoad(options){
    if(options.currentTab){
      this.setData({
        currentTab:options.currentTab
      })
    }
  },
  onShow: function () {
    let that = this;
    let user_id = this.data.user_id;
    //初始化数据
    app.initPage(that)
    wx.showLoading({
      title: 'loading',
      mask: true,
    })
    //消除人脉筛选缓存(非contacts都需要)
    app.contactsCacheClear();
    //请求精选项目数据
    app.loginPage(function (user_id) {
      that.setData({
        user_id: user_id
      });
      that.investorList();
    })
  },
  // 点击tab切换
  swichNav: function (e) {
    let that = this;
    let current = e.target.dataset.current;
    that.setData({
      currentTab: e.target.dataset.current
    })
    app.initPage(that);
    this.allReset();
    if (this.data.currentTab === current) {
      this.tabChange(current)
    }
  },
  // 滑动切换tab
  bindChange: function (e) {
    let that = this;
    let current = e.detail.current;
    app.initPage(that);
    this.allReset();
    that.setData({ currentTab: e.detail.current });
    this.tabChange(current);
  },
  // tab页面切换数据调用(辅助函数)
  tabChange(current) {
    if (current === 0) {
      //请求投资人列表
      this.investorList();
    } else if (current === 1) {
      //请求FA列表
      this.faList();
    } else if (current === 2) {
      //请求我的人脉列表
      this.myList();
    }
  },
  //投资人列表信息
  investorList() {
    let that = this;
    let SearchInit = this.data.SearchInit;
    wx.request({
      url: url_common + '/api/investor/getInvestorListByGroup',
      data: {
        user_id: this.data.user_id,
        type: 'investor',
        filter: this.data.SearchInit.searchData
      },
      method: 'POST',
      success: function (res) {
        if (res.data.status_code == '2000000') {
          console.log('投资人列表', res.data.data)
          wx.hideLoading();
          let investorList = res.data.data;
          SearchInit.currentIndex = 5;
          that.setData({
            investorList: investorList,
            SearchInit: SearchInit

          })
        }
      }
    });
  },
  //FA列表信息
  faList() {
    let that = this;
    let SearchInit = this.data.SearchInit;
    wx.request({
      url: url_common + '/api/investor/getInvestorListByGroup',
      data: {
        user_id: this.data.user_id,
        type: 'fa',
        filter: this.data.SearchInit.searchData
      },
      method: 'POST',
      success: function (res) {
        if (res.data.status_code == '2000000') {
          console.log('FA列表', res.data.data)
          wx.hideLoading();
          let faList = res.data.data;
          SearchInit.currentIndex = 5;
          that.setData({
            faList: faList,
            SearchInit: SearchInit
          })
        }
      }
    });
  },
  //我的人脉列表信息
  myList() {
    let user_id = this.data.user_id;
    let that = this;
    let SearchInit = this.data.SearchInit;
    // 检查个人信息全不全
    if (user_id == 0) {
      wx.request({
        url: url_common + '/api/user/checkUserInfo',
        data: {
          user_id: user_id
        },
        method: 'POST',
        success: function (res) {
          that.setData({
            notIntegrity: res.data.is_complete,
            empty: 1
          })
        },
      })
    }
    // 获取人脉库信息
    if (user_id) {
      wx.showLoading({
        title: 'loading',
        mask: true,
      })
      wx.request({
        url: url_common + '/api/user/getMyFollowList',
        data: {
          user_id: user_id,
          page: 1,
          filter: SearchInit.searchData
        },
        method: 'POST',
        success: function (res) {
          wx.hideLoading();
          console.log('我的人脉列表', res);
          if (res.data.status_code == '2000000') {
            let myList = res.data.data;//所有的用户
            let page_end = res.data.page_end;
            SearchInit.currentIndex = 5;
            that.setData({
              myList: myList,
              page_end: page_end,
              SearchInit: SearchInit
            })
          }
        }
      })
    }
  },
  // 用户详情
  userDetail: function (e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/userDetail/networkDetail/networkDetail?id=' + id,
    })
  },
  // 上拉加载
  loadMore: function () {
    //请求上拉加载接口所需要的参数
    let that = this;
    let user_id = this.data.user_id;
    let currentPage = this.data.currentPage;
    let currentTab = this.data.currentTab;
    switch (currentTab) {
      case 0:
        {
          let request = {
            url: url_common + '/api/investor/getInvestorListByGroup',
            data: {
              user_id: user_id,
              type: 'investor',
              page: this.data.currentPage,
              filter: this.data.SearchInit.searchData
            }
          }
          //调用通用加载函数
          app.loadMore(that, request, "investorList")
        }
        break;
      case 1:
        {
          let request = {
            url: url_common + '/api/investor/getInvestorListByGroup',
            data: {
              user_id: user_id,
              type: 'fa',
              page: this.data.currentPage,
              filter: this.data.SearchInit.searchData
            }
          }
          //调用通用加载函数
          app.loadMore(that, request, "faList")
        }
        break;
      case 2:
        {
          let request = {
            url: url_common + '/api/project/getMarketProjectList',
            data: {
              user_id: user_id,
              page: this.data.currentPage,
              filter: this.data.SearchInit.searchData
            }
          }
          //调用通用加载函数
          app.loadMore(that, request, "myList")
        }
        break;
    }
  },
  // 分享当前页面
  onShareAppMessage: function () {
    return ShareModel.discoverInvestShare();
  },
  // 项目推送
  projectPush(e) {
    console.log(1)
    let pushTo_user_id = e.currentTarget.dataset.id;
    app.operationModel('projectPush', pushTo_user_id);
  },
  // 申请加人脉
  contactsAdd(e) {
    let added_user_id = e.currentTarget.dataset.id;
    let that = this;
    app.operationModel('contactsAdd', added_user_id, function (res) {
      console.log('申请添加人脉完成', res);
      that.contactsAddSuccessFunc(res, added_user_id, 2);
    });
  },
  // 直接加人脉
  contactsAddDirect(e) {
    let added_user_id = e.currentTarget.dataset.id;
    let that = this;
    app.operationModel('contactsAddDirect', added_user_id, function (res) {
      console.log('直接添加人脉完成', res)
      that.contactsAddSuccessFunc(res, added_user_id, 1);
    });
  },
  // 加人脉成功后处理(辅助函数)
  contactsAddSuccessFunc(res, added_user_id, num) {
    let that = this;
    let investorList = this.data.investorList;
    let faList = this.data.faList
    if (res.data.status_code == 2000000) {
      //更改投资人和FA列表中该人的加人脉按钮的字段
      if (investorList) {
        investorList.forEach(x => {
          if (x.user_id == added_user_id) {
            x.follow_status = num
          }
        })
        that.setData({
          investorList: investorList
        })
      }
      if (faList) {
        console.log(faList, added_user_id)
        faList.forEach(x => {
          if (x.user_id == added_user_id) {
            x.follow_status = num
          }
        })
        that.setData({
          faList: faList
        })
      }
    } else {
      app.errorHide(that, res.data.error_Msg, 3000)
    }
  },
  //找项目投资人
  matchInvestor() {
    wx.navigateTo({
      url: '/pages/matchInvestor/matchInvestor'
    })
  },
  //活动详情
  goTo: function () {
    wx.navigateTo({
      url: '/pages/contactsActivty/activtyDetail/activtyDetail',
    })
  },
  // ------------------------------------筛选搜索-------------------------------------
  // 下拉框
  move(e) {
    let that = this;
    SearchModel.move(e, that)
  },
  // 标签选择
  tagsCheck(e) {
    let that = this;
    SearchModel.tagsCheck(e, that)
  },
  // 筛选重置
  reset() {
    let that = this;
    SearchModel.reset(that)
  },
  // 全部筛选重置
  allReset() {
    let that = this;
    SearchModel.allReset(that);
  },
  // 筛选确定
  searchCertain() {
    let that = this;
    let searchData = SearchModel.searchCertain(that);
    let current = this.data.currentTab;
    if (current == 0) {
      console.log('筛选投资人', searchData);
      this.investorList();
    } else if (current == 1) {
      console.log('筛选FA', searchData);
      this.faList();
    } else if (current == 2) {
      console.log('筛选我的', searchData);
      this.myList();
    } else {
      console.log('searchCertain()出错了')
    }
  },
  // 点击modal层
  modal() {
    let that = this;
    SearchModel.modal(that)
  },
  //搜索
  searchSth() {
    let that = this;
    let currentTab = this.data.currentTab;
    let str;
    switch (currentTab) {
      case 0:
        str = 'investorList';
        break;
      case 1:
        str = 'faList';
        break;
      case 2:
        str = 'myList';
        break;
    }
    SearchModel.searchSth(that, str)
  },

  //---------------------------我的人脉--------------------------------------------------------------
  // 一键拨号
  telephone: function (e) {
    let telephone = e.currentTarget.dataset.telephone;
    wx.makePhoneCall({
      phoneNumber: telephone,
    })
  },
})