export interface CategoryWithImageAdminType {
  parent: {
    name: string;
    image: string;
  };
  childs: ChildCategoryType[];
}

export type ChildCategoryType = {
  name: string;
  image: string;
};

export interface CreateProductType {
  title: string;
  description: string;
  price: number;
  stock: number;
  colors: string[];
  discount: number;
  highlights: string[];
  importantNote: string;
  thumbnail: {
    url: string;
    publicId: string;
  };
  images: {
    url: string;
    publicId: string;
  }[];
  category: {
    parent: string;
    child: string;
  };
  warranty?: {
    serviceType: string;
    covered: string;
  };
  specifications: object;
}

export interface CreateCategoryType {
  parentName: string;
  parentImage: ImageType;
}

export interface ChildCreateCategoryType {
  parentName: string;
  childName: string;
  childImage: ImageType;
}
type ImageType = {
  url: string;
  publicId: string;
}
