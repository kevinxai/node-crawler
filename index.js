'use strict';

const Zodiac = require('./server/Zodiac');
// const News = require('./server/News');

(async () => {

    let args = process.argv[2];

    if ("xz" == args) {
        await new Zodiac().fetch();
    }

    if ("news" == args) {
        await new News().baidu();
        await new News().sogou();
        await new News().weibo();
    }
})();