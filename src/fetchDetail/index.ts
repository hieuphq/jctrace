import { Page } from 'puppeteer';
import { Product, ProductCheckpoint } from '../model';
import fs from 'fs';
import { parseSizeDetail, parseCheckoutStatus, parsePrice, randomDelay, parseSize, delay } from '../util';

const isSingleProduct = async (page: Page) => {
    try {
        await page.waitForSelector('section.productView-details div.form-field select', { timeout: 2000 });

        return false;
    } catch (error) {
        return true;
    }
}

const fetchImageUrls = async (page: Page) => {
    const urls = await page.$$eval('ul#pdp-gallery li img', (elements) => {
        return elements.map((element) => {
            return element.getAttribute('src') || '';
        });
    });

    // urls is duplicated
    const uniqueUrls = Array.from(new Set(urls));

    //we should exchange the first and second element
    const tmp = uniqueUrls[0];
    uniqueUrls[0] = uniqueUrls[1];
    uniqueUrls[1] = tmp;

    return uniqueUrls;
}

const saveImagesToDisk = async (productId: string, size: string, imageUrls: string[]) => {
    const folderName = `./images/${productId}-${size}`;
    if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName, { recursive: true });
    }

    let rs: string[] = [];
    for (let i = 0; i < imageUrls.length; i++) {
        const url = imageUrls[i];
        const res = await fetch(url);
        const buffer = await res.arrayBuffer();
        const newFileName = `./images/${productId}-${size}/${productId}-${size}-${i}.jpg`;

        fs.writeFileSync(newFileName, Buffer.from(buffer));
        rs.push(newFileName);
    }
    return rs;
}
const fetchSingleProduct = async (page: Page, product: Product) => {
    console.log('fetch single product');
    if (product.isManySize === true) {
        // raise error
        throw new Error(`Product ${product.url} is many size`);
    }

    // get data from input#form-action-addToCart
    const checkoutStatusStr = await page.$eval('input#form-action-addToCart', (element) => {
        return element.getAttribute('value') || '';
    });

    // get price from span.price--withoutTax
    const priceStr = await page.$eval('span.price--withoutTax', (element) => {
        return element.textContent || '';
    });
    const price = parsePrice(priceStr);
    const status = parseCheckoutStatus(checkoutStatusStr);

    console.log('fetched data:', price, status);

    // get image urls
    const imgUrls = await fetchImageUrls(page);
    const sizeShort = parseSizeDetail("One Size");
    const imageUrls = await saveImagesToDisk(product.id, sizeShort, imgUrls);
    product.sizes.push({
        size: "One Size",
        priceStr: priceStr,
        price: {
            price: price.price,
            currency: price.currency,
        },
        imageUrls,
        status: status,
    });

    console.log('fetch single product done');

    return product;
}

const fetchManySizeProduct = async (page: Page, product: Product) => {
    console.log('fetch many size product');
    // if (product.isManySize === false) {
    //     // raise error
    //     throw new Error(`Product ${product.url} is single size`);
    // }

    // get size options
    const sizeOptsRaw = await page.$$eval('section.productView-details div.form-field select option', (elements) => {
        // remove the first element
        elements.shift();
        return elements.map((element) => {
            return {
                value: element.getAttribute('data-product-attribute-value') || '',
                text: element.textContent || '',
            };
        });
    });

    console.log('sizeOptsRaw:', sizeOptsRaw.map((x) => x.text).join(','));

    for (let i = 0; i < sizeOptsRaw.length; i++) {
        const sizeOpt = sizeOptsRaw[i];
        const sizeNameShort = parseSizeDetail(sizeOpt.text);
        const sizeName = parseSize(sizeOpt.text);

        await page.select('section.productView-details div.form-field select', sizeOpt.value);
        await delay(randomDelay(2000, 4000));

        // get data from input#form-action-addToCart
        const checkoutStatusStr = await page.$eval('input#form-action-addToCart', (element) => {
            return element.getAttribute('value') || '';
        });

        // get price from span.price--withoutTax
        const priceStr = await page.$eval('span.price--withoutTax', (element) => {
            return element.textContent || '';
        });
        const price = parsePrice(priceStr);
        const status = parseCheckoutStatus(checkoutStatusStr);

        // get image urls
        const imgUrls = await fetchImageUrls(page);
        const imageUrls = await saveImagesToDisk(product.id, sizeNameShort, imgUrls);
        product.sizes.push({
            size: sizeName,
            priceStr: priceStr,
            price: {
                price: price.price,
                currency: price.currency,
            },
            imageUrls,
            status: status,
        });
    }

    console.log('fetch many size product done');

    return product;
}
const fetchProduct = async (page: Page, product: Product) => {
    await page.goto(`https://us.jellycat.com${product.url}`);
    await delay(randomDelay(2000, 4000));

    const isSingle = await isSingleProduct(page);

    console.log(`fetch product: ${product.url}, isSingle: ${isSingle}`);
    if (isSingle) {
        const singleProduct = await fetchSingleProduct(page, product);
        return singleProduct;
    }

    const manySizeProduct = await fetchManySizeProduct(page, product);
    return manySizeProduct;
}

const ONE_DAY = 24 * 60 * 60 * 1000;
const fetchDetail = async (page: Page, products: Product[], cp: ProductCheckpoint) => {
    console.log('fetch detail');
    let rs: Product[] = [];
    let checkpointRs: ProductCheckpoint = {};
    const now = Date.now();
    for (let i = 0; i < products.length; i++) {
        console.log('idx', i);
        const productId = products[i].id;
        const existed = cp[productId];

        if (existed !== undefined && existed !== null && (existed.status === 'updated' && (now - existed.lastUpdated) > ONE_DAY)) {
            console.log('skip', productId);
            checkpointRs[productId] = existed;
            continue;
        }

        try {
            const detail = await fetchProduct(page, products[i]);
            rs.push(detail);

            checkpointRs[detail.id] = {
                status: 'updated',
                lastUpdated: now,
            };
        } catch (error) {
            console.log('Error:', error);

            checkpointRs[productId] = {
                status: 'error',
                lastUpdated: now,
            };
        }
    }

    return {
        page,
        products: rs,
        checkpoint: checkpointRs,
    };
}




export default fetchDetail;