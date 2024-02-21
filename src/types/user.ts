export interface AuthSignupUserType {
  name: string;
  email: string;
  referredUserReferCode?: string;
  referCode?: string;
  gender: "male" | "female" | "transgender";
  password: string;
  phone?: number;
  address: AuthSignupAddressType;
} 

export interface AuthSignupAddressType{
    country: string;
    state: string;
    city: string;
  };
