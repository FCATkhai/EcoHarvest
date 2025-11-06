// @ts-nocheck
import { Document, Types } from "mongoose";
import { Request } from "express";
import {RestaurantStatus} from "./constant";
// interface User
export interface IUser extends Document {
    _id: Types.ObjectId;
    name: string;
    email: string;
    password: string;
    phone: string;
    role: 'customer' | 'restaurant_owner' | 'admin';
    addresses: string[];
    status?: 'active' | 'banned';
    comparePassword(candidatePassword: string): Promise<boolean>;
}

// interface RestaurantApplication
export interface IRestaurantApplication extends Document {
    _id: Types.ObjectId;
    user_id: Types.ObjectId;
    restaurant_name: string;
    owner_name: string;
    phone: string;
    address: string;
    identify_document: string;
    business_license: string;
    food_safety_certificate: string;
    status: "pending" | "approved" | "rejected";
    createdAt: Date;
    updatedAt: Date;
}

// interface Restaurant
export interface ITimeSlot {
    start: string;
    end: string;
}

export interface IOpenHours {
    day: string;
    time_slots: ITimeSlot[];
}

export interface ICoordinates {
    lat: number;
    lng: number;
}

export interface ILocation {
    address: string;
    district: string;
    province: string;
    province_code: string;
    coordinates: ICoordinates;
}

export interface IRestaurant extends Document {
    _id: Types.ObjectId;
    owner_id: Types.ObjectId;
    name: string;
    thumbnail: string;
    phone?: string;
    status: RestaurantStatus; // before was: is_active: boolean
    open_hours: IOpenHours[];
    rating: number;
    rating_count: number;
    rating_sum: number;
    createdAt: Date;
    updatedAt: Date;
    location: ILocation;
}

// interface Category
export interface ICategory extends Document {
    _id: Types.ObjectId;
    restaurant_id: Types.ObjectId;
    name: string;
    description?: string;
}

// interface Product

export interface IProduct extends Document {
    _id: Types.ObjectId;
    restaurant_id: Types.ObjectId;
    name: string;
    description?: string;
    tags?: string[];
    image: string;
    sales_count: number;
    price: number;
    discount?: number;
    final_price: number;
    status: "available" | "unavailable";
    rating: number;
    rating_count: number;
    rating_sum: number;
    category_id: Types.ObjectId | ICategory;
}

// interface Cart
export interface ICartItem {
    product_id: Types.ObjectId | IProduct;
    name: string;
    quantity: number;
    price: number;
    final_price: number;
    image: string;
}

export interface ICart extends Document {
    _id: Types.ObjectId;
    customer_id: Types.ObjectId;
    restaurant_id: Types.ObjectId | null;
    items: ICartItem[];
}

// interface Order
export interface IOrder extends Document {
    _id: Types.ObjectId;
    customer_id: Types.ObjectId;
    restaurant_id: Types.ObjectId;
    products: {
        product_id: Types.ObjectId | IProduct;
        name: string;
        quantity: number;
        price: number;
        subtotal: number;
    }[];
    total_price: number;
    address: string;
    note?: string;
    status: "pending" | "processing" | "ordering" | "completed" | "reviewed" | "cancelled";
    order_date: Date;
    completed_at?: Date;
}

// notification interface
export interface INotification extends Document {
    _id: Types.ObjectId;
    user_id: Types.ObjectId;
    title: string;
    content?: string;
    url?: string;
    is_read: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// interface Review
export interface IReview extends Document {
    _id: Types.ObjectId;
    customer_id: Types.ObjectId;
    product_id: Types.ObjectId;
    restaurant_id: Types.ObjectId;
    order_id: Types.ObjectId;
    restaurant_service_rating: 1 | 2 | 3 | 4 | 5;
    product_rating: 1 | 2 | 3 | 4 | 5;
    review_text?: string;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
//----------- Statistic --------------
export interface ITopProduct {
    product_id: Types.ObjectId;
    name: string;
    totalSold: number;
}

export interface ITopProductAdmin extends ITopProduct {
    restaurant_id: Types.ObjectId;
}
export interface IMerchantReport extends Document {
    restaurant_id: Types.ObjectId;
    period: 'daily' | 'monthly';
    report_date: Date;
    completed_orders: number;
    revenue: number;
    top_products: ITopProduct[];
}

export interface IAdminReport extends Document {
    period: 'daily' | 'monthly';
    report_date: Date;
    total_orders: number;
    total_revenue: number;
    top_products: ITopProductAdmin[];
    total_users: number;
    total_restaurants: number;
}

//-------------------------
export interface IErrorResponse {
    success: boolean,
    message: string
}


