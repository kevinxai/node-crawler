'use strict'
const puppeteer = require('puppeteer');
const UserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36';

/**
 * 参考链接: https://www.npmjs.com/package/puppeteer
 * API文档: https://github.com/puppeteer/puppeteer/blob/v5.5.0/docs/api.md
 * 中文文档: https://zhaoqize.github.io/puppeteer-api-zh_CN/#/
 */
class Chrome {

  empty(data, something) { }

  async start() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--mute-audio',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--no-first-run',
        '--disable-notifications',
      ],
      ignoreHTTPSErrors: true,
      defaultViewport: {
        width: 2160,
        height: 4096,
      },
      timeout: 10000,
    });
  }

  /**
   * 请求拦截器
   * @param {*} request 请求
   */
  requestInterception(request) {
    /**
     * 当请求地址是图片的话,则中断请求,否则继续
     */
    if (request.resourceType() === 'image') {
      request.abort()
    } else {
      request.continue()
    }
  }

  async down(url) {
    let self = this;
    if (!self.browser) {
      await self.start();
    }

    let browser = self.browser;

    /**
     * 创建一个新的隐身浏览器上下文，不会与其他浏览器上下文共享cookie缓存。
     */
    let context = await browser.createIncognitoBrowserContext();
    /**
     * 在一个崭新的上下文环境中创建一个页面
     */
    let page = await context.newPage();

    try {
      /**
       * 此页面启动JavaScript
       */
      await page.setJavaScriptEnabled(true);
      /**
       * 设置此页面使用的UserAgent
       */
      await page.setUserAgent(UserAgent);
      /**
       * 启用页面请求拦截
       */
      await page.setRequestInterception(true);
      /**
       * 当页面请求的时候会进入到这个拦截方法中
       */
      page.on('request', self.requestInterception);
      /**
       * 当页面出错
       */
      page.on('error', self.empty);

      await page.goto(url).catch(self.empty);

      let pageUrl = await page.url();
      let pageTitle = await page.title();
      let pageHtml = await page.content();

      await page.close();
      await context.close();

      return {
        url: pageUrl,
        title: pageTitle,
        html: pageHtml
      };
    } catch (err) {
      console.error(err);
      self.stop();
    }
    return null;
  }

  async stop() {
    let self = this;
    if (!self.browser) {
      return;
    }
    let browser = self.browser;

    let contexts = browser.browserContexts();
    if (!contexts) {
      return;
    }

    for (let context of contexts) {
      try {
        await context.close();
      } catch (e) { };
    }

    try {
      await browser.close();
    } catch (e) { };

    self.browser = null;
  }
}

module.exports = Chrome