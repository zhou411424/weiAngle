// pages/organization/org_search/org_search.js
var app = getApp();
var url = app.globalData.url;
var url_common = app.globalData.url_common;
import * as SearchModel from '../../../utils/searchModel';
import * as ShareModel from '../../../utils/shareModel';
Page({
  data: {
    currentTab: 0,
    investment_list: [],
    memberList: [],
    industry_list: []
  },
  onLoad: function (options) {

  },
  onShow: function () {
    let that = this;
    let timer = this.data.timer;
    let currentTab = this.data.currentTab;
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(x => {
      wx.showLoading({
        title: 'loading',
        mask: true
      })
      app.httpPost({
        url: url_common + '/api/investment/search',
        data: {
        }
      }).then(res => {
        wx.hideLoading()
        let searchData = res.data.data;
        console.log(searchData)
        let investment_list = [];
        let memberList = [];
        let industry_list = [];
        that.setData({
          searchData: searchData,
          memberList: searchData.member_list,
          industry_list: searchData.industry_list,
          investment_list: searchData.investment_list.list
        })
        wx.hideLoading();
      })
    }, 1500)
    this.setData({
      timer: timer,
      requestCheck: true,
      requestCheckBoolean: true,
      currentPage: 1,
      otherCurrentPage: 1,
      page_end: false,
      page_endBoolean: false,
      push_page: 1
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
  },
  //加载更多
  loadMore(e) {
    let current = e.currentTarget.dataset.current;
    switch (current) {
      case '1':
        this.investmentList();
        break;
      case '3':
        this.memberList();
        break;
    }
  },
  // 滑动切换tab
  bindChange: function (e) {
    let that = this;
    let current = e.detail.current;
    app.initPage(that);
  },
  //搜索事件
  searchSth: function (e) {
    let that = this;
    let str = e.detail.value;
    let timer = this.data.timer;
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(x => {
      wx.showLoading({
        title: 'loading',
        mask: true
      })
      app.httpPost({
        url: url_common + '/api/investment/search',
        data: {
          word: str
        }
      }).then(res => {
        wx.hideLoading()
        let investment_list = res.data.data.investment_list.list;
        let memberList = res.data.data.member_list;
        let industry_list = res.data.data.industry_list;
        that.setData({
          investment_list: investment_list,
          memberList: memberList,
          industry_list: industry_list,
          word : str
        })
        wx.hideLoading();
      })
    }, 1500)
    this.setData({
      timer: timer,
    })
  },
  //取消
  searchEsc: function () {
    wx.navigateBack({
      delta: 1
    })
  },
  //机构成员跳转
  findMember(e) {
    console.log(e)
    let investment_id = e.currentTarget.dataset.memberid;
    app.href('/pages/organization/org_detail/org_detail?investment_id=' + investment_id)
  },
  //机构详情跳转 
  institutionalDetails(e) {
    let investment_id = e.currentTarget.dataset.id;
    app.href('/pages/organization/org_detail/org_detail?investment_id=' + investment_id)
  },
  //跳转投资领域
  toIndustry() {
    let that = this;
    let searchData = this.data.searchData;
    let industry_list = searchData.industry_list;
    that.setData({
      currentTab: 2,
      industry_list: industry_list
    });
  },
  //跳转投资机构
  investment() {
    let that = this;
    let searchData = this.data.searchData;
    let industry_list = searchData.industry_list;
    that.setData({
      currentTab: 1,
      industry_list: industry_list
    });
  },
  //跳转机构成员
  toMember() {
    let that = this;
    let searchData = this.data.searchData;
    let memberList = searchData.member_list;
    that.setData({
      currentTab: 3,
      memberList: memberList
    });
  },

  memberList: function () {
    let that = this;
    let memberList = this.data.memberList;
    if(this.data.word){
      let word = this.data.word
      console.log(word)
    }
    if (that.data.requestCheckBoolean) {
        if (that.data.page_endBoolean == false) {
          wx.showToast({
            title: 'loading...',
            icon: 'loading'
          })
          that.data.push_page++;
          that.setData({
            otherCurrentPage: this.data.push_page,
            requestCheckBoolean: false
          });
          //请求加载数据
          wx.request({
            url: url_common + '/api/investment/search',
            data: {
              page: this.data.otherCurrentPage,
            
            },
            method: 'POST',
            success: function (res) {
              var newPage = res.data.data.member_list.list;
              var page_end = res.data.data.member_list.page_end;
              for (var i = 0; i < newPage.length; i++) {
                memberList.list.push(newPage[i])
              }
              that.setData({
                memberList: memberList,
                page_endBoolean: page_end,
                requestCheckBoolean: true
              })
            }
          })
        } else {
          app.errorHide(that, "没有更多了", that, 3000)
          that.setData({
            requestCheckBoolean: true
          });
        }
      }
  },
  investmentList(){
    let that = this;
    let currentPage = this.data.currentPage;
    let investment_list = this.data.investment_list;
    var request = {
      url: url_common + '/api/investment/search',
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
        if (page_end == true) {
          app.errorHide(that, '没有更多了', 3000)
        }
      }
    })
  }
})