import { faker } from "@faker-js/faker";
import Product from "../models/Product.js"

interface ProductType{
  sellerId: string;
  title: string;
  description: object | string;
  price: number;
  stock: number;
  colors: string[];
  discount: number;
  sold: number;
  thumbnail: string;
  images: string[];
  category:{
    parent: string,
    child: string
  } ;
  highlights?: string[];
  warranty?: {
    serviceType: string;
    covered: string;
  };
  specifications: object;
  importantNote?: string;
}

export const createProducts = async (count:number) => {
    let products:ProductType[] = [];

    const images = [
        "https://res.cloudinary.com/doidnfajd/image/upload/v1710499647/payKart/usmrpvjzzfzgyugwl6ou.png",
        "https://res.cloudinary.com/doidnfajd/image/upload/v1710499647/payKart/ooz4goolfqhvzmxrmgxo.png",
        "https://res.cloudinary.com/doidnfajd/image/upload/v1710499647/payKart/bpkrirwcrhwfbgjptyix.png",
        "https://res.cloudinary.com/doidnfajd/image/upload/v1710499647/payKart/yutenk9afhku04bs0bwd.png",
        "https://res.cloudinary.com/doidnfajd/image/upload/v1710499647/payKart/g3prbai8ntnzxxybsl2a.png",
        "https://res.cloudinary.com/doidnfajd/image/upload/v1710499646/payKart/quaxu2lwp6ep4oeezw1y.png"
    ]

    const categories = {
        electronics: [
            "smartwatch",
            "smartphone",
            "phone",
            "refrigerator",
            "laptop",
            "tablet",
            "gamesconsole",
            "camera",
            "drone"
        ],
        clothes: [
            "tshirts",
            "jeans",
            "dresses",
            "shirts",
            "pants",
            "jackets",
            "shoes",
            "underwear",
            "socks"
        ]

    }

    const stocks = [0, 12, 9, 23, 5, 2];

    
    for(let i = 0; i < count; i++){
        const parentCat = faker.number.int(1) === 1? "electronics" : "clothes";

        const newProduct:ProductType = {
            sellerId: "65ffd7527e7c1c0f1592a7f2",
            title: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            price: faker.number.int({min: 799, max: 5000}),
            stock: stocks[faker.number.int(5)],
            colors: [faker.color.rgb(), faker.color.rgb(), faker.color.rgb(), faker.color.rgb(), faker.color.rgb()],
            discount: faker.number.int(50),
            sold: faker.number.int(100),
            thumbnail: images[faker.number.int(5) || 0],
            images: images,
            category: {
                parent: parentCat,
                child: categories[parentCat][faker.number.int(8)]
            },
            highlights: [
                "Meet Galaxy S24 Ultra, the ultimate form of Galaxy Ultra with a new titanium exterior and a 17.25cm (6.8') flat display. It's an absolute marvel of design.",
                "The legacy of Galaxy Note is alive and well. Write, tap and navigate with precision your fingers wish they had on the new, flat display.",
                "With the most megapixels on a smartphone and AI processing, Galaxy S24 Ultra sets the industry standard for image quality every time you hit the shutter. What's more, the new ProVisual engine recognizes objects — improving colour tone, reducing noise and bringing out detail.",
                "A new way to search is here with Circle to Search. While scrolling your fav social network, use your S Pen or finger to circle something and get Google Search results.",
                "Victory can be yours with the new Snapdragon 8 Gen 3 for Galaxy. Faster processing gives you the power you need for all the gameplay you want. Then, manifest graphic effects in real time with ray tracing for hyper-realistic shadows and reflections."
            ],
            warranty: {
              serviceType: "1 Year Service Warranty",
              covered: "Software defect is covered"
            },
            specifications: {
                RAM: "12 GB RAM",
                ROM: "256 GB Storage",
                Display: "17.27 cm (6.8 inch) Quad HD+ Display",
                Processor: "Snapdragon 8 Gen 3 Processor",
                Camera: "200MP + 50MP + 12MP + 10MP | 12MP Front Camera",
                Battery: "5000 mAh Batter"
            }  
        }
        products.push(newProduct)
    }


    Product.create(products).then(() => {
        console.log("Product Created")
    });
}