'use strict';

const Zodiac = require('./server/Zodiac');
// const News = require('./server/News');

(async () => {
    console.clear();

    // new News().weibo();

    await new Zodiac().fetch();
})();