import { KeyInput, Page } from "puppeteer";

const acceptCookies = async (page: Page) => {
    try {
        const btn = await page.waitForSelector('button#onetrust-accept-btn-handler', { timeout: 5000 });
        await btn?.click();
    } catch (error) {
        console.log('Accept cookies error:', error);
    }
}

const scrollToBottom = async (page: Page) => {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve(null);
                }
            }, 100);
        });
    });
};

const sendKeyToPage = async (page: Page, key: KeyInput) => {
    await page.keyboard.press(key);
}

export { acceptCookies, scrollToBottom, sendKeyToPage };