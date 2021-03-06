var rqj = require('../../Template/Template.js')
var app = getApp()
var url = app.globalData.url;
var url_common = app.globalData.url_common;
Page({
    data: {
        user_info: {
            user_avatar_url: '',
            user_mobile: '',
            user_real_name: '',
            user_company_name: '',
            user_brand: '',
            user_company_career: '',
        },
    },
    onLoad: function (options) {
        var that = this;
        var user_id = wx.getStorageSync('user_id');
        wx.showLoading({
            title: 'loading',
            mask:true
        })

        //获取用户信息
        wx.request({
            url: url_common + '/api/user/getUserAllInfo',
            data: {
                share_id: 0,
                user_id: user_id,
                view_id: user_id
            },
            method: 'POST',
            success: function (res) {
                wx.hideLoading();
                let user_info = res.data.user_info;
                console.log(user_info)
                that.setData({
                    user_id: user_id,
                    user_info: user_info,
                })
            },
        })
    },
    onShow: function () {

    },
    //头像
    headPic() {
        let that = this;
        app.headPic(that);
    },
    //信息填写或更改
    writeNewThing: function (e) {
        let that = this;
        let type = e.currentTarget.dataset.type;
        let user_real_name = this.data.user_info.user_real_name;
        let user_company_name = this.data.user_info.user_company_name;
        let user_brand = this.data.user_info.user_brand;
        let user_company_career = this.data.user_info.user_company_career;
        if (type == 4) {
            wx.navigateTo({
                url: '/pages/contactsActivty/createInfo/createInfo?type=' + type + '&user_real_name=' + user_real_name,
            })
        }
        else if (type == 5) {
            wx.navigateTo({
                url: '/pages/contactsActivty/createInfo/createInfo?type=' + type + '&user_company_name=' + user_company_name,
            })
        }
        else if (type == 6) {
            wx.navigateTo({
                url: '/pages/contactsActivty/createInfo/createInfo?type=' + type + '&user_brand=' + user_brand,
            })
        }
        else if (type == 7) {
            wx.navigateTo({
                url: '/pages/contactsActivty/createInfo/createInfo?type=' + type + '&user_company_career=' + user_company_career,
            })
        }
    },
    //提交
    save() {
        let that = this;
        let user_id = this.data.user_id;
        let user_real_name = this.data.user_info.user_real_name;
        let user_company_name = this.data.user_info.user_company_name;
        let user_brand = this.data.user_info.user_brand;
        let user_company_career = this.data.user_info.user_company_career;
        let user_info = this.data.user_info;
        let image_id = this.data.image_id;
        if (user_real_name.length === 0) {
            app.errorHide(that, '请填写姓名', 3000)
        } else if (user_company_name.length === 0) {
            app.errorHide(that, '请填写公司名称', 3000)
        } else if (user_company_career.length === 0) {
            app.errorHide(that, '请填写职位名称', 3000)
        } else {
            console.log(image_id)
            wx.request({
                url: url_common + '/api/user/updateUser',
                data: {
                    user_id: user_id,
                    user_real_name: user_real_name,
                    user_company_name: user_company_name,
                    user_company_career: user_company_career,
                    user_brand: user_brand,
                    user_email: user_info.user_email,
                    user_intro: user_info.user_intro,
                    user_avatar: image_id
                },
                method: 'POST',
                success: function (res) {
                    if (res.data.status_code == 2000000) {
                        wx.showModal({
                            title: '报名成功',
                            content: '分享您的投资名片可快速拓展人脉',
                            showCancel: true,
                            cancelText: '完成',
                            cancelColor: '#333',
                            confirmText: '分享名片',
                            confirmColor: '#333',
                            success: function(res) {
                                if(res.confirm===true){
                                    wx.redirectTo({
                                        url: '/pages/my/qrCode/qrCode?type=1&&user_id='+user_id,
                                    })
                                }else if(res.cancel===true){
                                    wx.redirectTo({
                                        url: '/pages/contactsActivty/activtyDetail/activtyDetail',
                                    })
                                }
                            },
                        })
                    } else {
                        wx.showModal({
                            title: "错误提示",
                            content: res.data.error_msg,
                            showCancel: false
                        })
                    }
                },
                fail: function (res) {
                    console.log(res)
                },
            })
        }
    },
})