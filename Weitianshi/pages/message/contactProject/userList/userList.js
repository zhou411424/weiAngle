// pages/message/contactProject/userList/userList.js
var rqj = require('../../../Template/Template.js')
var app = getApp();
var url = app.globalData.url;
var url_common = app.globalData.url_common;
Page({

  data: {

  },

  onLoad: function (options) {

  },
  onShow: function () {
    let user_id = wx.getStorageSync('user_id');//获取我的user_id
    let that = this;
    wx.showLoading({
      title: 'loading',
      mask: true,
    })
    wx.request({
      url: url_common + '/api/project/myMeet',
      data: {
        user_id : user_id,
        page: 1
      },
      method: 'POST',
      success: function (res) {
        wx.hideLoading()
        let list = res.data.data;
        let count = res.data.data.count;
        let projectList = res.data.data.projects;
        console.log(projectList)
        that.setData({
          count:count,
          projectList : projectList,
          list : list
        })
      }
    })
    this.setData({
      requestCheck: true,
      currentPage: 1,
      page_end: false
    })
  },
  //跳转项目详情
  projectDetail:function(e){
    console.log(e)
    let project_id = e.currentTarget.dataset.project;
    console.log(project_id)
    // 判斷項目是不是自己的
    wx.request({
      url: url + '/api/project/projectIsMine',
      data: {
        project_id: project_id
      },
      method: 'POST',
      success: function (res) {
        var that = this;
        var userId = res.data.user_id;
        var user = wx.getStorageSync('user_id');
        if (userId == user) {
          wx.navigateTo({
            url: '/pages/myProject/projectDetail/projectDetail?id=' + project_id + '&&index=' + 0
          })
        } else {
          wx.navigateTo({
            url: '/pages/projectDetail/projectDetail?id=' + project_id,
          })
        }
      }
    })
  },
  //下拉加载
  loadMore:function(){
    var that = this;
    let user_id = wx.getStorageSync('user_id');//获取我的user_id
    var currentPage = this.data.currentPage;
    let  projectList = this.data.projectList;
    let list = this.data.list;
    var request = {
      url: url_common + '/api/project/myMeet',
      data: {
        user_id: user_id,
        page: currentPage
      }
    }
    //调用通用加载函数
     app.loadMore2(that, request, res => {
       let rank = res.data.data.projects;
      let page_end = res.data.data.page_end;
      if (rank) {
        let newRank_list = projectList.concat(rank)
        that.setData({
          projectList: newRank_list,
          page_end: page_end,
          requestCheck: true
        })
      }
    })
  }
}) 