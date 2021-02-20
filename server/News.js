'use strict'

const cheerio = require('cheerio');
const Chrome = require('../common/Chrome');
const Util = require('../common/Util');
const Request = require('../common/Request');

class NewsData {

    constructor(source, num, title, hotNum) {
        this.created = Util.getTime();
        this.uuid = Util.md5(title);

        this.source = source;

        this.rank = num;
        this.hotNum = hotNum;

        this.title = title;
        this.subTitle = "";
        this.intro = "";
    }

    check() {
        return (this.uuid && this.rank && this.title);
    }
}

class News {

    async crawler(url, mainBodyIdentification, callback) {
        let chrome = new Chrome();
        let page = await chrome.down(url);
        await chrome.stop();

        const $ = cheerio.load(page.html);
        let mainBody = $(mainBodyIdentification);
        if (mainBody.length <= 0) {
            callback($, null);
            return;
        }

        Util.safeCall(() => { callback($, mainBody); });
    }

    async baidu() {
        let url = "http://top.baidu.com/buzz?b=1&fr=topindex";
        let mainBodyIdentification = "div[class=mainBody] > div[class=grayborder]";

        this.crawler(url, mainBodyIdentification, ($, mainBody) => {
            let newsList = [];
            var trNodes = mainBody.find("table[class=list-table] > tbody > tr");
            if (trNodes) {
                let num = null;
                let title = null;
                let hot = null;
                let newsData = null;
                trNodes.each((i, ele) => {
                    let tr = $(ele);
                    let newsTitle = Util.trim(tr.find('td > div > div[class="item-headline"] > a[class=info-title]').text());
                    let newsInfo = Util.trim(tr.find('td > div > div[class="item-headline"] > p[class=info-text]').text());
                    if (newsData && newsData.check()) {
                        if (newsTitle) {
                            newsData.subTitle = newsTitle;
                            newsData.intro = newsInfo;
                        }
                        newsList.push(newsData);
                    }
                    num = Util.trim(tr.find('td[class=first]').text());
                    title = Util.trim(tr.find('td[class=keyword] > a[class=list-title]').text());
                    hot = parseInt(Util.trim(tr.find('td[class=last]').text()));
                    newsData = new NewsData('baidu', num, title, hot);
                });

                if (newsData && newsData.check()) {
                    newsList.push(newsData);
                }
            }

            for (let data of newsList) {
                try {
                    await Request.postWithoutBaseUrl("/api/v1/baidutop/create", data);
                } catch (e) {
                    console.error("Request请求失败！");
                    console.error(e);
                }
            }
        });
    }

    async sogou() {
        let url = "http://top.sogou.com/hot/shishi_1.html";
        let mainBodyIdentification = "div[class=main] > ul[class=pub-list]";

        this.crawler(url, mainBodyIdentification, ($, mainBody) => {
            let newsList = [];
            var trNodes = mainBody.find("li");
            if (trNodes) {
                trNodes.each((i, ele) => {
                    let tr = $(ele);
                    let title = Util.trim(tr.find('span[class=s2] > p[class=p1] > a').text());
                    if (Util.isEmpty(title)) {
                        title = Util.trim(tr.find('span[class=s2] > p[class=p3] > a').text());
                    }
                    let intro = Util.trim(tr.find('span[class=s2] > p[class=p2]').text());
                    if (!Util.isEmpty(intro)) {
                        intro = intro.replace("查看详情>>", "");
                    }
                    let hot = parseInt(Util.trim(tr.find('span[class=s3]').text()));

                    let newsData = new NewsData('sogou', i + 1, title, hot);
                    newsData.intro = intro;
                    newsList.push(newsData);
                });
            }

            for (let data of newsList) {
                try {
                    await Request.postWithoutBaseUrl("/api/v1/sogoutop/create", data);
                } catch (e) {
                    console.error("Request请求失败！");
                    console.error(e);
                }
            }
        });
    }

    async weibo() {
        let url = "https://s.weibo.com/top/summary?cate=realtimehot";
        let mainBodyIdentification = "div[id=pl_top_realtimehot] > table";
        this.crawler(url, mainBodyIdentification, ($, mainBody) => {
            let newsList = [];
            var trNodes = mainBody.find("tbody > tr");
            if (trNodes) {
                trNodes.each((i, ele) => {
                    let tr = $(ele);
                    let num = Util.trim(tr.find("td[class='td-01 ranktop']").text());
                    let title = Util.trim(tr.find('td[class=td-02] > a').text());
                    let hot = Util.trim(tr.find('td[class=td-02] > span').text());
                    if (!num) {
                        num = 1;
                    }
                    if (!hot) {
                        hot = 1;
                    }
                    newsList.push(new NewsData('weibo', num, title, hot));
                });
            }

            for (let data of newsList) {
                try {
                    await Request.postWithoutBaseUrl("/api/v1/weibotop/create", data);
                } catch (e) {
                    console.error("Request请求失败！");
                    console.error(e);
                }
            }
        });
    }
}

module.exports = News;