var rqj = require('../../Template/Template.js');
var app = getApp();
var url = app.globalData.url;
var url_common = app.globalData.url_common;
import * as ShareModel from '../../../utils/shareModel';
Page({
  data: {
    modalBox: 0,
    modal: 0,
  },
  onLoad: function (options) {

  },

  onShow: function () {
    //消除人脉缓存
    app.contactsCacheClear();
    var that = this
    app.loginPage(function (user_id) {
      that.setData({
        user_id: user_id,
      })
      //分享至群打点准备
      /* wx.showShareMenu({
         withShareTicket: true,
       })*/
      if (user_id != 0) {
        wx.showLoading({
          title: 'loading',
          mask: true,
        })
        //载入我的个人信息
        wx.request({
          url: url_common + '/api/user/myInfo',
          data: {
            share_id: 0,
            user_id: user_id,
            view_id: user_id,
          },
          method: 'POST',
          success: function (res) {
            console.log('myInfo',res)
            wx.hideLoading()
            var user = res.data.data.user;
            var count = res.data.data.count;
            var invest = res.data.data.invest_info;
            var resource = res.data.data.resource_info;
            var project_info = res.data.data.project_info;
            var user_name = res.data.data.user.user_real_name;
            let user_company_name= res.data.data.user.user_company_name;
            // wx.setNavigationBarTitle({
            //   title: user_name + "的投资名片",
            // })
            that.setData({
              user: user,
              invest: invest,
              resource: resource,
              project_info: project_info,
              count: count,
              user_company_name : user_company_name
            })
          },
          fail: function (res) {
            console.log(res)
          },
        })
      } else {
        app.noUserId()
      }
      wx.request({
        url: url_common + '/api/user/getUserGroupByStatus',
        data: {
          user_id: user_id
        },
        method: 'POST',
        success: function (res) {
          // 0:未认证1:待审核 2 审核通过 3审核未通过
          let status = res.data.status;
          if (status != 0) {
            let group_id = res.data.group.group_id;
            that.setData({
              group_id: group_id
            })
          }
          that.setData({
            status: status
          })
        }
      })
    })

  },
  //进入我的名片
  toMyCard: function () {
    wx.navigateTo({
      url: '/pages/my/my/my',
    })
  },
  //人气
  popularity: function () {
    wx.navigateTo({
      url: '/pages/message/browseMe/browseMe'
    })
  },
  //头像编辑
  avatarEdit() {
    wx.navigateTo({
      url: '/pages/my/cardEdit/cardEdit',
    })
  },
  //加我为人脉
  attention: function () {
    wx.navigateTo({
      url: '/pages/message/beAddedContacts/beAddedContacts'
    })
  },
  //潜在项目
  pushTo: function () {
    wx.navigateTo({
      url: '/pages/message/potentialProject/potentialProject'
    })
  },
  //身份验证
  identity: function (e) {
    let status = this.data.status;
    var user_id = wx.getStorageSync('user_id');
    // 0未认证 1待审核 2 认证成功 3 拒绝
    wx.request({
      url: url_common + '/api/user/checkUserInfo',
      data: {
        user_id: user_id
      },
      method: 'POST',
      success: function (res) {
        if (res.data.status_code == 2000000) {
          var complete = res.data.is_complete;
          // if (complete == 1) {
          //   //如果信息完整就可以显示去认证
          if (status == 0) {
            wx.navigateTo({
              url: '/pages/my/identity/indentity/indentity',
            })
          } else if (status == 1) {
            wx.navigateTo({
              url: '/pages/my/identity/identityResult/identityResult?type=' + 1,
            })
          } else if (status == 2) {
            wx.navigateTo({
              url: '/pages/my/identity/identityResult/identityResult?type=' + 2,
            })
          } else if (status == 3) {
            wx.navigateTo({
              url: '/pages/my/identity/identityResult/identityResult?type=' + 3,
            })
          }
        } else if (complete == 0) {
          wx.navigateTo({
            url: '/pages/register/companyInfo/companyInfo?type=1'
          })
        }
        // } else {
        //   wx.navigateTo({
        //     url: '/pages/register/personInfo/personInfo?type=2'
        //   })
        // }
      },
    });
  },
  //项目店铺
  projectShop: function () {
    wx.navigateTo({
      url: '/pages/my/projectShop/projectShop/projectShop',
    })
  },
  //约谈的项目
  contactProject: function () {
    wx.navigateTo({
      url: '/pages/message/contactProject/userList/userList',
    })
  },
  //收藏的项目
  collectProject: function () {
    // wx.navigateTo({
    //   url: '/pages/message/collectProject/collectProject',
    // })
    let that = this;
    app.errorHide(that, "收藏项目近期开放", 3000);
  },
  //分享页面
  onShareAppMessage: function () {
    let that = this;
    return ShareModel.myCardShare(that);
  },
  // 查税号
  searchIdentification: function (e) {
    var that = this;
    var user_id = this.data.user_id;
    var modal = this.data.modal;
    var com_name = this.data.user_company_name;
    var status_code = this.data.status_code;
    wx.request({
      url: url_common + '/api/dataTeam/taxNumber',
      data: {
        user_id: user_id,
        com_name: com_name
      },
      method: 'POST',
      success: function (res) {
        console.log(res)
        let data = res.data;
        if (data.status_code == 460004) {
          that.setData({
            modalStyle: 1,
            modalBox: 1
          })
        } else if (data.status_code == 2000000) {
          that.setData({
            modalStyle: 0,
            modalBox: 1
          })
          let data = res.data.data;
          let com_name = data.com_name;
          var tax_member = data.tax_mumber;
          that.setData({
            data: data,
            com_name: com_name,
            tax_member: tax_member,
            modalStyle: 0
          })
        }
      }
    })
  },
  //完善公司信息
  writeInformation: function () {
    wx.navigateTo({
      url: '/pages/my/cardEdit/cardEdit',
    })
    this.setData({
      modalBox: 0
    })
  },
  //确定或稍后再试
  laterOn: function () {
    wx.switchTab({
      url: '/pages/my/myNew/myNew',
    })
    this.setData({
      modalBox: 0
    })
  },
  //复制税号
  copyNum: function () {
    let num = this.data.tax_member;
    wx.setClipboardData({
      data: num,
      success: function (res) {
        wx.showToast({
          title: '复制成功',
          icon: 'success'
        })
        wx.getClipboardData({
          success: function (res) {
          }
        })
      }
    })
  },
  //点击modal后消失
  hideModal() {
    let modal = this.data.modal;
    this.setData({
      modal: 0
    })
  },
  // 二维码分享按钮
  shareSth: function (e) {
    var QR_id = e.currentTarget.dataset.clickid;
    wx.setStorageSync('QR_id', QR_id)
    wx.navigateTo({
      url: '/pages/my/qrCode/qrCode',
    })
  },
})