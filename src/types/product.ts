export interface CategoryWithImageType{
    parent:{
        name:string,
        image:string,
    },
    childs:{
        name:string,
        image:string,
    },
}

export interface ProductCardType {
    _id: string,
    title: string,
    price: number,
    discount: number,
    thumbnail: { url: string, publicId:string } | string,
  }

export interface ProductCardReturnType extends ProductCardType {
    ratingAndReviews: {
        totalReviews: number,
        avgRating: number,
        totalRating: number
      }
  }