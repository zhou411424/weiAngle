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
    isChecked0: true,
    isChecked1: true,
    isChecked2: true,
    isChecked3: true,
    isChecked4: true,
    textBeyond0: false,
    textBeyond1: false,//项目亮点的全部和收起是否显示标志
    textBeyond2: false,//创始人的全部和收起是否显示标志
    textBeyond3: false,//资金用途的全部和收起是否显示标志
    textBeyond4: false,
    textBeyond5: false,
    modalBox: 0,
    currentTab: 0,//选项卡
    show_detail: false,
    show_company: false,
    message: ""
  },
  onLoad: function (options) {
    var that = this;
    var id = options.id;//当前被查看用户的项目id
    var share_id = options.share_id;
    var page = this.data.page;
    var user_id = '';
    var view_id = '';
    var user_id = wx.getStorageSync('user_id');
    that.setData({
      user_id: user_id,
      id: id,
      share_id: options.share_id
    });
    // 为上拉加载准备
    app.initPage(that);
    // 判斷項目是不是自己的
    wx.request({
      url: url + '/api/project/projectIsMine',
      data: {
        project_id: id
      },
      method: 'POST',
      success: function (res) {
        let ownerId = res.data.user_id;
        app.loginPage(function (user_id) {
          if (ownerId === user_id) {
            wx.redirectTo({
              url: '/pages/myProject/projectDetail/projectDetail?id=' + id,
            })
          }else{
           that.setData({
             other:false
           })
          }
        });
      }
    })


    this.identityInfo(that);

    //判断页面进入场景    option.share_id存在是分享页面,share_id不存在则不是分享页面
    if (!options.share_id) {
      that.showStatus(that, id, "", 0);
    } else {
      app.loginPage(function (user_id) {
        that.setData({
          user_id: user_id,
        })
        that.showStatus(that, id, "share", options.share_id);
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

  //是否能查看项目详情和买家图谱,一键尽调状态获取
  showStatus(that, pro_id, is_share, share_id) {
    let user_id = wx.getStorageSync('user_id');
    wx.request({
      url: url_common + '/api/project/projectWithUserRelationship',
      data: {
        user_id: user_id,
        project_id: pro_id,
        source: is_share,
        share_id: share_id
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
        that.projectDetailInfo(that, pro_id, is_share, share_id, show_company);
      }
    })
  },

  //项目详情信息
  projectDetailInfo(that, id, is_share, share_id, show_company) {
    let user_id = wx.getStorageSync('user_id');
    wx.request({
      url: url_common + '/api/project/getProjectDetail',
      data: {
        user_id: user_id,
        project_id: id,
        source: is_share,
        share_id: share_id
      },
      method: 'POST',
      success: function (res) {
        let brandList = res.data.data.brand;
        let project = res.data.data;
        console.log(user_id, id, is_share)
        console.log(res)
        if (project.pro_BP) {
          let BPath = project.pro_BP.file_url;
          that.setData({
            BPath: BPath
          })
        }
        let user = res.data.user;
        let count = project.count;
        let pro_company_name = project.pro_company_name;
        let pro_goodness = res.data.data.pro_goodness;
        let pro_market_genera = res.data.data.pro_market_genera;
        let pro_service = res.data.data.pro_service;
        let pro_business_model = res.data.data.pro_business_model;
        let industy_sort = [];
        let firstName = user.user_name.substr(0, 1);
        let button_type = res.data.button_type;

        // 如果项目亮点字数超出字,刚显示全部按钮
        if (pro_goodness.length != 0) {
          let arr = [];
          for (let i = 0; i < pro_goodness.length; i++) {
            arr.push(pro_goodness[i].goodness_desc.length)
          }
          console.log(Math.max(arr),Math.max.apply(null,arr),arr)
          if (Math.max.apply(null, arr) > 250) {
            that.setData({
              textBeyond0: true,
              isChecked0: true,
            })
          } else
            that.setData({
              textBeyond0: false,
              isChecked0: false,
            })
        }
        // 如果市场概况字数超出字,刚显示全部按钮
        if (pro_market_genera.length != 0) {
          let arr = [];
          for (let i = 0; i < pro_market_genera.length; i++) {
            arr.push(pro_market_genera[i].goodness_desc.length)
          }
          if (Math.max.apply(null, arr) > 250) {
            that.setData({
              textBeyond1: true,
              isChecked1: true,
            })
          } else
            that.setData({
              textBeyond1: false,
              isChecked1: false,
            })
        }
        // 如果产品概况字数超出字,刚显示全部按钮
        if (pro_service.length != 0) {
          let arr = [];
          for (let i = 0; i < pro_service.length; i++) {
            arr.push(pro_service[i].goodness_desc.length)
          }
          if (Math.max.apply(null, arr) > 250) {
            that.setData({
              textBeyond2: true,
              isChecked2: true,
            })
          } else
            that.setData({
              textBeyond2: false,
              isChecked2: false,
            })
        }
        // 如果商业模式字数超出字,刚显示全部按钮
        if (pro_business_model.length != 0) {
          let arr = [];
          for (let i = 0; i < pro_business_model.length; i++) {
            arr.push(pro_business_model[i].goodness_desc.length)
          }
          if (Math.max.apply(null, arr) > 250) {
            that.setData({
              textBeyond3: true,
              isChecked3: true,
            })
          } else
            that.setData({
              textBeyond3: false,
              isChecked3: false,
            })
        }
        // // 如果项目亮点字数超出字,刚显示全部按钮
        // if (pro_goodness.length != 0) {
        //   if (pro_goodness[0].goodness_desc.length > 50) {
        //     console.log("textBeyond0")
        //     that.setData({
        //       textBeyond0: true,
        //       textBeyond5: true
        //     })
        //   }
        //   if (pro_goodness.length == 2) {
        //     if (pro_goodness[1].goodness_desc.length > 50) {
        //       that.setData({
        //         textBeyond1: true
        //       })
        //     }
        //   }
        //   if (pro_goodness.length == 3) {
        //     if (pro_goodness[2].goodness_desc.length > 50) {
        //       that.setData({
        //         textBeyond2: true
        //       })
        //     }
        //   }
        //   if (pro_goodness.length == 4) {
        //     if (pro_goodness[3].goodness_desc.length > 50) {
        //       that.setData({
        //         textBeyond3: true
        //       })
        //     }
        //   }
        // }
        if (project.pro_finance_use) {
          if (project.pro_finance_use.length > 250) {
            that.setData({
              textBeyond4: true
            })
          }
        }
        // 项目介绍的标签
        if (button_type == 2 || button_type == 3) {
          if (pro_industry) {
            for (var i = 0; i < pro_industry.length; i++) {
              industy_sort.push(pro_industry[i].industry_name)
            }
          }

          that.setData({
            industy_sort: industy_sort,
            button_type: button_type,
            // currentUser: currentUser
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
          let projectInfoList;
          if (res.data.data.project_product) {
            projectInfoList = res.data.data.project_product;
          }

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

  // 买家图谱上拉加载
  loadMore: function () {
    let that = this;
    let user_id = this.data.user_id;
    let id = this.data.id;
    let currentPage = this.data.currentPage;
    let request = {
      url: url_common + '/api/project/getProjectMatchInvestors',
      data: {
        user_id: user_id,
        project_id: id,
        page: currentPage
      },
    }
    //调用通用加载函数
    app.loadMore(that, request, "investor2")
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
    } else if (id == 5) {
      that.setData({
        moreInfo: 5
      })
    }
    else if (id == 6) {
      that.setData({
        moreInfo: 6
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
    } else if (id == 5) {
      that.setData({
        moreInfo: 0
      })
    } else if (id == 6) {
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
                  wx.request({
                    url: url_common + '/api/project/insertViewBpRecord',
                    data: {
                      user_id: user_id,
                      project_id: project_id
                    },
                    method: 'POST',
                    success: function (res) {
                      console.log(res)
                    }
                  })
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
            wx.showLoading({
              title: 'loading',
              mask: true,
            })
            wx.downloadFile({
              url: BPath,
              success: function (res) {
                var filePath = res.tempFilePath
                wx.openDocument({
                  filePath: filePath,
                  success: function (res) {
                    console.log('打开文档成功')
                    wx.hideLoading();
                    wx.request({
                      url: url_common + '/api/project/insertViewBpRecord',
                      data: {
                        user_id: user_id,
                        project_id: project_id
                      },
                      method: 'POST',
                      success: function (res) {
                        console.log(res)
                      }
                    })
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
    let user_id = wx.getStorageSync('user_id');
    let that = this;
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
            //如果信息完整就可以联系项目方
            that.setData({
              modalBox: 1
            })
          } else if (complete == 0) {
            wx.navigateTo({
              url: '/pages/register/companyInfo/companyInfo?type=1'
            })
          }
        } else {
          wx.navigateTo({
            url: '/pages/register/personInfo/personInfo?type=2'
          })
        }
      },
    });

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
  allBrightPoint: function (e) {
    let check = e.currentTarget.dataset.check;
    if (check == 0) {
      this.setData({
        isChecked0: false
      })
    } else if (check == 1) {
      this.setData({
        isChecked1: false
      })
    }
    else if (check == 2) {
      this.setData({
        isChecked2: false
      })
    }
    else if (check == 3) {
      this.setData({
        isChecked3: false
      })
    } else if (check == 4) {
      this.setData({
        isChecked4: false
      })
    }
  },
  noBrightPoint: function (e) {
    let check = e.currentTarget.dataset.check;
    console.log(check)
    if (check == 0) {
      this.setData({
        isChecked0: true
      })
    } else if (check == 1) {
      this.setData({
        isChecked1: true
      })
    }
    else if (check == 2) {
      this.setData({
        isChecked2: true
      })
    }
    else if (check == 3) {
      this.setData({
        isChecked3: true
      })
    }
    else if (check == 4) {
      this.setData({
        isChecked4: true
      })
    }
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
    let pro_id = this.data.id;
    app.operationModel('projectApply', pro_id, res => {
      if (res.data.status_code = 2000000) {
        this.setData({
          button_type: 0
        })
      }
    })
  },
  //分享引导跳转
  shareJump(e) {
    let index = e.currentTarget.dataset.index;
    app.shareJump(index);
  },
  //进入投资人用户详情
  detail(e) {
    let id = e.currentTarget.dataset.id;
    let user_id = wx.getStorageSync('user_id');
    if (id != user_id) {
      wx.navigateTo({
        url: '/pages/userDetail/networkDetail/networkDetail?id=' + id,
      })
    } else if (id == user_id) {
      wx.navigateTo({
        url: '/pages/my/my/my'
      })
    }
  },
  // 一键尽调页面展开
  //查看全部
  checkMore: function (e) {
    let id = e.target.dataset.id;
    if (id == 1) {
      this.setData({
        companyMileStoneMore: 1
      })
    } else if (id == 2) {
      // 新闻接口
      this.setData({
        companyNews: 2
      })
    } else if (id == 3) {
      // 竞品
      this.setData({
        competitorMore: 3
      })
    } else if (id == 4) {
      this.setData({
        historyMore: 4
      })
    } else if (id == 5) {
      this.setData({
        industrialChangeMore: 5
      })
    }
  },
  // 折叠
  noCheckMore: function (e) {
    let id = e.target.dataset.id;
    if (id == 1) {
      this.setData({
        companyMileStoneMore: 0
      })
    } else if (id == 2) {
      this.setData({
        companyNews: 0
      })
    } else if (id == 3) {
      this.setData({
        competitorMore: 0
      })
    } else if (id == 4) {
      this.setData({
        historyMore: 0
      })
    } else if (id == 5) {
      this.setData({
        industrialChangeMore: 0
      })
    } else if (id == 6) {

    }
  },
  //项目打分
  // projectRemark:function(){
  //   wx.navigateTo({
  //     url: "/pages/remark/remarkList/remarkList",
  //   })
  // }
  // 机构版买家图谱跳转
  toMap: function () {
    var that = this;
    app.href('/pages/organization/subPage/project_orgMatch/project_orgMatch?project_id=' + this.data.id);
  }
}) 