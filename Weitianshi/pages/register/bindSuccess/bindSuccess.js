// pages/register/bindSuccess/bindSuccess.js
var rqj = require('../../Template/Template.js');
var app = getApp();
var url = app.globalData.url;
var url_common = app.globalData.url_common;
Page({
  data: {
    imgUrls: app.globalData.picUrl.band_identity
  },

  onLoad: function (options) {
  let  type = options.type;
  console.log(options)
  this.setData({
    type : type
  })
  },

  onShow: function () {
  
  },
  btnYes:function(){
    let type = this.data.type;
    console.log(type)
    if (type == 1) {
      let pages = getCurrentPages();
      let num = pages.length - 1;
      console.log(pages)
      wx.navigateBack({
        delta: 2
      })
    } else {
      if (type == 2) {
        let pages = getCurrentPages()
        console.log(pages)
        let num = pages.length - 1;
        wx.navigateBack({
          delta: 3
        })
      } else {
        console.log("主页")
        wx.switchTab({
          url: "/pages/discoverProject/discoverProject"
        });
      }
    }
  }
})