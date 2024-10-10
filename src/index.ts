import { Browser, Page, PuppeteerLaunchOptions } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import firstPage from "./firstPage";
import fetchDetail from "./fetchDetail";
import fs from 'fs';
import { ProductCheckpoint } from "./model";
import { saveProductsToDisk } from "./util";

const baseURL = 'https://us.jellycat.com/shop-all';

const main = async () => {
    puppeteer.use(StealthPlugin());

    const options: PuppeteerLaunchOptions = {
        headless: false,
        executablePath: puppeteer.executablePath(),
    };

    const browser: Browser = await puppeteer.launch(options);
    let page: Page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.goto(baseURL, { waitUntil: 'networkidle2' });

    const firstPageData = await firstPage(page);
    page = firstPageData.page;
    let products = firstPageData.products;
    fs.writeFileSync('pre.json', JSON.stringify(products, null, 2));

    // prepare the checkpoint file
    let checkpoint: ProductCheckpoint = {};
    products.forEach(product => {
        checkpoint[product.id] = {
            status: 'new',
            lastUpdated: Date.now(),
        }
    });
    fs.writeFileSync('checkpoint.json', JSON.stringify(checkpoint, null, 2));

    const fetchDetailData = await fetchDetail(page, products, checkpoint);
    page = fetchDetailData.page;
    products = fetchDetailData.products;
    const newCheckpoint = fetchDetailData.checkpoint;
    fs.writeFileSync('checkpoint.json', JSON.stringify(newCheckpoint, null, 2));

    // write to file
    console.log('products:', products.length);
    await saveProductsToDisk(products, 'products.json');


    // await browser.close();
};

main();