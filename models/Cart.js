const Product = require("./Product"); 
const { getDatabase } = require("../database");

const COLLECTION_NAME = "carts";

class Cart {
  constructor() {}

  static async getCart() {
    const db = getDatabase();
    try {
      const cart = await db.collection(COLLECTION_NAME).findOne({});
      if (!cart) {
        await db.collection(COLLECTION_NAME).insertOne({ items: [] });
        return { items: [] };
      }
      return cart;
    } catch (error) {
      console.error("Error occurred while searching cart:", error);
      return { items: [] };
    }
  }

  static async add(product) { 
    if (!product || !product.name || typeof product.price !== 'number') {
        console.error("Invalid product data passed to Cart.add:", product);
        throw new Error("Invalid product data for adding to cart.");
    }
    const db = getDatabase();
    try {
      const cart = await this.getCart();
      const searchedProductIndex = cart.items.findIndex(
        (item) => item.product._id && product._id && item.product._id.toString() === product._id.toString()
      );

      if (searchedProductIndex > -1) {
        cart.items[searchedProductIndex].quantity += 1;
      } else {
        cart.items.push({ product: { _id: product._id, name: product.name, price: product.price, description: product.description }, quantity: 1 });
      }

      await db
        .collection(COLLECTION_NAME)
        .updateOne({}, { $set: { items: cart.items } }, { upsert: true }); 
    } catch (error) {
      console.error("Error occurred while adding product to cart:", error);
      throw error; 
    }
  }

  static async getItems() {
    try {
      const cart = await this.getCart();
      return cart.items;
    } catch (error) {
      console.error("Error occurred while searching for products in cart:", error);
      return [];
    }
  }

  static async getProductsQuantity() {
    try {
      const cart = await this.getCart();
      if (!cart || !cart.items) return 0;
      const productsQuantity = cart.items.reduce(
        (total, item) => total + item.quantity,
        0
      );
      return productsQuantity;
    } catch (error) {
      console.error("Error occurred while getting quantity of items in cart:", error);
      return 0;
    }
  }

  static async getTotalPrice() {
    try {
      const cart = await this.getCart();
      if (!cart || !cart.items) return 0;
      const totalPrice = cart.items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
      );
      return totalPrice;
    } catch (error) {
      console.error(
        "Error occurred while calcualting total price of items in cart:", error
      );
      return 0;
    }
  }

  static async clearCart() {
    const db = getDatabase();
    try {
      await db
        .collection(COLLECTION_NAME)
        .updateOne({}, { $set: { items: [] } });
    } catch (error) {
      console.error("Error occurred while clearing cart:", error);
    }
  }

  static async deleteProductByName(productName) {
    const db = getDatabase();
    try {
      const cart = await this.getCart();
      const updatedItems = cart.items.filter(
        (item) => item.product.name !== productName
      );
      if (cart.items.length !== updatedItems.length) {
        await db
          .collection(COLLECTION_NAME)
          .updateOne({}, { $set: { items: updatedItems } });
      }
    } catch (error) {
      console.error("Error occurred while deleting product from cart:", error);
    }
  }
}

module.exports = Cart;