const Order = require("../models/order");
const Product = require("../models/product");

exports.createOrder = async (req, res) => {
  try {
    const {
      shippingInfo,
      orderItems,
      paymentInfo,
      taxAmount,
      shippingAmount,
      totalAmount,
    } = req.body;

    const order = await Order.create({
      user: req.user._id,
      shippingInfo,
      orderItems,
      paymentInfo,
      taxAmount,
      shippingAmount,
      totalAmount,
    });

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).send("error while creating order: " + error.message);
  }
};

exports.getOneOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user", // it is the field of order schema
      "name email" // it is the field of user schema
    ); // here populate method extract name and email of user that has placed order.
    if (!order) {
      res.status(404).send("no order found");
      return;
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).send("Error while getting one order: " + error.message);
  }
};

// getting all the order placed by a user
exports.userGetOrder = async (req, res) => {
  try {
    const order = await Order.find({ user: req.user._id });
    if (!order) {
      res.status(301).send("you haven't placed any order yet.");
      return;
    }
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res
      .status(500)
      .send("error while getting order of a user: " + error.message);
  }
};

exports.adminGetAllOrder = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json({ orders });
  } catch (error) {
    res.status(501).send("error admin getting all orders: " + error.message);
  }
};

exports.adminUpdateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order.orderStatus === "Delivered") {
      res.status(301).send("order has been delivered already");
      return;
    }
    order.orderStatus = req.body.orderStatus;
    order.orderItems.forEach(async (item) => {
      await updateProductStock(item.product, item.quantity);
    });
    await order.save();
    res.status(200).json({ order });
  } catch (error) {
    res.status(501).send("error while admin updating order: " + error.message);
  }
};

// this is simple function that helps to update stock of product.
async function updateProductStock(productId, quantity) {
  const product = await Product.findById(productId);
  // here we can check the stock of the product and avialbility of product then we have to move on.
  if (quantity > product.stock) {
    return `we have ${product.stock} product only available`;
  }
  if (product.stock === 0) {
    return `${product.name} is out of stock`;
  }
  product.stock = product.stock - quantity;
  await product.save({ validateBeforeSave: false });
}

exports.adminDeleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      res.status(404).send("order is not available");
      return;
    }
    res.status(200).send("Order deleted");
  } catch (error) {
    res.status(501).send("error while deleting order: " + error.message);
  }
};
