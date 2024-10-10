function generateProductId(slug: string): string {
    // trim first character if it is '/'
    if (slug[0] === '/') {
        slug = slug.slice(1);
    }
    // Split the slug into words
    const words = slug.split('-');

    // Initialize the ID
    let id = '';

    // Product type identifiers
    const productTypes: { [key: string]: string } = {
        'book': 'BK',
        'backpack': 'BP',
        'bag': 'BG',
        'charm': 'CH',
        'blankie': 'BL',
        'comforter': 'CF',
        'soother': 'ST',
        'decoration': 'DC'
    };

    // Color identifiers
    const colors: { [key: string]: string } = {
        'beige': 'BE',
        'black': 'BL',
        'blue': 'BU',
        'brown': 'BR',
        'cream': 'CR',
        'golden': 'GO',
        'grey': 'GY',
        'pink': 'PK',
        'purple': 'PR',
        'red': 'RD',
        'silver': 'SV',
        'white': 'WH',
        'yellow': 'YE',
        'scarlett': 'SC',
    };

    // Check for product type and color
    let productTypeId = '';
    let colorId = '';

    for (let word of words) {
        if (productTypes[word]) {
            productTypeId = productTypes[word];
        }
        if (colors[word]) {
            colorId = colors[word];
        }
    }

    // Process words to build the main part of the ID
    for (let word of words) {
        if (word.length >= 3 && !colors[word] && !productTypes[word] && id.length < 4) {
            id += word.slice(0, 2).toUpperCase();
        }
        if (id.length >= 4) break;
    }

    // If the ID is still less than 4 characters, pad it with 'X's
    while (id.length < 4) {
        id += 'X';
    }

    // Add color and product type if available
    if (colorId) id += colorId;
    if (productTypeId) id += productTypeId;

    // Add a hyphen and a unique number (using the slug's length for simplicity)
    id += '-' + String(slug.length).padStart(3, '0');

    return id.toLowerCase();
}

async function delay(time: number) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

function randomDelay(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function parsePrice(priceString: string): { price: string, currency: string, someSize: boolean } {
    const regex = /([£$])(\d+\.\d{2})/;
    const match = priceString.match(regex);

    if (!match) {
        throw new Error("Invalid price format: " + priceString);
    }

    const currency = match[1];
    const price = match[2];
    const someSize = priceString.includes("From");

    return {
        price,
        currency,
        someSize
    };
}

function parseCheckoutStatus(checkoutStatus: string): string {
    // Out of stock -> OO
    // Add to Bag -> Available

    const status = checkoutStatus.trim().toLowerCase();

    if (status === 'add to bag') {
        return 'Available';
    }

    if (status === 'out of stock') {
        return 'OO';
    }

    console.log("<<Unknown checkout status>>: ", checkoutStatus);

    return checkoutStatus;
}

const sizeMap: { [key: string]: string } = {
    "One Size": "OS",
    "Original": "OG",
    "Tiny": "TY",
    "Little": "LT",
    "Small": "SM",
    "Medium": "MD",
    "Large": "LG",
    "Big": "BG",
    "Huge": "HG",
    "Really Big": "RB",
    "Giant": "GT"
};
function parseSizeDetail(size: string): string {
    let sizeStr = size;
    if (size.includes("(")) {
        sizeStr = size.slice(0, size.indexOf("(")).trim();
    }

    if (sizeMap[sizeStr]) {
        return sizeMap[sizeStr].toLowerCase();
    }

    console.log("<<Unknown size>>: ", size);
    // remove space and return
    return sizeStr.split(" ").join("").toLowerCase();
}

function parseSize(size: string): string {
    if (size.includes("(")) {
        return size.slice(0, size.indexOf("(")).trim();
    }
    return size;
}

export { generateProductId, delay, parsePrice, randomDelay, parseSize, parseSizeDetail, parseCheckoutStatus };
export * from './page_helper';
export * from './repo';