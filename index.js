'use strict';

const Request = require('./common/Request');

(async () => {
    console.clear();

    let key = process.env.JUHE_XZ_KEY;

    let url = 'http://web.juhe.cn:8080/constellation/getAll?type=tomorrow&key=' + key + '&consName=' + encodeURIComponent("水瓶座");

    let res = await Request.get(url);

    console.log(res);
})();