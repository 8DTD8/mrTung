var express = require('express');
var router = express.Router();
let reviewModel = require('../schemas/reviews')
let { checkLogin, checkRole } = require('../utils/authHandler')

//getall
router.get('/', async function (req, res, next) {
  let reviews = await reviewModel.find({}).populate('user', 'username email').populate('product', 'title');
  res.send(reviews)
});

//get pending reviews (admin only) - MUST come before /:id
router.get('/pending', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    let reviews = await reviewModel.find({ status: 'pending', isDeleted: false }).populate('user', 'username email').populate('product', 'title');
    res.send(reviews);
  } catch (error) {
    res.status(500).send({
      message: error.message
    })
  }
});

//get reviews by product - MUST come before /:id
router.get('/product/:productId', async function (req, res, next) {
  try {
    let result = await reviewModel.find({ product: req.params.productId }).populate('user', 'username email').populate('product', 'title');
    res.send(result)
  } catch (error) {
    res.status(500).send({
      message: error.message
    })
  }
});

//get reviews by user - MUST come before /:id
router.get('/user/:userId', async function (req, res, next) {
  try {
    let result = await reviewModel.find({ user: req.params.userId }).populate('user', 'username email').populate('product', 'title');
    res.send(result)
  } catch (error) {
    res.status(500).send({
      message: error.message
    })
  }
});

//get by ID - MUST come last
router.get('/:id', async function (req, res, next) {
  try {
    let result = await reviewModel.findById(req.params.id).populate('user', 'username email').populate('product', 'title');
    if (result) {
      res.send(result)
    } else {
      res.status(404).send({
        message: "review not found"
      })
    }
  } catch (error) {
    res.status(404).send({
      message: "review not found"
    })
  }
});

router.post('/', checkLogin, async function (req, res, next) {
  try {
    let newItem = new reviewModel({
      product: req.body.productId,
      user: req.userId,
      rating: req.body.rating,
      comment: req.body.comment
    })
    await newItem.save();
    // Populate user and product for response
    let populatedReview = await reviewModel.findById(newItem._id).populate('user', 'username email').populate('product', 'title');
    res.send(populatedReview);
  } catch (error) {
    res.status(500).send({
      message: error.message
    })
  }
});

router.put('/:id', checkLogin, async function (req, res, next) {
  try {
    let updatedItem = await reviewModel.findByIdAndUpdate(
      req.params.id, {
        rating: req.body.rating,
        comment: req.body.comment
      }, {
        new: true
      }
    ).populate('user', 'username email').populate('product', 'title');
    
    if (!updatedItem) {
      return res.status(404).send({
        message: "review not found"
      });
    }
    
    res.send(updatedItem);
  } catch (error) {
    res.status(500).send({
      message: error.message
    })
  }
});

//approve review (admin only)
router.put('/:id/approve', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    let updatedItem = await reviewModel.findByIdAndUpdate(
      req.params.id, {
        status: 'approved'
      }, {
        new: true
      }
    ).populate('user', 'username email').populate('product', 'title');
    
    if (!updatedItem) {
      return res.status(404).send({
        message: "review not found"
      });
    }
    
    res.send(updatedItem);
  } catch (error) {
    res.status(500).send({
      message: error.message
    })
  }
});

router.delete('/:id', checkLogin, async function (req, res, next) {
  try {
    let deletedItem = await reviewModel.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).send({
        message: "review not found"
      });
    }
    res.send({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).send({
      message: error.message
    })
  }
});

module.exports = router;