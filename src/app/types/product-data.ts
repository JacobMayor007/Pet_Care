export interface ProductFeature{
    id:string;
    name: string;
    price: string;
}

export interface ProductFormData{
    productName: string;
    productDescription: string;
    productPrice: number;
    productFeature: ProductFeature[];
    typeOfPayment: string;
}