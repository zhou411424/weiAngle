var rqj = require('../../Template/Template.js');
var app = getApp();
var url = app.globalData.url;
var url_common = app.globalData.url_common;
Page({
  data: {
    describe: "",
    belongArea: "选择城市",
    stage: [],
    stage_index: 0,
    stage_arry: [],
    expect: [],
    expect_index: 0,
    expect_arry: [],
    tips: ["其他", "独家签约", "非独家"],
    tips_index: 4,
    console_stage: "",
    console_expect: "",
    console_tips: "",
    loading: '0',
    pro_goodness: "",
    industryCard: {
      text: "项目领域*",
      url: "/pages/form/industry/industry?current=0",
      css: "",
      value: ["选择领域"],
      id: [],
      modalBox: 0
    }
  },
  onLoad: function (options) {
    var that = this;
    let type = options.type;
    that.setData({
      type: type
    })
    //初始化
    wx.removeStorageSync("industryCurrent0")
    wx.setStorageSync('describe', "");
    wx.setStorageSync('pro_goodness', "");
    wx.setStorageSync('console_stage', 0);
    wx.setStorageSync('console_expect', 0);
    wx.setStorageSync('belongArea', "选择城市");
    wx.setStorageSync('provinceNum', 0);
    wx.setStorageSync('cityNum', 0);
    wx.setStorageSync('tips', 4);
    //请求地区,标签,期望融资,项目阶段数据
    wx.request({
      url: app.globalData.url_common + '/api/category/getProjectCategory',
      method: 'POST',
      success: function (res) {
        var thisData = res.data.data;
        wx.setStorageSync('area', thisData.area);
        wx.setStorageSync('industry', thisData.industry);
        wx.setStorageSync('scale', thisData.scale);
        wx.setStorageSync('stage', thisData.stage);
        //填入项目阶段和期望融资
        var scale = wx.getStorageSync('scale');
        var stage = wx.getStorageSync('stage');
        var expect_arry = [];
        var stage_arry = [];
        scale.unshift({
          scale_id: 0,
          scale_money: "选择融资"
        });
        stage.unshift({
          stage_id: 0,
          stage_name: "选择阶段"
        });
        that.setData({
          stage: stage,
          expect: scale
        });

        for (var i = 0; i < stage.length; i++) {
          stage_arry.push(stage[i].stage_name)
        }
        for (var b = 0; b < scale.length; b++) {
          expect_arry.push(scale[b].scale_money)
        }
        that.setData({
          stage_arry: stage_arry,
          expect_arry: expect_arry
        })
      },
    })
  },
  //页面显示
  onShow: function () {
    var that = this;

    //填入所属领域,项目介绍,所在地区
    var that = this;
    // 项目介绍
    var describe = wx.getStorageSync('describe');
    // 所在地区
    var belongArea = wx.getStorageSync('belongArea');
    // 省的信息
    var provinceNum = wx.getStorageSync('provinceNum');
    // 城市信息
    var cityNum = wx.getStorageSync('cityNum');
    // 项目亮点
    var pro_goodness = wx.getStorageSync('pro_goodness');

    // ------------------项目领域数据处理--------------------------------
    var industryCard = this.data.industryCard;
    var industryCurrent0 = wx.getStorageSync("industryCurrent0");
    app.dealTagsData(that, industryCurrent0, industryCard, "industry_name", "industry_id")

    that.setData({
      industryCard: industryCard,
      describe: describe,
      belongArea: belongArea,
      provinceNum: provinceNum,
      cityNum: cityNum,
      pro_goodness: pro_goodness
    })
  },
  //下拉刷新
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  },
  //项目名称
  projectName: function (e) {
    let projectName = e.detail.value;
    let that = this;
    that.setData({
      projectName: projectName
    })
  },
  //公司名称
  companyName: function (e) {
    let companyName = e.detail.value;
    let that = this;
    that.setData({
      companyName: companyName
    })
  },
  //文本框输入
  bindTextAreaBlur: function (e) {
    var that = this;
    wx.setStorageSync('describe', e.detail.value);
    that.setData({
      describe: e.detail.value
    })
  },
  //项目亮点
  slectInput: function (e) {
    var that = this;
    wx.setStorageSync('pro_goodness', e.detail.value);
    that.setData({
      pro_goodness: e.detail.value
    })
  },

  //是否独家的效果实现
  tipsOn: function (e) {
    var that = this;
    that.setData({
      tips_index: e.target.dataset.tips
    })
  },

  //项目阶段
  stage: function (e) {
    this.setData({
      stage_index: e.detail.value,
    });
  },

  //期望融资
  expect: function (e) {
    this.setData({
      expect_index: e.detail.value,
      console_expect: this.data.expect[this.data.expect_index].scale_id,
    });
  },    
  //关闭模态框
  closeModal: function () {
    this.setData({
      modalBox: 0
    })
  },
  //去电脑上传
  toPc: function () {
    this.setData({
      modalBox: 1
    })
  },
  //上传BP
  upLoad: function () {
    var pro_intro = this.data.describe;//描述
    var industry = this.data.industryCard.id;//id
    var pro_goodness = this.data.pro_goodness;//亮点
    var pro_finance_stage = this.data.stage[this.data.stage_index].stage_id;
    var pro_finance_scale = this.data.expect[this.data.expect_index].scale_id;
    var is_exclusive = this.data.tips_index * 1;
    //弹出PC端url提示文本模态框
    wx.showModal({
      title: "PC上传",
      content: "电脑打开www.weitianshi.cn/qr点击扫一扫",
      showCancel: true,
      confirmText: "扫一扫",
      success: function (res) {
        if (res.confirm) {
          wx.scanCode({
            success: function (res) {
              var user_id = app.globalData.user_id;
              var credential = res.result;//二维码扫描信息
              //发送扫描结果和项目相关数据到后台
              wx.request({
                url: app.globalData.url_common + '/api/auth/writeUserInfo',
                data: {
                  type: 'create',
                  credential: credential,
                  user_id: user_id,
                  pro_data: {
                    "pro_intro": pro_intro,
                    "industry": industry,
                    "pro_finance_stage": pro_finance_stage,
                    "pro_finance_scale": pro_finance_scale,
                    "is_exclusive": is_exclusive,
                    "pro_goodness": pro_goodness
                  }
                },
                method: 'POST',
                success: function (res) {
                  if (res.data.status_code == 2000000) {
                    wx.navigateTo({
                      url: '/pages/scanCode/bpScanSuccess/bpScanSuccess',
                    })
                  }
                }
              })
            },
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  //需要Bp美化
  switchChange1:function(e){
    console.log(e.detail.value)
    let service_ps_bp = e.detail.value;
    if (e.detail.value == false){
      service_ps_bp : 0
    }else{
      service_ps_bp: 1
    }
    this.setData({
      service_ps_bp: service_ps_bp
    })
  },
  //需要融资股份(FA)服务
  switchChange2:function(e){
    let service_fa = e.detail.value;
    if (e.detail.value == false) {
      service_fa: 0
    } else {
      service_fa: 1
    }
    this.setData({
      service_fa: service_fa
    })
  },
  //是否需要云投行服务
  switchChange3:function(e){
    let service_yun = e.detail.value;
    if (e.detail.value == false) {
      service_yun: 0
    } else {
      service_yun: 1
    }
    this.setData({
      service_yun: service_yun
    })
  },
  //私密性设置
  initPrivacy:function(){
     wx.navigateTo({
       url: '/pages/myProject/initPrivacy/initPrivacy',
     })
  },
  //点击发布
  public: function () {
    var that = this;
    let type = this.data.type;
    var theData = that.data;
    let pro_company_name = this.data.companyName;
    let pro_name = this.data.projectName;
    var describe = this.data.describe;
    var pro_goodness = this.data.pro_goodness;
    var industryValue = this.data.industryCard.value;
    var industryId = this.data.industryCard.id;
    var provinceNum = this.data.provinceNum;
    var cityNum = this.data.cityNum;
    var console_stage = this.data.stage[this.data.stage_index].stage_id;
    var console_expect = this.data.expect[this.data.expect_index].scale_id;
    var tips = this.data.tips_index;
    var user_id = app.globalData.user_id;
    let service_ps_bp = this.data.service_ps_bp;
    let service_fa = this.data.service_fa;
    let service_yun = this.data.service_yun;
    let pro_finance_stock_after = this.data.pro_finance_stock_after;
    if (describe !== "" && industryValue !== "选择领域" && console_stage !== 0 && console_expect != 0 && provinceNum !== 0 && cityNum !== 0 && tips !== 4 && pro_goodness !== "") {
      wx.request({
        url: url_common + '/api/project/createProject',
        data: {
          user_id: user_id,
          pro_intro: describe,
          industry: industryId,
          pro_finance_stage: console_stage,
          pro_finance_scale: console_expect,
          pro_area_province: provinceNum,
          pro_area_city: cityNum,
          is_exclusive: tips,
          pro_goodness: pro_goodness,
          pro_company_name: pro_company_name,
          pro_name: pro_name,
          service_ps_bp: service_ps_bp,
          service_fa: service_fa,
          service_yun:service_yun
        },
        method: 'POST',
        success: function (res) {
          if (res.data.status_code == 2000000) {
            //数据清空
            wx.setStorageSync('project_id', res.data.project_id);
            wx.setStorageSync('describe', "");
            wx.setStorageSync('console_stage', 0);
            wx.setStorageSync('console_expect', 0);
            wx.setStorageSync('belongArea', "选择城市");
            wx.setStorageSync('provinceNum', 0);
            wx.setStorageSync('cityNum', 0);
            wx.setStorageSync('tips', 4);
            wx.setStorageSync('enchangeCheck', [])
            wx.setStorageSync('enchangeValue', []);
            wx.setStorageSync('enchangeId', []);
            wx.setStorageSync('pro_goodness', "");
            if (type == 8) {
              wx.navigateBack({
                delta: 1
              })
            } else {
              wx.switchTab({
                url: '/pages/match/match/match/match'
              });
            }
          } else {
            app.errorHide(that, res.data.error_msg, 3000)
          }
        },
      })
    } else {
      app.errorHide(that, "请完整填写信息", 1500)
    }
  },
});