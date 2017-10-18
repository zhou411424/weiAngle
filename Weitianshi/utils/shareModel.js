let app = getApp();

//我的名片分享
function myCardShare(that) {
  let user_id = wx.getStorageSync('user_id');
  let share_id = wx.getStorageSync("user_id");
  let name = that.data.user.user_real_name;
  let path = "/pages/my/sharePage/sharePage?user_id=" + user_id + "&&share_id=" + share_id;
  let title = '投资名片—智能精准匹配投融资双方的神器';
  return sharePage(user_id, share_id, name)
}
//他人详情分享
function networkDetailShare(that) {
  var user_id = that.data.user_id;
  var share_id = wx.getStorageSync("user_id");
  var name = that.data.user.user_real_name;
  return sharePage(user_id, share_id, name)
}

//我的项目详情分享
function myProjectDetailShare(that) {
  let pro_intro = that.data.project.pro_intro;
  let id = that.data.id;
  let share_id = that.data.view_id;
  let title = pro_intro;
  /* return {
    title: title,
    path: '/pages/myProject/projectDetail/projectDetail?id=' + id + "&&share_id=" + share_id,
  } */
  return shareProjectPage(id, title, share_id)
}
//他人项目详情分享
function projectDetailShare(that) {
  var pro_intro = that.data.project.pro_intro;
  //id :当前页面的项目id
  let id = that.data.id;
  let share_id = that.data.currentUser;
  let path = '/pages/projectDetail/projectDetail?id=' + id + "&&share_id=" + share_id;
  let title = pro_intro;
  return shareProjectPage(id, title, share_id)
}

//找项目分享
function discoverProjectShare() {
  return {
    title: '来微天使找优质项目',
    path: '/pages/discoverProject/discoverProject'
  }
}

//找投资分享
function discoverInvestShare() {
  return {
    title: '来微天使找优质人脉',
    path: '/pages/discoverInvest/discoverInvest'
  }
}

//个人店铺分享
function projectShopShare(that) {
  let myProject = that.data.myProject;
  let user_id = that.data.user_id;
  let shop_name = that.data.userInfo.shop_name || that.data.userInfo.user_real_name
  return {
    title: shop_name + '项目店铺',
    path: '/pages/my/projectShop/projectShop/projectShop?followed_user_id=' + user_id,
  }
}

//名片二维码分享
function qrCodeShare(that) {
  let name = that.data.user.user_real_name;
  let user_id = wx.getStorageSync('QR_id');
  let share_id = wx.getStorageSync('user_id') || 0;
  return sharePage(user_id, share_id, name);
}

//名片分享页分享
function sharePageShare(that) {
  let user_id = that.data.followed_user_id;
  let share_id = that.data.share_id;
  let name = that.data.user.user_real_name;
  return sharePage(user_id, share_id, name);
}

//一键尽调页面
function oneKeyResearchShare(that) {
  let pro_intro = that.data.project.pro_intro;
  return {
    title: pro_intro,
    path: '/pages/oneKeyResearch/oneKeyResearch?id=' + that.data.id
  }
}

//活动详情分享
function activtyShare() {
  return {
    title: '100万大礼包助攻2017首届中国双创机构人气品牌百强评选，等你来战!',
    path: '/pages/contactsActivty/activtyDetail/activtyDetail',
    imageUrl: app.globalData.picUrl.activtyShare,
  }
}

//活动人脉排行分享
function topPlayerShare(e) {
  let id = e.target.dataset.applyid;
  let name = e.target.dataset.name;
  let type = e.target.dataset.type;
  //type 1:个人名片分享; 2:战队成员页面分享
  if (type == 1 || !type) {
    return {
      title: name + '正在参与2017首届中国双创机构人气品牌百强评选，加我人脉,助我夺冠!',
      path: '/pages/userDetail/networkDetail/networkDetail?id=' + id,
      imageUrl: app.globalData.picUrl.activtyShare,
      success: function (res) {
        console.log('分享成功', res)
      },
    }
  } else if (type == 2) {
    return {
      title: name + '正在参与2017首届中国双创机构人气品牌百强评选，邀您加战队，助我夺冠!',
      path: '/pages/contactsActivty/warbandMember/warbandMember?team_id=' + id + '&&team_name=' + name,
      imageUrl: app.globalData.picUrl.activtyShare,
      success: function (res) {
        console.log('分享成功', res)
      },
    }
  } else {
    console.log('分享函数的type出问题了')
  }
}

//活动战队成员分享
function warbandMemberShare(that) {
  let team_name = that.data.team_name;
  let team_id = that.data.team_id;
  return {
    title: team_name + '正在参与2017首届中国双创机构人气品牌百强评选，邀您加战队，助我夺冠!',
    path: '/pages/contactsActivty/warbandMember/warbandMember?team_id=' + team_id + '&team_name=' + team_name,
    imageUrl: app.globalData.picUrl.activtyShare,
    success: function (res) {
      console.log('分享成功', res)
    },
  }
}

/* -------------------------------------------------------------------- */
//分享项目详情(user_id为数据所有人ID,share_Id为分享人的ID)
function shareProjectPage(id, title, share_id) {
  let url = app.globalData.url;
  let url_common = app.globalData.url_common;
  let path = '/pages/projectDetail/projectDetail?id=' + id + "&&share_id=" + share_id;
  let json = {
    title: title,
    path: path,
    imageUrl: app.globalData.picUrl.shareCommon,
  }
  return json
}

//分享名片详情(user_id为数据所有人ID,share_Id为分享人的ID,name为数据所有人的姓名)
function sharePage(user_id, share_id, name) {
  let path = "/pages/my/sharePage/sharePage?user_id=" + user_id + "&&share_id=" + share_id;
  let url = app.globalData.url;
  let url_common = app.globalData.url_common;
  let json = {
    title: '［换名片］' + name + '的投资名片，请点击查看',
    path: path,
    imageUrl: app.globalData.picUrl.shareCommon,
  }
  return json
}

//分享打点
function shareLog(path) {
  let shareTicket;
  if (res.shareTickets) {
    shareTicket = res.shareTickets[0];
  }
  //获取code
  wx.login({
    success(res) {
      let code = res.code;
      if (code) {
        //如果是分享到群里
        if (shareTicket) {
          wx.getShareInfo({
            shareTicket: shareTicket,
            success: function (res) {
              let encryptedData = res.encryptedData;
              let iv = res.iv;
              //发送请求到后台
              wx.request({
                url: url_common + '/api/log/shareLogRecord',
                method: "POST",
                data: {
                  code: code,
                  path: path,
                  encryptedData: encryptedData,
                  iv: iv
                },
                success(res) {
                  console.log('分享页面后台记录成功', res)
                }
              })
            },
          })
        } else {//如果不是分享到群里
          console.log(code, path)
          //发送请求到后台
          wx.request({
            url: url_common + '/api/log/shareLogRecord',
            method: "POST",
            data: {
              code: code,
              path: path,
            },
            success(res) {
              console.log('分享页面后台记录成功', res)
            }
          })
        }
      }
    }
  })
}
/* --------------------------------------------------------------------- */

export {
  myCardShare,
  discoverInvestShare,
  discoverProjectShare,
  projectShopShare,
  qrCodeShare,
  sharePageShare,
  oneKeyResearchShare,
  myProjectDetailShare,
  projectDetailShare,
  networkDetailShare,
  activtyShare,
  topPlayerShare,
  warbandMemberShare,
}

