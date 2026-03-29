var express = require('express');
var router = express.Router();
let productModel = require('../schemas/products')
let InventoryModel = require('../schemas/inventories')
let { ConvertTitleToSlug } = require('../utils/titleHandler')
let { getMaxID } = require('../utils/IdHandler');
const { default: mongoose } = require('mongoose');

//getall
router.get('/', async function (req, res, next) {
  try {
    let products = await productModel.find({ isDeleted: false });
    // Add id field for frontend compatibility
    let formattedProducts = products.map(product => ({
      ...product.toObject(),
      id: product._id.toString()
    }));
    res.send(formattedProducts)
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

//get by ID
router.get('/:id', async function (req, res, next) {
  try {
    let result = await productModel.findById(req.params.id);
    if (result) {
      // Add id field for frontend compatibility
      let formattedResult = {
        ...result.toObject(),
        id: result._id.toString()
      };
      res.send(formattedResult)
    } else {
      res.status(404).send({
        message: "id not found"
      })
    }
  } catch (error) {
    res.status(404).send({
      message: "id not found"
    })
  }
});

router.post('/', async function (req, res, next) {
  try {
    let newItem = new productModel({
      title: req.body.title,
      slug: ConvertTitleToSlug(req.body.title),
      price: req.body.price,
      description: req.body.description,
      category: req.body.category,
      author: req.body.author || "",
      quantity: req.body.quantity || 0,
      categoryId: (req.body.categoryId && req.body.categoryId !== "undefined" && req.body.categoryId !== "") ? req.body.categoryId : null,
      image: req.body.image,
      supplierName: req.body.supplierName || "",
      coverType: req.body.coverType || "Bìa mềm",
      translator: req.body.translator || "None",
      publisher: req.body.publisher || "",
      discountCode: req.body.discountCode || "None"
    })
    
    let newProduct = await newItem.save();
    console.log(newProduct);
    
    // Create inventory without transaction
    try {
      let newInventory = new InventoryModel({
        product: newProduct._id,
        stock: req.body.quantity || 1
      })
      await newInventory.save();
    } catch (invError) {
      console.log('Inventory creation failed:', invError.message);
    }
    
    // Add id field for frontend compatibility
    let formattedProduct = {
      ...newProduct.toObject(),
      id: newProduct._id.toString()
    };
    res.send(formattedProduct);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
})

router.put('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    
    // Handle categoryId undefined
    let updateData = { ...req.body };
    if (updateData.categoryId === "undefined" || updateData.categoryId === "") {
      updateData.categoryId = null;
    }
    
    let updatedItem = await productModel.findByIdAndUpdate(
      id, updateData, {
      new: true
    })
    // Add id field for frontend compatibility
    let formattedItem = {
      ...updatedItem.toObject(),
      id: updatedItem._id.toString()
    };
    res.send(formattedItem)
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
})

router.delete('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let updatedItem = await productModel.findByIdAndUpdate(
      id, {
      isDeleted: true
    }, {
      new: true
    })
    // Add id field for frontend compatibility
    let formattedItem = {
      ...updatedItem.toObject(),
      id: updatedItem._id.toString()
    };
    res.send(formattedItem)
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
})

module.exports = router;
