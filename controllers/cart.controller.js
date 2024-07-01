require('dotenv').config()
const jwt=require('jsonwebtoken')
const {cartModel} = require('../models/cart.model');
const {productModel} = require('../models/product.model');
const {userModel}=require('../models/user.model')

exports.addToCart = async (req, res) => {
    const productId = req.params.id;
    const userId = req.body.userId;
  
    console.log("Received request to add to cart");
    console.log("Product ID:", productId);
    console.log("User ID:", userId);
  
    try {
      const product = await productModel.findById(productId);
      if (!product) {
        console.error("Product not found:", productId);
        return res.status(404).json({ message: "Product not found" });
      }
      else if(product.quantity<=0){
        console.log("Product is Out Of stock")
        return res.json({message:"Product is Out Of stock",status:false});
      }
      const pricePerItem = product.price;
      const cartFind = await cartModel.findOne({ userId });
  
      if (cartFind) {
        const idx = cartFind.items.findIndex((c) => c.cartItemID === productId);
        if (idx !== -1) {
          cartFind.items[idx].quantity += req.body.quantity;
        } else {
          cartFind.items.push({
            cartItemID: productId,
            productName: product.productName,
            quantity: req.body.quantity,
            pricePerUnit:pricePerItem,
            price: req.body.quantity * pricePerItem,
            prescription: product.prescriptionRequired,
          });
        }
        await cartFind.save();
        console.log("Updated cart for user:", userId);
        return res.status(201).json({ message: "Updated cart" });
      } else {
        const cartItem = await cartModel.create({
          userId,
          items: [{
            cartItemID: productId,
            productName: product.productName,
            quantity: req.body.quantity,
            price: req.body.quantity * pricePerItem,
            prescription: product.prescriptionRequired,
          }],
        });
        console.log("Created new cart for user:", userId);
        return res.status(201).json({ message: "Cart created" });
      }
    } catch (error) {
      console.error("Error occurred while adding to cart:", error);
      res.status(500).json({ message: "An error occurred while adding to cart" });
    }
  };
  



exports.showCart = async (req, res) => {
    const userId = req.body.userId;
    try {
        const cartItems = await cartModel.findOne({userId:userId});
        // console.log(cartItems.items)
        return res.status(200).json(cartItems.items);
    }
    catch (error) {
        console.error("Error fetching cart items:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

exports.deleteCartItem = async (req, res) => {
    const userId = req.body.userId; 
    const cartItemId = req.params.id; 
    try {
        const cart = await cartModel.findOne({userId:{$eq:userId}});
        if (!cart) {
            return res.status(404).json({ message: "Cart item not found" });
        }
        else{
            const idx=cart.items.findIndex(citem=>citem.cartItemID==cartItemId)
            if(idx==-1) res.status(404).json({message:"Item not fount in cart"})
            else{
                cart.items.splice(idx,1);
                await cart.save()
                res.status(200).json({ message: "Cart item deleted successfully" });
            }          
        }
    } 
    catch (error) {
        console.error("Error deleting cart item:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.incrementItem=async (req,res)=>{
    const userId=req.body.userId
    const pid=req.params.productId
    console.log(userId,pid);
    try{
        const cart=await cartModel.findOne({userId:userId}); 
        const prod=await cart.items.findIndex((p)=>p.cartItemID===pid)
        if(prod==-1){
            return res.status(404).json({message:"Product Not Found in Cart"})
        }

        const prodDet=await productModel.findById(pid)
        const perProdPrice=prodDet.price;
        
        cart.items[prod].quantity+=1;
        if(cart.items[prod].quantity>prodDet.quantity){
            return res.json({message:"Cannot add product,Out Of Stock"})
        }
        cart.items[prod].pricePerUnit=perProdPrice;
        cart.items[prod].price=(cart.items[prod].quantity)*perProdPrice;
        await cart.save();
        return res.json({messsage:"quantity increased"})
    }
    catch(err){
      console.log(err);
        res.json({message:"Error in adding new Product"})
    }
}

exports.decrementItem=async (req,res)=>{
    const userId=req.body.userId
    const pid=req.params.productId
    try{
        const cart=await cartModel.findOne({userId:userId});
        const prod=await cart.items.findIndex((p)=>p.cartItemID===pid)
        if(prod==-1){
            return res.status(404).json({message:"Product Not Found in Cart"})
        }
        const perProdPrice=(cart.items[prod].price)/(cart.items[prod].quantity);
        cart.items[prod].quantity-=1;
        if(cart.items[prod].quantity===0){
            cart.items.splice(prod,1);
            await cart.save();
            return res.json({message:"Product is removed from cart"})
        }
        cart.items[prod].price=(cart.items[prod].quantity)*perProdPrice;
        await cart.save();
        return res.json({messsage:"quantity decreased"})
    }
    catch(err){
        res.json({message:"Error in removing new Product"})
    }
}
