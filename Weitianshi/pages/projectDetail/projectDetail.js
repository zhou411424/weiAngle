var rqj = require('../Template/Template.js')
var app = getApp();
var url = app.globalData.url;
var url_common = app.globalData.url_common;
import * as ShareModel from '../../utils/shareModel';
Page({
  data: {
    firstName: "代",
    id: "",
    page: 0,
    aa: [],
    bpName: "",
    projectName: "",
    companyName: "",
    stock: 0,
    load: 0,
    isChecked: true,
    textBeyond1: false,//项目亮点的全部和收起是否显示标志
    modalBox: 0,
    currentTab: 0,//选项卡
    show_detail: false,
    show_company: false,
  },
  onLoad: function (options) {
    var that = this;
    var id = options.id;//当前被查看用户的项目id
    var page = this.data.page;
    var user_id = '';
    var share_id = '';
    var view_id = '';
    var user_id = wx.getStorageSync('user_id');
    that.setData({
      user_id: user_id,
      id: id,
      share_id: options.share_id
    });

    this.identityInfo(that);

    //判断页面进入场景    option.share_id存在是分享页面,share_id不存在则不是分享页面
    if (!options.share_id) {
      that.showStatus(that, id, "");
    } else {
      app.loginPage(function (user_id) {
        that.setData({
          user_id: user_id,
        })
        that.showStatus(that, id, "share");
      })
    }
  },

  /* -----------------------数据获取------------------------------------------- */
  //是否完成身份认证状态
  identityInfo(that) {
    let user_id = wx.getStorageSync('user_id');
    if (user_id) {
      wx.request({
        url: url_common + '/api/user/getUserGroupByStatus',
        data: {
          user_id: user_id
        },
        method: 'POST',
        success: function (res) {
          // 0:未认证1:待审核 2 审核通过 3审核未通过
          let status = res.data.status;
          that.setData({
            status: status
          })
        }
      })
    } else {
      that.setData({
        status: 5
      })
    }
  },

  //项目详情(无效)
  getInfo(that, user_id, id) {
    wx.showLoading({
      title: 'loading',
      mask: true,
    })
    wx.request({
      url: url_common + '/api/project/getProjectDetail',
      data: {
        user_id: user_id,
        project_id: id
      },
      method: 'POST',
      success: function (res) {
        wx.hideLoading()
        // button_type:0->待处理 1->不显示任何内容(1.自己看自己2.推送的3.已经申请通过的) 2->申请被拒绝 3->申请按钮
        var project = res.data.data;
        console.log(res)
        console.log(project)
        if (project.pro_BP) {
          let BPath = project.pro_BP.file_url;
          that.setData({
            BPath: BPath
          })
        }
        var user = res.data.user;
        var firstName = user.user_name.substr(0, 1) || '';
        var pro_industry = project.pro_industry;
        var pro_company_name = project.pro_company_name;
        let industy_sort = [];
        let pro_goodness = project.pro_goodness;
        let button_type = res.data.button_type;
        console.log(button_type)
        let currentUser = user.user_id;
        //判断是不是自己的项目
        if (currentUser === user_id) {
          wx.navigateTo({
            url: 'pages/myProject/projectDetail/projectDetail?id=' + that.data.id,
          })
          return
        }
        // 项目介绍的标签
        if (button_type == 2 || button_type == 3) {
          for (var i = 0; i < pro_industry.length; i++) {
            industy_sort.push(pro_industry[i].industry_name)
          }
          that.setData({
            industy_sort: industy_sort,
            button_type: button_type,
            currentUser: currentUser
          })
          if (pro_goodness.length > 50) {
            that.setData({
              textBeyond1: true
            })
          }
        }
        var firstName = user.user_name.substr(0, 1);
        // 如果项目亮点字数超出字,刚显示全部按钮
        that.setData({
          project: project,
          user: user,
          firstName: firstName,
          pro_company_name: pro_company_name
        });
        // if (button_type == 1 || button_type == 2 || button_type == 3)
        if (button_type == 1) {
          // 项目介绍的标签
          var pro_industry = project.pro_industry;
          for (var i = 0; i < pro_industry.length; i++) {
            industy_sort.push(pro_industry[i].industry_name)
          }
          that.setData({
            industy_sort: industy_sort,
            pro_industry: pro_industry
          })
          if (pro_goodness.length > 50) {
            that.setData({
              textBeyond1: true
            })
          }
          // 核心团队
          if (project.core_users) {
            let core_memberArray = project.core_users;
            core_memberArray.forEach((x, index) => {
              core_memberArray[index] = x;
            })
            that.setData({
              core_memberArray: core_memberArray
            })
          }
          // 标签 type:0; 项目标签 type:1 团队标签
          let infoTagArray = project.tag;
          let tagOfPro = [];//项目资料的标签
          let teamOfPro = [];//核心团队的标签//核心团队的标签
          for (var i = 0; i < infoTagArray.length; i++) {
            if (infoTagArray[i].type == 0) {
              tagOfPro.push(infoTagArray[i])
            } else if (infoTagArray[i].type == 1) {
              teamOfPro.push(infoTagArray[i])
            }
          }
          tagOfPro.forEach((x, index) => {
            tagOfPro[index].tag_name = x.tag_name;
          })
          that.setData({
            tagOfPro: tagOfPro
          })
          teamOfPro.forEach((x, index) => {
            teamOfPro[index].tag_name = x.tag_name;
          })
          that.setData({
            teamOfPro: teamOfPro
          })
          // 融资信息
          let pro_history_financeList = project.pro_history_finance;
          pro_history_financeList.forEach((x, index) => {
            pro_history_financeList[index].finance_time = app.changeTime(x.finance_time);
            pro_history_financeList[index].pro_finance_scale = x.pro_finance_scale;
            pro_history_financeList[index].pro_finance_investor = x.pro_finance_investor;
            pro_history_financeList[index].belongs_to_stage.stage_name = x.belongs_to_stage.stage_name;

          })
          that.setData({
            pro_history_financeList: pro_history_financeList
          })
          // 里程碑
          let mileStoneArray = project.pro_develop;
          mileStoneArray.forEach((x, index) => {
            mileStoneArray[index].dh_start_time = app.changeTime(x.dh_start_time);
            mileStoneArray[index].dh_event = x.dh_event;
          })

          that.setData({
            mileStoneArray: mileStoneArray,
            industy_sort: industy_sort,
            pro_goodness: pro_goodness
          });
        }
        var followed_user_id = res.data.user.user_id;
        that.setData({
          project: project,
          user: user,
          firstName: firstName,
          pro_industry: pro_industry,
          followed_user_id: followed_user_id,
          button_type: button_type
        });
      }
    })
  },

  //是否能查看项目详情和买家图谱,一键尽调状态获取
  showStatus(that, pro_id, is_share, show_company) {
    let user_id = wx.getStorageSync('user_id');
    wx.request({
      url: url_common + '/api/project/projectWithUserRelationship',
      data: {
        user_id: user_id,
        project_id: pro_id,
        source: is_share
      },
      method: 'POST',
      success: function (res) {
        //  0:不能看 1:能看
        let show_company = res.data.data.show_company;
        let show_detail = res.data.data.show_detail;
        that.setData({
          show_detail: show_detail,
          show_company: show_company
        });
        console.log(show_detail, show_company)
        that.projectDetailInfo(that, pro_id, is_share, show_company);
      }
    })
  },

  //项目详情信息
  projectDetailInfo(that, id, is_share, show_company) {
    let user_id = wx.getStorageSync('user_id');
    wx.request({
      url: url_common + '/api/project/getProjectDetail',
      data: {
        user_id: user_id,
        project_id: id,
        scource: is_share
      },
      method: 'POST',
      success: function (res) {
        let brandList = res.data.data.brand;
        let project = res.data.data;
        let user = res.data.user;
        let count = project.count;
        let pro_company_name = project.pro_company_name;
        let pro_goodness = res.data.data.pro_goodness;
        let industy_sort = [];
        let firstName = user.user_name.substr(0, 1);
        let button_type = res.data.button_type;
        // 如果项目亮点字数超出字,刚显示全部按钮
        if (pro_goodness.length > 50) {
          that.setData({
            textBeyond1: true
          })
        }
        that.setData({
          project: project,
          user: user,
          firstName: firstName,
          pro_company_name: pro_company_name,
          count: count,
          pro_goodness: pro_goodness,
          brandList: brandList,
          button_type: button_type
        });
        // 项目介绍的标签
        let pro_industry = project.pro_industry;
        for (let i = 0; i < pro_industry.length; i++) {
          industy_sort.push(pro_industry[i].industry_name)
        }
        that.setData({
          industy_sort: industy_sort,
          pro_industry: pro_industry
        })
        // 核心团队
        if (project.core_users) {
          let core_memberArray = project.core_users;
          core_memberArray.forEach((x, index) => {
            core_memberArray[index] = x;
          })
          that.setData({
            core_memberArray: core_memberArray
          })
        }
        // 标签 type:0; 项目标签 type:1 团队标签
        let infoTagArray = project.tag;
        if (infoTagArray) {
          let tagOfPro = [];//项目资料的标签
          let teamOfPro = [];//核心团队的标签
          for (let i = 0; i < infoTagArray.length; i++) {
            if (infoTagArray[i].type == 0) {
              tagOfPro.push(infoTagArray[i])
            } else if (infoTagArray[i].type == 1) {
              teamOfPro.push(infoTagArray[i])
            }
          }
          tagOfPro.forEach((x, index) => {
            tagOfPro[index].tag_name = x.tag_name;
          })
          teamOfPro.forEach((x, index) => {
            teamOfPro[index].tag_name = x.tag_name;
          })
          that.setData({
            tagOfPro: tagOfPro,
            teamOfPro: teamOfPro
          })
        }
        // 融资信息
        let pro_history_financeList = project.pro_history_finance;
        if (pro_history_financeList) {
          pro_history_financeList.forEach((x, index) => {
            pro_history_financeList[index].finance_time = app.changeTime(x.finance_time);
            pro_history_financeList[index].pro_finance_scale = x.pro_finance_scale;
            pro_history_financeList[index].pro_finance_investor = x.pro_finance_investor;
            pro_history_financeList[index].belongs_to_stage.stage_name = x.belongs_to_stage.stage_name;
          })
          that.setData({
            pro_history_financeList: pro_history_financeList
          })
        }
        // 里程碑
        let mileStoneArray = project.pro_develop;
        if (mileStoneArray) {
          mileStoneArray.forEach((x, index) => {
            mileStoneArray[index].dh_start_time = app.changeTime(x.dh_start_time);
            mileStoneArray[index].dh_event = x.dh_event;
          })

          that.setData({
            mileStoneArray: mileStoneArray,
            industy_sort: industy_sort,
            pro_goodness: pro_goodness
          });
        }
        //一键尽调
        let company_name = that.data.pro_company_name;
        if (company_name == '') {
          that.setData({
            nothing: 0
          })
        }


        // 如果显示一键尽调和买家图谱则调用数据
        if (show_company) {
          that.oneKeyRearchInfo(company_name);
          that.matchInvestorInfo(id);
        }
      },
    })
  },

  //一键尽调信息(辅助函数)
  oneKeyRearchInfo(company_name) {
    let that = this;
    let user_id = wx.getStorageSync('user_id');
    wx.request({
      url: url_common + '/api/dataTeam/getCrawlerCompany',
      data: {
        user_id: user_id,
        company_name: company_name
      },
      method: 'POST',
      success: function (res) {
        let nothing = res.data.data
        if (nothing == 0) {
          that.setData({
            nothing: nothing
          })
        } else {
          let projectInfoList = res.data.data.project_product;
          let company = res.data.data.company;
          let com_id = company.com_id;
          let com_time = company.company_register_date;
          let time = app.changeTime(com_time);
          if (projectInfoList.length != 0) {
            projectInfoList.forEach((x, index) => {
              projectInfoList[index] = x;
            })
          }
          that.setData({
            company: company,
            time: time,
            projectInfoList: projectInfoList,
            company_name: company_name
          })
          // 项目信息
          wx.request({
            url: url_common + '/api/dataTeam/getCrawlerProject',
            data: {
              com_id: com_id
            },
            method: 'POST',
            success: function (res) {
              let projectDetailsList = res.data.data;
              if (projectDetailsList.length != 0) {
                let projectDetailsOne = projectDetailsList[0];
                let project_labelList = projectDetailsList[0].project_label;
                let project_labelArray = project_labelList.split(","); //字符分割 
                project_labelArray.forEach((x, index) => {
                  project_labelArray[index] = x;
                })
                that.setData({
                  projectDetailsOne: projectDetailsOne,
                  project_labelArray: project_labelArray
                })
              }
              that.setData({
                projectDetailsList: projectDetailsList
              })
            }
          })
          //工商变更
          wx.request({
            url: url_common + '/api/dataTeam/getCrawlerBrand',
            data: {
              com_id: com_id
            },
            method: 'POST',
            success: function (res) {
              // 变更信息
              let brandInfoList = res.data.data.brand;
              let companyChangeList = res.data.data.company_change;
              brandInfoList.forEach((x, index) => {
                brandInfoList[index].company_brand_name = x.company_brand_name;
                brandInfoList[index].company_brand_registration_number = x.company_brand_registration_number;
                brandInfoList[index].company_brand_status = x.company_brand_status;
                brandInfoList[index].company_brand_time = app.changeTime(x.company_brand_time);
                brandInfoList[index].company_brand_type = x.company_brand_type;
              })
              companyChangeList.forEach((x, index) => {
                companyChangeList[index].company_change_after = x.company_change_after;
                companyChangeList[index].company_change_before = x.company_change_before;
                companyChangeList[index].company_change_matter = x.company_change_matter;
                companyChangeList[index].company_change_time = app.changeTime(x.company_change_time);
              })
              that.setData({
                brandInfoList: brandInfoList,
                companyChangeList: companyChangeList
              })
            }
          })
          // 核心成员
          wx.request({
            url: url_common + '/api/dataTeam/getCrawlerTeam',
            data: {
              com_id: com_id
            },
            method: 'POST',
            success: function (res) {
              let teamList = res.data.data;
              teamList.forEach((x, index) => {
                teamList[index].team_member_name = x.team_member_name;
              })
              that.setData({
                teamList: teamList
              })
            }
          })
          // 历史融资
          wx.request({
            url: url_common + '/api/dataTeam/getCrawlerHistoryFinance',
            data: {
              com_id: com_id
            },
            method: 'POST',
            success: function (res) {
              let historyFinance = res.data.data;
              historyFinance.forEach((x, index) => {
                historyFinance[index].history_financing_money = x.history_financing_money;
                historyFinance[index].history_financing_rounds = x.history_financing_rounds;
                historyFinance[index].history_financing_who = x.history_financing_who;
                historyFinance[index].history_financing_time = app.changeTimeStyle(x.history_financing_time);
              })
              that.setData({
                historyFinance: historyFinance
              })
            }
          })
          // 里程碑
          wx.request({
            url: url_common + '/api/dataTeam/getCrawlerMilestone',
            data: {
              com_id: com_id
            },
            method: 'POST',
            success: function (res) {
              let mileStone = res.data.data;
              mileStone.forEach((x, index) => {
                mileStone[index].milestone_event = x.milestone_event;
                mileStone[index].milestone_time = app.changeTimeStyle(x.milestone_time);
              })
              that.setData({
                mileStone: mileStone
              })
            }
          })
          //新闻
          wx.request({
            url: url_common + '/api/dataTeam/getCrawlerNews',
            data: {
              com_id: com_id
            },
            method: 'POST',
            success: function (res) {
              let newsList = res.data.data;
              newsList.forEach((x, index) => {
                newsList[index].project_news_label = x.project_news_label;
                newsList[index].source = x.source;
                newsList[index].project_news_time = app.changeTimeStyle(x.project_news_time);
                newsList[index].project_news_title = x.project_news_title;
              })
              that.setData({
                newsList: newsList
              })
            }
          })
          // 相似公司
          wx.request({
            url: url_common + '/api/dataTeam/getCrawlerCompeting',
            data: {
              com_id: com_id
            },
            method: 'POST',
            success: function (res) {
              let competeList = res.data.data;
              let projectLabelList = [];
              let projectArray = [];
              let arr1 = [];
              competeList.forEach((x, index) => {
                competeList[index].project_introduce = x.project_introduce;
                competeList[index].project_industry = x.project_industry;
                competeList[index].project_location = x.project_location;
                competeList[index].project_logo = x.project_logo;
                competeList[index].project_label = x.project_label;
                competeList[index].history_financing = x.history_financing;
              })
              that.setData({
                competeList: competeList,
              })
            }
          })
        }
      }
    })
  },

  //买家图谱信息
  matchInvestorInfo(id) {
    let that = this;
    let user_id = wx.getStorageSync('user_id');
    wx.request({
      url: url_common + '/api/project/getProjectMatchInvestors',
      data: {
        user_id: user_id,
        project_id: id,
      },
      method: 'POST',
      success: function (res) {
        console.log(res)
        wx.hideLoading()
        let investor2 = res.data.data;
        let matchCount = res.data.match_count;
        that.setData({
          investor2: investor2,
          matchCount: matchCount,
          page_end: res.data.page_end
        });
        wx.hideToast({
          title: 'loading...',
          icon: 'loading'
        })
      }
    })
  },

  /* -----------------------交互行为------------------------------------------- */
  // 用户详情
  userDetail: function (e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/userDetail/networkDetail/networkDetail?id=' + id,
    })
  },
  // 项目详情-里程碑 展开收起
  moreInfo: function (e) {
    let id = e.target.dataset.id;
    let that = this;
    if (id == 3) {
      that.setData({
        moreInfoList: 3
      })
    } else if (id == 4) {
      that.setData({
        moreInfo: 4
      })
    }
  },
  noMoreInfo: function (e) {
    let id = e.target.dataset.id;
    let that = this;
    if (id == 3) {
      that.setData({
        moreInfoList: 0
      })
    } else if (id == 4) {
      that.setData({
        moreInfo: 0
      })
    }
  },
  // 查看bp
  sendBp: function () {
    let that = this;
    let user_id = wx.getStorageSync("user_id");
    wx.request({
      url: url_common + '/api/user/checkUserInfo',
      data: {
        user_id: user_id
      },
      method: 'POST',
      success: function (res) {
        let userEmail = res.data.user_email;
        if (userEmail) {
          that.setData({
            userEmail: userEmail,
            sendPc: 1,
            checkEmail: true,
          })
        } else {
          that.setData({
            sendPc: 1,
            checkEmail: false
          })
        }
      }
    })
  },
  // 更改邮箱
  writeBpEmail: function (e) {
    let userEmail = e.detail.value;
    if (userEmail) {
      this.setData({
        checkEmail: true,
        userEmail: userEmail
      })
    } else {
      this.setData({
        checkEmail: false,
        userEmail: userEmail
      })
    }
  },
  // 发送
  bpModalSure: function (e) {
    let that = this;
    let index = e.currentTarget.dataset.index;
    let sendPc = that.data.sendPc;
    let project_id = that.data.id;
    let userEmail = that.data.userEmail;
    let companyName = that.data.company_name;
    let user_id = wx.getStorageSync('user_id');
    // index 0:发送BP;  1:完善公司信息
    if (index == 0) {
      if (app.checkEmail(userEmail)) {
        // 保存新邮箱
        wx.request({
          url: url_common + '/api/user/updateUser',
          data: {
            user_id: user_id,
            user_email: userEmail
          },
          method: 'POST',
          success: function (res) {
            app.console(res)
            that.setData({
              userEmail: userEmail
            })
            app.console(userEmail)
            if (res.data.status_code == 2000000) {
              wx.request({
                url: url_common + '/api/mail/sendBp',
                data: {
                  user_id: user_id,
                  project_id: project_id
                },
                method: 'POST',
                success: function (res) {
                  console.log(res)
                }
              })
              that.setData({
                sendPc: 0
              })
            } else {
            }
          }
        })
        that.setData({
          sendPc: 0,
          userEmail: userEmail
        })
      } else {
        app.errorHide(that, '请正确填写邮箱', 1000)
      }
    }

  },
  // 取消
  bpModalCancel: function (options) {
    let index = options.currentTarget.dataset.index;
    let that = this;
    let sendPc = that.data.sendPc;
    if (index == 0) {
      that.setData({
        sendPc: 0
      })
    } else if (index == 1) {
      that.setData({
        sendCompany: 0
      })
    }
  },
  collectProject: function () {
    let that = this;
    app.errorHide(that, "收藏项目近期开放", 3000);
  },
  //商业计划书
  businessBook: function () {
    let BPath = this.data.BPath;
    let user_id = wx.getStorageSync('user_id');
    let project_id = this.data.id;
    let that = this;
    if (BPath) {
      wx.showActionSheet({
        itemList: ['直接预览', '发送到邮箱'],
        success: function (res) {
          console.log(res.tapIndex)
          if (res.tapIndex == 1) {
            wx.request({
              url: url_common + '/api/user/checkUserInfo',
              data: {
                user_id: user_id
              },
              method: 'POST',
              success: function (res) {
                console.log(res)
                let userEmail = res.data.user_email;
                if (userEmail) {
                  that.setData({
                    userEmail: userEmail,
                    sendPc: 1,
                    checkEmail: true,
                  })
                } else {
                  that.setData({
                    sendPc: 1,
                    checkEmail: false
                  })
                }
              }
            })
          } else if (res.tapIndex == 0) {
            wx.downloadFile({
              url: BPath,
              success: function (res) {
                var filePath = res.tempFilePath
                wx.openDocument({
                  filePath: filePath,
                  success: function (res) {
                    console.log('打开文档成功')
                  }
                })
              }
            })
          }
        },
        fail: function (res) {
          console.log(res.errMsg)
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '未上传商业计划书',
      })
    }
  },
  //联系项目方
  contactPerson: function () {
    this.setData({
      modalBox: 1
    })
  },
  //关闭模态框
  closeModal: function () {
    this.setData({
      modalBox: 0
    })
  },
  //约谈
  contentProject: function (e) {
    console.log(e)
    let message = e.detail.value;
    let message_length = e.detail.value.length;
    let that = this;
    if (message_length <= 500) {
      this.setData({
        message: message
      })
    } else {
      app.errorHide(that, "不能超过500个数字", 1000)
    }
  },
  //约谈信息发送
  yesBtn: function () {
    let that = this;
    let message = this.data.message;
    let project_id = this.data.id;//项目id
    let user_id = wx.getStorageSync('user_id'); //当前登陆者的 id
    wx.request({
      url: url_common + '/api/project/met',
      data: {
        user_id: user_id,
        project_id: project_id,
        remark: message
      },
      method: 'POST',
      success: function (res) {
        console.log(res)
        if (res.data.status_code == 2000000) {
          that.setData({
            modalBox: 0
          })
        }
      }
    })
  },
  /*点击tab切换*/
  swichNav: function (e) {
    let that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },
  /*滑动切换tab*/
  bindChange: function (e) {
    let that = this;
    let current = e.detail.current;
    that.setData({ currentTab: e.detail.current });
  },
  //分享当前页面
  onShareAppMessage: function () {
    let that = this;
    return ShareModel.projectDetailShare(that);
  },
  // 项目详情中的展开和收起
  allBrightPoint: function () {
    this.setData({
      isChecked: false
    })
  },
  noBrightPoint: function () {
    this.setData({
      isChecked: true
    })
  },
  // 立即认证
  toAccreditation: function () {
    let status = this.data.status;
    let user_id = wx.getStorageSync('user_id');
    wx.request({
      url: url_common + '/api/user/checkUserInfo',
      data: {
        user_id: user_id
      },
      method: 'POST',
      success: function (res) {
        if (res.data.status_code == 2000000) {
          var complete = res.data.is_complete;
          if (complete == 1) {
            //如果信息完整就可以显示去认证
            if (status == 0) {
              wx.navigateTo({
                url: '/pages/my/identity/indentity/indentity'
              })
            } else if (status == 3) {
              wx.showModal({
                title: '友情提示',
                content: '您的身份未通过审核,只有投资人和买方FA才可申请查看项目',
                confirmColor: "#333333;",
                confirmText: "重新认证",
                showCancel: false,
                success: function (res) {
                  wx.request({
                    url: url_common + '/api/user/getUserGroupByStatus',
                    data: {
                      user_id: user_id
                    },
                    method: 'POST',
                    success: function (res) {
                      let group_id = res.data.group.group_id;
                      wx.navigateTo({
                        url: '/pages/my/identity/indentity/indentity?group_id=' + group_id
                      })
                    }
                  })
                }
              })
            }
          } else if (complete == 0) {
            wx.removeStorageSync('followed_user_id')
            wx.navigateTo({
              url: '/pages/register/companyInfo/companyInfo?type=1'
            })
          }
        } else {
          wx.removeStorageSync('followed_user_id')
          wx.navigateTo({
            url: '/pages/register/personInfo/personInfo?type=2'
          })
        }
      },
    });
  },
  // 申请查看
  applyProject: function (e) {
    let that = this;
    let user_id = this.data.user_id;
    app.applyProject(e, that, "project")
  },
  //项目打分
  // projectRemark:function(){
  //   wx.navigateTo({
  //     url: "/pages/remark/remarkList/remarkList",
  //   })
  // }
})