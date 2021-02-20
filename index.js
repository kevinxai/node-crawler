'use strict';

const Zodiac = require('./server/Zodiac');
const News = require('./server/News');

(async () => {

    let args = process.argv[2];

    if ("xz" == args) {
        await new Zodiac().fetch();
    }

    if ("news" == args) {
        let news = new News();
        await news.baidu();
        await news.sogou();
        await news.weibo();
    }
})();