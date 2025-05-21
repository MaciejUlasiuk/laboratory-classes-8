const { getDatabase } = require("../database");
const Cart = require("./Cart");

const COLLECTION_NAME = "products";

class Product {
  constructor(name, description, price, _id = null) { 
    this.name = name;
    this.description = description;
    this.price = parseFloat(price);
    if (_id) {
        this._id = _id;
    }
  }

  static async getAll() {
    const db = getDatabase();
    try {
      const products = await db.collection(COLLECTION_NAME).find({}).toArray();
      return products.map(p => new Product(p.name, p.description, p.price, p._id)); 
    } catch (error) {
      console.error("Error occurred while searching for all products:", error);
      return [];
    }
  }

  static async add(productData) { 
    const db = getDatabase();
    const newProduct = new Product(productData.name, productData.description, productData.price);
    try {
      const existingProduct = await this.findByName(newProduct.name);
      if (existingProduct) {
          console.warn(`Product with name "${newProduct.name}" already exists. Not adding.`);
          return;
      }
      await db.collection(COLLECTION_NAME).insertOne(newProduct);
    } catch (error) {
      console.error("Error occurred while adding product:", error);
    }
  }

  static async findByName(name) {
    const db = getDatabase();
    try {
      const searchedProductDoc = await db
        .collection(COLLECTION_NAME)
        .findOne({ name });
      if (searchedProductDoc) {
          return new Product(searchedProductDoc.name, searchedProductDoc.description, searchedProductDoc.price, searchedProductDoc._id);
      }
      return null;
    } catch (error) {
      console.error("Error occurred while searching product by name:", error);
      return null;
    }
  }

  static async deleteByName(name) {
    const db = getDatabase();
    try {
      await db.collection(COLLECTION_NAME).deleteOne({ name });
      await Cart.deleteProductByName(name); 
    } catch (error) {
      console.error("Error occurred while deleting product by name:", error);
    }
  }

  static async getLast() {
    const db = getDatabase();
    try {
      const lastAddedProductDoc = await db
        .collection(COLLECTION_NAME)
        .find({})
        .sort({ _id: -1 })
        .limit(1)
        .toArray()
        .then((docs) => docs[0]);
      if (lastAddedProductDoc) {
          return new Product(lastAddedProductDoc.name, lastAddedProductDoc.description, lastAddedProductDoc.price, lastAddedProductDoc._id);
      }
      return null;
    } catch (error) {
      console.error("Error occurred while searching for last product:", error);
      return null;
    }
  }
}

module.exports = Product;