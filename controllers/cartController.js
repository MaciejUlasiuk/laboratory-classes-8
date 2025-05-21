const Product = require("../models/Product");
const Cart = require("../models/Cart");
const { STATUS_CODE } = require("../constants/statusCode");

exports.addProductToCart = async (request, response) => {
  const productName = request.body.productName; 
  if (!productName) {
    return response.status(STATUS_CODE.BAD_REQUEST).json({ success: false, message: "Product name is required." });
  }

  try {
    const product = await Product.findByName(productName);
    if (!product) {
      return response.status(STATUS_CODE.NOT_FOUND).json({ success: false, message: "Product not found." });
    }
    await Cart.add(product); 
    response.status(STATUS_CODE.OK).json({ success: true, message: "Product added to cart." });
  } catch (error) {
    console.error("Error in addProductToCart:", error);
    response.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ success: false, message: "Failed to add product to cart." });
  }
};

exports.getProductsCount = async () => {
  return await Cart.getProductsQuantity();
};