let rqj = require('../../Template/Template.js');
let app = getApp();
let url = app.globalData.url;
let url_common = app.globalData.url_common;
import * as ShareModel from '../../../utils/shareModel';
Page({
  data: {
    user: "",
    followed_user_id: "",
  },
  onLoad: function (options) {
    console.log('this is sharePage')
    let that = this;
    let followed_user_id = options.user_id;
    let share_id = options.share_id;
    that.setData({
      followed_user_id: followed_user_id,
      share_id: share_id
    })
    //登录态维护
    app.loginPage(function (user_id) {
      let view_id = user_id;
      wx.setStorageSync('user_id', user_id);
      //载入被分享者的个人信息
      wx.request({
        url: url_common + '/api/user/getUserAllInfo',
        data: {
          share_id: share_id,
          user_id: followed_user_id,
          view_id: view_id,
        },
        method: 'POST',
        success: function (res) {
          let user = res.data.user_info;
          let count = res.data.count;
          console.log(count)
          let invest = res.data.invest_info;
          let resource = res.data.resource_info;
          let project_info = res.data.project_info;
          let invest_case = res.data.invest_case;
          let button_type = res.data.button_type;
          that.setData({
            user: user,
            invest: invest,
            resource: resource,
            project_info: project_info,
            invest_case: invest_case,
            button_type: button_type,
            count: count,
            view_id: view_id
          })
          wx.setNavigationBarTitle({
            title: res.data.user_info.user_real_name + "的投资名片",
          })
        },
        fail: function (res) {
          console.log(res)
        },
      })
      console.log("分享者", "数据显示的人", "查看的人")
      console.log(share_id, followed_user_id, view_id)
      //如果进入的是自己的名片里
      if (user_id == followed_user_id) {
        wx.switchTab({
          url: '/pages/my/myNew/myNew',
        })
      }
      that.setData({
        user_id: user_id,
      })
      //查看是否注册
      wx.request({
        url: url_common + '/api/user/checkUserInfo',
        data: {
          user_id: user_id
        },
        method: 'POST',
        success: function (res) {
          if (res.data.status_code == 2000000) {
            let complete = res.data.is_complete;
            that.setData({
              complete: complete
            })
          }
        },
      });
    })

  },

  // 添加人脉
  addNetwork: function () {
    let that = this;
    let user_id = this.data.user_id;//我的id,查看者的id
    let followed_user_id = this.data.followed_user_id;//当前被查看的用户id;
    let button_type = this.data.button_type;
    let view_id = this.data.view_id;
    // button_type==0  0.申请加人脉按钮 1.不显示任何按钮  2.待验证   3.同意加为人脉  4.加为单方人脉
    //直接可添加好友的情况
    if (button_type == 0) {
      //走正常申请流程
      wx.request({
        url: url_common + '/api/user/checkUserInfo',
        data: {
          user_id: user_id
        },
        method: 'POST',
        success: function (res) {
          if (res.data.status_code == 2000000) {
            let complete = res.data.is_complete;
            if (complete == 1) {
              //如果信息完整就正常申请添加人脉
              wx.request({
                url: url + '/api/user/UserApplyFollowUser',
                data: {
                  user_id: user_id,
                  applied_user_id: followed_user_id
                },
                method: 'POST',
                success: function (res) {
                  that.setData({
                    button_type: 2
                  })
                }
              })
            } else if (complete == 0) {
              wx.setStorageSync('followed_user_id', followed_user_id)
              wx.navigateTo({
                url: '/pages/register/companyInfo/companyInfo'
              })
            }
          } else {
            wx.setStorageSync('followed_user_id', followed_user_id)
            wx.navigateTo({
              url: '/pages/register/personInfo/personInfo'
            })
          }
        },
      });
    } else if (button_type == 1) {
      console.log("互為好友或單方人脈")
    } else if (button_type == 2) {
      console.log("待驗證")
    } else if (button_type == 3) {
      wx.request({
        url: url + '/api/user/handleApplyFollowUser',
        data: {
          // 当前登录者的
          user_id: user_id,
          // 当前申请的用户
          apply_user_id: followed_user_id
        },
        method: 'POST',
        success: function (res) {
          that.setData({
            button_type: 1
          })
          wx.showModal({
            title: '提示',
            content: '去小程序查看我的人脉库',
            confirmText: '去看看',
            success: function (res) {
              if (res.confirm) {
                wx.switchTab({
                  url: '/pages/discoverInvest/discoverInvest',
                })
              } else if (res.cancel) {
              }
            }
          })
        }
      })
    } else if (button_type == 4) {
      wx.setStorageSync('followed_user_id', followed_user_id)
      wx.setStorageSync("driectAdd", 1)
      //判断用户信息是否完整
      wx.request({
        url: url_common + '/api/user/checkUserInfo',
        data: {
          user_id: user_id
        },
        method: 'POST',
        success: function (res) {
          if (res.data.status_code == 2000000) {
            let complete = res.data.is_complete;
            if (complete == 1) {
              //如果信息完整就直接添加人脉
              wx.request({
                url: url + '/api/user/followUser',
                data: {
                  user_id: user_id,
                  followed_user_id: followed_user_id
                },
                method: 'POST',
                success: function (res) {
                  that.setData({
                    button_type: 1
                  })
                  wx.showModal({
                    title: '提示',
                    content: '去小程序查看我的人脉库',
                    confirmText: '去看看',
                    success: function (res) {
                      if (res.confirm) {
                        wx.switchTab({
                          url: '/pages/discoverInvest/discoverInvest',
                        })
                      } else if (res.cancel) {
                        console.log('用户点击取消')
                      }
                    }
                  })
                }
              })
            } else if (complete == 0) {
              //如果有user_id但信息不全则跳companyInfo页面
              wx.navigateTo({
                url: '/pages/register/companyInfo/companyInfo'
              })
            }
          } else {
            //如果没有user_id则跳personInfo
            wx.navigateTo({
              url: '/pages/register/personInfo/personInfo'
            })
          }
        },
      });
    } else {
      showModal({
        title: "错误提示",
        content: "button_type为" + button_type
      })
    }
  },
  // 二维码分享按钮
  shareSth: function (e) {
    let QR_id = e.currentTarget.dataset.clickid;
    wx.setStorageSync('QR_id', QR_id)
    wx.navigateTo({
      url: '/pages/my/qrCode/qrCode',
    })
  },
  //分享页面部分
  onShareAppMessage: function () {
    let that = this;
    return ShareModel.sharePageShare(that);
  },
  //项目融资
  projectFinance: function () {
    let followed_user_id = this.data.followed_user_id;
    wx.navigateTo({
      url: '/pages/my/projectShop/projectShop/projectShop?currentTab=1' + '&&followed_user_id=' + followed_user_id,
    })
  },
  //融资项目详情
  financingDetail: function (e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/projectDetail/projectDetail?id=' + id,
    })
  },
  //跳转到我的人脉
  toContactsMy: function () {
    wx.switchTab({
      url: '/pages/my/myNew/myNew',
    })
  },
  //跳转注册
  toContacts: function () {
    //走正常申请流程
    let user_id = this.data.user_id;//我的id,查看者的id
    let followed_user_id = this.data.followed_user_id; 
    wx.request({
      url: url_common + '/api/user/checkUserInfo',
      data: {
        user_id: user_id
      },
      method: 'POST',
      success: function (res) {
        if (res.data.status_code == 2000000) {
          let complete = res.data.is_complete;
          if (complete == 1) {
          
          } else if (complete == 0) {
            wx.setStorageSync('followed_user_id', followed_user_id)
            wx.navigateTo({
              url: '/pages/register/companyInfo/companyInfo'
            })
          }
        } else {
          wx.setStorageSync('followed_user_id', followed_user_id)
          wx.navigateTo({
            url: '/pages/register/personInfo/personInfo'
          })
        }
      },
    });
  },
  // 跳转到推送项目页面
  pushProject: function () {
    // 推送给数据显示的人 push_id = followed_user_id
    //查看的人 view_id = user_id

    let share_id = this.data.share_id;
    let view_id = this.data.view_id;
    let push_id = this.data.followed_user_id;
    wx.request({
      url: url_common + '/api/user/checkUserInfo',
      data: {
        user_id: view_id
      },
      method: 'POST',
      success: function (res) {
        if (res.data.status_code == 2000000) {
          let complete = res.data.is_complete;
          if (complete == 1) {
            //如果信息完整就正常申请添加人脉
            wx.navigateTo({
              url: '/pages/myProject/pushTo/pushTo?user_id=' + view_id + '&&pushId=' + push_id,
            })
          } else if (complete == 0) {
            wx.navigateTo({
              url: '/pages/register/companyInfo/companyInfo'
            })
          }
        } else {
          wx.navigateTo({
            url: '/pages/register/personInfo/personInfo'
          })
        }
      },
    });
  },
  //分享引导跳转
  shareJump(e) {
    let index = e.currentTarget.dataset.index;
    app.shareJump(index);
  }
}); 