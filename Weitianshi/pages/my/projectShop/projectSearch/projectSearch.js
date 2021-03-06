var app = getApp();
var url = app.globalData.url;
var url_common = app.globalData.url_common;
Page({
  data: {
    otherPerson: false,
    empty: 0
  },
  onLoad: function (options) {
    let user_id = options.user_id;
    this.setData({
      user_id: user_id
    })
  },
  onShow: function () {
    let user_id = this.data.user_id;
    let  that = this;
    //返回上一页时启动onShow;
    let pages = getCurrentPages();
    let pre = pages[pages.length - 2];
    pre.data.firstTime=false;
    that.setData({
      user_id: user_id,
      requestCheck: true,
      currentPage: 1,
      page_end: false,
    })
  },
  //查找项目
  searchSth: function (e) {
    var that = this;
    let user_id = this.data.user_id;
    let currentUser = wx.getStorageSync('user_id');
    that.setData({
      user_id: user_id,
    })
    //判断是不是自己的店铺,如果不是精选项目展示推荐图标
    if (user_id == currentUser) {
      that.setData({
        otherPerson: false,
        user_id: user_id
      })
    } else {
      that.setData({
        otherPerson: true,
        user_id: user_id
      })
    }
    var find = e.detail.value;
    that.setData({
      find : find
    })
    if (find === '') {
      that.setData({
        contacts: '',
        empty: 0
      })
    } else {
      wx.request({
        url: url_common + '/api/project/getMyProjectList',
        data: {
          user_id: user_id,
          page: 1,
          filter: {
            search: find
          }
        },
        method: 'POST',
        success: function (res) {
          var myProject = res.data.data;
          var page_end = res.data.page_end;
          that.setData({
            myProject: myProject
          })
          if (myProject.length !== 0) {
            that.setData({
              empty: 0
            })
          } else {
            that.setData({
              empty: 1
            })
          }
        }
      })
    }
  },
  // 取消
  searchEsc: function () {
    wx.navigateBack({
      delta: 1
    })
  },
  //点击进入项目详情
  detail: function (e) {
    console.log(e)
    let id = e.currentTarget.dataset.id;
    let user_id = this.data.user_id;
    let currentUser = wx.getStorageSync('user_id');
    console.log(user_id)
    console.log(currentUser)
    if (user_id == currentUser) {
      wx.navigateTo({
        url: '/pages/myProject/projectDetail/projectDetail?id=' + id + '&&index=' + 0
      })
    } else if (user_id != currentUser){
      wx.navigateTo({
        url: '/pages/projectDetail/projectDetail?id=' + id,
      })
    }
  },
  // 选中项目
  clickProject: function (e) {
    let that = this;
    let user_id = wx.getStorageSync('user_id');
    let myProject = this.data.myProject;
    let project_id = e.currentTarget.dataset.id;
    let is_top = e.currentTarget.dataset.top;
    wx.request({
      url: url_common + '/api/project/stickProject ',
      data: {
        project_id: project_id,
        user_id: user_id
      },
      method: "POST",
      success: function (res) {
        if (res.data.status_code = 200000) {
          myProject.forEach((x) => {
            if (x.project_id == project_id && is_top == 0) {
              x.is_top = 1
            } else if (x.project_id == project_id && is_top == 1) {
              x.is_top = 0
            }
          })
          that.setData({
            myProject: myProject
          })
        }
        //刷新上一个页栈的排序

      }
    })
  },
  //上拉加载
  myPublicProject: function () {
    console.log(11111)
    //请求上拉加载接口所需要的参数
    var that = this;
    var user_id = this.data.user_id;
    let  find = this.data.find
    var currentPage = this.data.currentPage;
    var request = {
      url: url_common + '/api/project/getMyProjectList',
      data: {
        user_id: user_id,
        page: this.data.currentPage, 
        filter: {
          search: find
        }
      }
    }
    //调用通用加载函数
    app.loadMore(that, request, "myProject")
  },
})