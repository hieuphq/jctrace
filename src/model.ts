/*
 {
    "id": "BABUCR-019",
    "title": "Bashful Cream Bunny",
    "priceStr": "$14.00",
    "price": {
        "price": "14.00",
        "currency": "$"
    },
    "url": "/bashful-cream-bunny/",
    "status": "Best Seller",
    "isManySize": true,
    "sizes": [
        {
            "size": "Small",
            "price": "$18.00",
            "imageUrls": [
                "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/297/41847/BASS6BC__83612.1727976163.jpg?c=1",
                "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/297/41849/BASS6BC_2__84867.1727976164.jpg?c=1",
                "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/297/41848/BASS6BC_1__68012.1727976164.jpg?c=1"
            ],
            "status": "OOO"
        },
    ],
}
*/
// define product model
export interface Product {
    id: string;
    title: string;
    priceStr: string;
    price: ProductPrice;
    url: string;
    status: string; // Best Seller, New Arrival, OOO
    isManySize: boolean;
    sizes: Size[];
}

// define size model
export interface Size {
    size: string;
    priceStr: string;
    price: ProductPrice;
    imageUrls: string[];
    status: string;
}

// define product price
export interface ProductPrice {
    price: string;
    currency: string;
}

export interface ProductCheckpoint {
    [id: string]: {
        status: string; // new, updated
        lastUpdated: number;
    }
}