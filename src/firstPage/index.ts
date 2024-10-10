import { Page } from 'puppeteer';
import { Product } from '../model';
import { generateProductId, parsePrice, acceptCookies, scrollToBottom, sendKeyToPage, delay, randomDelay } from '../util';

const fetchCurrentPage = async (page: Page) => {
    const rs: Product[] = [];
    await page.waitForSelector('div#product-listing-container ul li.ss__result--item');
    const productMetadata = await page.$$('div#product-listing-container ul li.ss__result--item');
    for (const elem of productMetadata) {
        // status: div#product-listing-container ul li.ss__result--item article figure div
        const status = await elem.$eval('article figure div', (element) => {
            return element.textContent;
        });

        // url: div#product-listing-container ul li.ss__result--item div.card-body h3.card-title a
        const url = await elem.$eval('div.card-body h3.card-title a', (element) => {
            return element.getAttribute('href') || '';
        });
        const title = await elem.$eval('div.card-body h3.card-title a', (element) => {
            return element.textContent || '';
        });
        const id = generateProductId(url);

        // price: div#product-listing-container ul li.ss__result--item div.card-body div div.card-text div.price-section span
        const priceStr = await elem.$$eval('div.card-body div div.card-text div.price-section span', (elements) => {
            return elements.map((element) => {
                return element.textContent;
            }).join('');
        });
        const parsedPrice = parsePrice(priceStr);

        const itm: Product = {
            id,
            title,
            url,
            priceStr,
            price: {
                price: parsedPrice.price,
                currency: parsedPrice.currency,
            },
            status: status ? status.trim() : '',
            isManySize: parsedPrice.someSize,
            sizes: [],
        };
        rs.push(itm);
    }
    return rs;
};

const firstPage = async (page: Page) => {
    console.log('first page');
    await acceptCookies(page);
    await scrollToBottom(page);
    await sendKeyToPage(page, 'Escape');
    const tbItm = await page.waitForSelector('div#searchspring-toolbar');
    tbItm?.scrollIntoView();

    const rs: Product[] = [];
    try {
        let isLastPage = false;
        let pageIdx = 1;
        do {
            console.log('page:', pageIdx++);
            const items = await fetchCurrentPage(page);
            rs.push(...items);
            const nextBtn = await page.$('a[aria-label="Next"]');
            if (nextBtn) {
                await nextBtn.click();
                await delay(randomDelay(2000, 3000));
            } else {
                isLastPage = true;
            }
        } while (!isLastPage);
    } catch (error) {
        console.log('First page error:', error);
    } finally {
        return {
            page,
            products: rs,
        };
    }
}

export default firstPage