import * as request from './utils/httpModel';
import * as OperationModel from './utils/operationModel';
import { picUrl } from './utils/picUrlModel';
//app.js
App({
  // onLaunch 用于监听小程序初始化,当完成时会触发onLaunch(全局只会触发一次)
  onLaunch(options) {
    let url = this.globalData.url;
    let url_common = this.globalData.url_common;

    /* //打开调试模式
    wx.setEnableDebug({
      enableDebug: true,
    }) */

    //如果是在是点击群里名片打开的小程序,则向后台发送一些信息
    if (options.shareTicket) {
      //获取code
      wx.login({
        success: function (login) {
          let code = login.code;
          if (code) {
            let path = options.path;
            let shareTicket = options.shareTicket;
            //获取群ID
            wx.getShareInfo({
              shareTicket: shareTicket,
              success(res) {
                let encryptedData = res.encryptedData;
                let iv = res.iv;
                //向后台发送信息
                wx.request({
                  url: url_common + '/api/log/clickLogRecord',
                  data: {
                    code: code,
                    path: path,
                    encryptedData: encryptedData,
                    iv: iv
                  },
                  method: "POST",
                  success(res) {
                  }
                })
              }
            })
          }
        }
      })
    }

    //获取各分类的信息并存入缓存
    wx.request({
      url: url_common + '/api/category/getProjectCategory',
      method: 'POST',
      success: function (res) {
        // console.log('getProjectCategory',res)
        let thisData = res.data.data;
        thisData.area.forEach((x) => { x.check = false })
        thisData.industry.forEach((x) => { x.check = false })
        thisData.scale.forEach((x) => { x.check = false })
        thisData.stage.forEach((x) => { x.check = false })
        wx.setStorageSync("industry", thisData.industry)
        wx.setStorageSync("scale", thisData.scale)
        wx.setStorageSync("stage", thisData.stage)
      },
    })

    //获取热门城市并存入缓存
    wx.request({
      url: url_common + '/api/category/getHotCity',
      data: {},
      method: 'POST',
      success: function (res) {
        let hotCity = res.data.data;
        hotCity.forEach((x) => {
          x.check = false;
        })
        wx.setStorageSync('hotCity', hotCity)
      }
    });

    //非联动标签的check设置
    function dealLabel(variable, str) {
      variable.forEach(x => {
        x.check = false;
      })
      console.log(str, variable)
      wx.setStorageSync(str, variable)
    }
    //联动标签的check设置
    function dealLabelChild(variable, str) {
      variable.forEach(x => {
        x.check = false;
        x.child.forEach(y => {
          y.check = false;
        })
      })
      console.log(str, variable)
      wx.setStorageSync(str, variable)
    }

    //获取新一代标签并存入缓存 
    this.httpPost({
      url: url_common + '/api/investment/industrylist',
      data: {}
    }).then(res => {
      let label_industry = res.data.data.industry_list;
      dealLabelChild(label_industry, 'label_industry');
      this.httpPost({
        url: url_common + '/api/investment/arealist',
        data: {}
      }).then(res => {
        let label_area = res.data.data.area_list;
        dealLabel(label_area, 'label_area');
        this.httpPost({
          url: url_common + '/api/investment/stylelist',
          data: {}
        }).then(res => {
          let label_style = res.data.data.style_list;
          dealLabel(label_style, 'label_style')
          this.httpPost({
            url: url_common + '/api/investment/typelist',
            data: {}
          }).then(res => {
            let label_type = res.data.data.type_list;
            dealLabel(label_type, 'label_type')
          })
        })
      })
    })
  },
  onError(msg) {
    console.log(msg)
  },

  //进入页面判断是否有open_session
  loginPage(cb) {
    let that = this;
    //群分享打点准备
    /* wx.showShareMenu({
         withShareTicket: true
     })*/
    if (this.globalData.open_session) {
      let timeNow = Date.now();
      let session_time = this.globalData.session_time;
      let differenceTime = timeNow - session_time;
      if (differenceTime > 432000000) {//432000000代表2个小时
        console.log("已超时")
        this.getSession(cb)
      } else {
        typeof cb == "function" && cb(this.globalData.user_id)
      }
    } else {
      this.getSession(cb)//赋值 在这里
    }
  },

  //获取open_session  
  getSession(cb) {
    let that = this;
    //获取code
    wx.login({
      success: function (login) {
        let code = login.code;
        that.globalData.code = code;
        //获取encryptedData和iv
        wx.getUserInfo({
          //用户授权
          success: function (res) {
            that.globalData.userInfo = res.userInfo;//这里,赋完值函数就结束了
            that.globalData.encryptedData = res.encryptedData;
            that.globalData.iv = res.iv;
            wx.request({
              url: that.globalData.url + '/api/wx/returnOauth',
              data: {
                code: code,
                encryptedData: res.encryptedData,
                iv: res.iv,
                app_key: that.globalData.app_key
              },
              method: 'POST',
              success: function (res) {
                console.log("这里是用户授权后调用returnOauth,获取并设置了open_session,session_time,user_id")
                //在globalData里存入open_session,session_time,user_id;
                that.globalData.open_session = res.data.open_session;
                wx.setStorageSync('open_session', res.data.open_session)
                that.globalData.session_time = Date.now();
                that.globalData.user_id = res.data.user_id;
                wx.setStorageSync("user_id", res.data.user_id)
                typeof cb == "function" && cb(wx.getStorageSync("user_id"))
              },
              fail: function () {
                console.log("调用returnOauth失败")
              }
            })
          },
          //用户不授权
          fail: function (res) {
            wx.request({
              url: that.globalData.url + '/api/wx/returnOauth',
              data: {
                code: code,
                app_key: that.globalData.app_key
              },
              method: 'POST',
              success: function (res) {
                console.log("这里是用户没授权后调用returnOauth,获取并设置了open_session,session_time,user_id")
                //在globalData里存入open_session,session_time,user_id;
                that.globalData.open_session = res.data.open_session;
                wx.setStorageSync('open_session', res.data.open_session)
                that.globalData.session_time = Date.now();
                that.globalData.user_id = res.data.user_id;
                wx.setStorageSync("user_id", res.data.user_id)
                typeof cb == "function" && cb(wx.getStorageSync("user_id"))
              },
              fail: function () {
                console.log("调用returnOauth失败")
              },
            })
          },
        })
      }
    })
  },

  //进行授权验证
  getUserInfo(cb) {
    let that = this;
    //如果全局变量里有userInfo就去执行cb函数,如果全局变量里没有userInfo就去调用授权接口
    if (this.globalData.userInfo) {
      console.log("全局变量userInfo存在")
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      console.log("全局变量userInfo不存在")
      //调用登录接口
      wx.login({
        success: function (login) {
          let code = login.code;
          that.globalData.code = code;
          //获取用户信息
          wx.getUserInfo({
            success: function (res) {
              console.log("这里是wx.getUserInfo")
              console.log(res)
              that.globalData.userInfo = res.userInfo;
              that.globalData.encryptedData = res.encryptedData;
              that.globalData.iv = res.iv;
              typeof cb == "function" && cb(that.globalData.userInfo);
            },
            fail: function (res) {
              console.log(res)
            },
            complete: function () {
              //如果已经存在session_time就进行比较,如果不没有就建一个session_time;
              if (that.globalData.session_time) {
                let timeNow = new (Date.now())
              } else {
                that.checkLogin(that);
              }
            }
          })
        }
      })
    }
  },

  //弹框--跳转首页或者完善信息页面(user_id为0)
  noUserId() {
    wx.showModal({
      title: "提示",
      content: "请先绑定个人信息",
      success: function (res) {
        if (res.confirm == true) {
          wx.navigateTo({
            url: '/pages/register/personInfo/personInfo',
          })
        } else {
          wx.switchTab({
            url: '/pages/discoverProject/discoverProject',
          })
        }
      }
    })
  },

  //根据用户信息完整度跳转不同的页面/*注册且信息完善:targetUrl; 注册信息不完善:companyInfo; 未注册: personInfo;*/
  infoJump(targetUrl) {
    let user_id = wx.getStorageSync('user_id');
    // 核对用户信息是否完整
    wx.request({
      url: this.globalData.url_common + '/api/user/checkUserInfo',
      data: {
        user_id: user_id
      },
      method: 'POST',
      success: function (res) {
        if (res.data.status_code == 2000000) {
          let complete = res.data.is_complete;
          if (complete == 1) {
            if (targetUrl) {
              wx.navigateTo({
                url: targetUrl
              })
            }
          } else if (complete == 0) {
            wx.navigateTo({
              url: '/pages/register/companyInfo/companyInfo'
            })
          }
        } else {//后台返回500状态码,可能原因为参数的user_id传了0过去
          wx.navigateTo({
            url: '/pages/register/personInfo/personInfo'
          })
        }
      },
    });
  },

  //industry多选标签数据预处理
  industryDeal(data) {
    if (data.length > 0) {
      let industry = wx.getStorageSync('industry');
      let newIndustry = industry;
      newIndustry.forEach(x => {
        data.forEach(y => {
          if (x.industry_name == y.industry_name) {
            x.check = true
          }
        })
      })
      return newIndustry
    } else {
      return data
    }
  },

  // 多选标签页面间传值显示
  dealTagsData(that, data, dataCard, itemValue, itemId) {
    if (data) {
      dataCard.value = [];
      dataCard.id = [];
      data.forEach((x) => {
        if (x.check == true) {
          dataCard.id.push(x[itemId])
          dataCard.value.push(x[itemValue])
        }
      })
    }
    if (dataCard.value != "选择领域") {
      dataCard.css = "checkOn"
    } else {
      dataCard.css = ""
    }
    console.log(dataCard.value, dataCard.id)
  },

  //多选标签事件封装(tags需要要data里设置相关,str为标签数所字段)
  tagsCheck(that, e, tags, str) {
    let target = e.currentTarget.dataset;
    let tagsData = tags.tagsData;
    let checkObject = [];
    tagsData[target.index].check = !tagsData[target.index].check;
    let checkedNum = 0
    tagsData.forEach((x) => {
      if (x.check == true) {
        checkedNum++
      }
    })
    if (checkedNum >= 6) {
      tagsData[target.index].check = !tagsData[target.index].check;
      this.errorHide(that, "最多可选择五项", 1000)
    } else {
      that.setData({
        [str]: tags
      })
    }
    tagsData.forEach((x) => {
      if (x.check == true) {
        checkObject.push(x)
      }
    })
    return checkObject
  },

  //下拉加载事件封装(request需要设置,包括url和请求request所需要的data,str为展示数据字段,dataStr为取值数据字段)
  /* 初始必须在onShow()里初始化requestCheck:true(防多次请求),currentPage:1(当前页数),page_end:false(是否为最后一页) */
  loadMore(that, request, str, dataStr) {
    let user_id = wx.getStorageSync("user_id");
    let dataSum = that.data[str];
    if (that.data.requestCheck) {
      if (that.data.page_end == false) {
        wx.showToast({
          title: 'loading...',
          icon: 'loading'
        })
        request.data.page++;
        that.setData({
          currentPage: request.data.page,
          requestCheck: false
        });
        //请求加载数据
        wx.request({
          url: request.url,
          data: request.data,
          method: 'POST',
          success: function (res) {
            let newPage = res.data.data;
            if (dataStr && typeof dataStr == "string") {
              newPage = res.data[dataStr];
            }
            console.log(request.data.page, newPage);
            let page_end = res.data.page_end;
            for (let i = 0; i < newPage.length; i++) {
              dataSum.push(newPage[i])
            }
            that.setData({
              [str]: dataSum,
              page_end: page_end,
              requestCheck: true
            })

          },
          complete() {
            wx.hideLoading();
          }
        })
      } else {
        this.errorHide(that, "没有更多了", 3000);
        wx.hideLoading();
        that.setData({
          requestCheck: true
        });
      }
    }
  },
  loadMore2(that, request, callback) {
    let user_id = wx.getStorageSync("user_id");
    if (that.data.requestCheck) {
      if (that.data.page_end == false) {
        wx.showToast({
          title: 'loading...',
          icon: 'loading'
        })
        request.data.page++;
        that.setData({
          currentPage: request.data.page,
          requestCheck: false
        });
        //请求加载数据
        wx.request({
          url: request.url,
          data: request.data,
          method: 'POST',
          success: callback
        })
      } else {
        this.errorHide(that, "没有更多了", 3000)
        that.setData({
          requestCheck: true
        });
      }
    }
  },

  //初始化页面(others为其他要初始化的数据,格式为键值对.如{key:value},常用于上拉加载功能)
  initPage(that, others) {
    let user_id = wx.getStorageSync('user_id');
    that.setData({
      user_id: user_id,
      requestCheck: true,
      currentPage: 1,
      page_end: false
    })
    if (others) {
      that.setData(others)
    }
  },

  //添加人脉
  addContacts(that, addType, user_id, followed_id, callBack1, callBack2) {
    if (addType == 1) {
      wx.request({
        url: url + '/api/user/followUser',
        data: {
          user_id: user_id,
          followed_user_id: followed_id
        },
        method: 'POST',
        success: function (res) {
          callBack1(res)
        }
      })
    } else if (addType == 2) {
      wx.request({
        url: url + '/api/user/UserApplyFollowUser',
        data: {
          user_id: user_id,
          applied_user_id: followed_id
        },
        method: 'POST',
        success: function (res) {
          callBack2(res)
        }
      })
    } else {
      console.log("addType写错了")
    }
  },

  //消除筛选的四个缓存(以实现人脉切到其他tab页再切回来数据初始化)
  contactsCacheClear() {
    wx.removeStorageSync('contactsIndustry');
    wx.removeStorageSync('contactsStage');
    wx.setStorageSync("industryFilter", '');
    wx.setStorageSync("stageFilter", '');
  },

  //重新封装console.log
  console(x) {
    if (this.globalData.url == 'https://wx.weitianshi.cn') {

    } else {
      console.log(x)
    }
  },
  //展开
  allPoint: function (that, i, n = 7) {
    if (i == 0) {
      let checkedArr = {};
      for (let x = 0; x < n; x++) {
        let str1 = 'ischecked' + x;
        checkedArr[str1] = true;
      }
      that.setData({
        checkedArr: checkedArr
      })
    } else {
      let checkedArr = that.data.checkedArr;
      for (let x = 0; x < n; x++) {
        let str1 = 'ischecked' + x;
        checkedArr[str1] = !checkedArr[str1];
      }
      that.setData({
        checkedArr: checkedArr
      })
    }
  },
  //时间戳转换
  changeTime(x) {
    let n;
    if (x.length === 13) {
      n = x * 1
    } else {
      n = x * 1000
    }
    let date = new Date(n);
    let Y = date.getFullYear() + '-';
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    let D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    return (Y + M + D)
  },
  changeTimeStyle(x) {
    let n;
    if (x.length === 13) {
      n = x * 1
    } else {
      n = x * 1000
    }
    let date = new Date(n);
    let Y = date.getFullYear() + '.';
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '.';
    let D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    return (Y + M + D)
  },

  //邮箱检验
  checkEmail(data) {
    let myreg = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
    if (myreg.test(data)) {
      return true
    } else {
      return false
    }
  },

  //错误提示
  errorHide(target, errorText, time) {
    let that = target;
    that.setData({
      error: "1",
      error_text: errorText
    })
    let errorTime = setTimeout(function () {
      that.setData({
        error: "0"
      });
    }, time)
  },

  //头像上传
  headPic(that) {
    let user_id = that.data.user_id;
    let user_info = that.data.user_info;
    let url_common = this.globalData.url_common;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        let tempFilePaths = res.tempFilePaths;
        let avatar = tempFilePaths[0];
        let size = res.tempFiles[0].size;
        if (size <= 1048576) {
          wx.showLoading({
            title: '头像上传中',
            mask: true,
          })
          wx.uploadFile({
            url: url_common + '/api/team/uploadLogo', //仅为示例，非真实的接口地址
            filePath: tempFilePaths[0],
            name: 'avatar',
            formData: {
              user_id: user_id,
            },
            success: function (res) {
              let data = JSON.parse(res.data);
              if (data.status_code === 2000000) {
                wx.hideLoading();
                let image_id = data.data.image_id;
                that.setData({
                  image_id: image_id
                })
              }
            }
          })
          if (user_info.user_avatar_url) {
            user_info.user_avatar_url = tempFilePaths;
          } else if (user_info.user_avatar_text) {
            delete user_info.user_avatar_text;
            user_info.user_avatar_url = tempFilePaths;
          }
          that.setData({
            user_info: user_info
          })
        } else {
          app.errorHide(that, "上传图片不能超过1M", 1500)
        }
      }
    })
  },

  //身份信息
  identity(user_id, func) {
    let url_common = this.globalData.url_common;
    wx.request({
      url: url_common + '/api/user/getUserGroupByStatus',
      data: {
        user_id: user_id
      },
      method: 'POST',
      success: func
    })
  },

  //请求封装
  httpPost(data, that) {
    return request.httpPost(data, that)
  },

  //用户操作模块(util/operationModel)
  operationModel() {
    let func = arguments[0];
    let parameter = [];
    if (typeof func != 'string') {
      console.log('第一个参数必需为调用函数名')
      return
    }
    for (let i = 0; i < arguments.length; i++) {
      if (i > 0) {
        parameter.push(arguments[i])
      }
    }

    switch (parameter.length) {
      case 0:
        OperationModel[func]();
        break;
      case 1:
        OperationModel[func](parameter);
        break;
      default:
        OperationModel[func](...parameter);
        break;
    }
  },

  //分享引导模块跳转
  shareJump(num) {
    switch (num) {
      case '0':
        wx.switchTab({
          url: '/pages/discoverInvest/discoverInvest',
        });
        break;
      case '1':
        wx.switchTab({
          url: '/pages/discoverProject/discoverProject',
        });
        break;
      case '2':
        wx.switchTab({
          url: '/pages/discoverInvest/discoverInvest',
        });
        break;
      default:
        console.log('app.shareJump()参数错数');
        break;
    }
  },

  //投后股份格式校验
  stockCheck(that, pro_finance_stock_after) {
    // 投后股份项数值限定
    function checkNumber(data) {
      var reg = /^\d+\.[0-9]{2}/;
      if (reg.test(data)) {
        return true;
      }
      return false;
    }
    //处理下投后股份数据类型 
    if (isNaN(pro_finance_stock_after)) {
    } else {
      pro_finance_stock_after = Number(Number(pro_finance_stock_after).toFixed(2));
    }
    if (typeof pro_finance_stock_after != 'number' || pro_finance_stock_after < 0 || pro_finance_stock_after > 100) {
      if (pro_finance_stock_after < 0) {
        this.errorHide(that, '投后股份项应该为大于等0的数字', 3000);
      } else if (pro_finance_stock_after > 100) {
        this.errorHide(that, '投后股份项应该为小于等于100的小数位不超过两位的数字', 3000);
      } else if (typeof pro_finance_stock_after != 'number') {
        this.errorHide(that, '投后股份项应该为数字', 3000);
      }
      return;
    }
  },

  //页栈超出处理
  href(url) {
    let pages = getCurrentPages();
    if (pages.length == 5) {
      pages.splice(0, 1)
    }
    wx.navigateTo({
      url: url,
    })
  },


  //初始本地缓存
  globalData: {
    error: 0,
    picUrl: picUrl,
    app_key: 'wxos_lt',
    // url: "https://wx.weitianshi.cn",
    // url_common: "https://wx.weitianshi.cn"
    // url: "https://wx.debug.weitianshi.cn",
    // url_common: "https://wx.debug.weitianshi.cn"
    url: "https://wx.dev.weitianshi.cn",
    url_common: "https://wx.dev.weitianshi.cn"
  },
});