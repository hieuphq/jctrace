import { Product } from "../model";
import fs from 'fs';

async function saveProductsToDisk(products: Product[], filePath: string) {
    // try open products.json to parse the content
    // if the file is not existed, create a new one
    let existedProducts: Product[] = [];
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        existedProducts = JSON.parse(data);
    } catch (error) {
        console.log('Error:', error);
    }

    if (existedProducts.length === 0) {
        fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
        return;
    }

    // merge the new products with the existed products
    // make sure there is no duplicated product
    const newProducts = existedProducts.concat(products);
    const uniqueProducts = newProducts.filter((product, index, self) =>
        index === self.findIndex((t) => (
            t.id === product.id
        ))
    );

    fs.writeFileSync(filePath, JSON.stringify(uniqueProducts, null, 2));
}

export { saveProductsToDisk };