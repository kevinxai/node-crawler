'use strict';

const Request = require('../common/Request');
const Util = require('../common/Util');

const xz = [
    '水瓶座',
    '双鱼座',
    '白羊座',
    '金牛座',
    '双子座',
    '巨蟹座',
    '狮子座',
    '处女座',
    '天秤座',
    '天蝎座',
    '射手座',
    '摩羯座'
];

class TodayFortune {
    constructor(result) {
        this.health = toInt(result.health) // 健康指数
        this.love = toInt(result.love) // 爱情指数
        this.money = toInt(result.money) // 财运指数
        this.work = toInt(result.work) // 工作指数
        this.all = toInt(result.all) // 综合指数

        this.day = result.date
        this.name = result.name // 星座名
        this.dateTime = result.datetime // 日期
        this.color = result.color // 幸运色
        this.number = result.number // 幸运数字
        this.friend = result.QFriend // 速配星座
        this.summary = result.summary // 今日概述
        this.created = Util.getTime()
    }
}

class Zodiac {

    constructor() {
        this.key = process.env.JUHE_XZ_KEY;
    }

    post(res) {
        let data = new TodayFortune(res);
        await request.postWithoutBaseUrl('/api/v1/fortune/create', data)
    }

    async fetch() {
        for (let name of xz) {
            let url = 'http://web.juhe.cn:8080/constellation/getAll?type=tomorrow&key=' + this.key + '&consName=' + encodeURIComponent(name);
            let res = await Request.get(url);
            this.post(res);
        }
    }
}


module.exports = Zodiac;