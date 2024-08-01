const productModel = require('../models/product.model');

exports.getProduct = async (req, res) => {
    try {
        const prod = await productModel.find({}, '-__v'); // Exclude the '__v' field if not needed
        res.status(200).json(prod);
    } catch (err) {
        res.status(500).json({ message: "Error in loading the data!!" });
    }
};

exports.getHomeProduct=async (req,res)=>{
    try{
        const prod=await productModel.find({})
        console.log(typeof prod);
        res.status(200).json(prod)
    }catch(err){res.json({"message":"Error in loading the data!!"})}
}

exports.getProductData=async (req,res)=>{
    const id=req.params.id;
    try{
        const prod=await productModel.findOne({productId:{$eq:id}});
        if(!prod) res.json({"message":"Product not found"})
        else res.status(200).json(prod)
    }catch(err){
        res.json({"message":"Error in loading the product data!!"})
    }
};

exports.productEditSave=async (req,res)=>{
    const id=req.params.id;

    const {imageUrl,productName,price,description,quantity}=req.body.updatedProduct;
    console.log(typeof req.body);
    try{
        const prod=await productModel.findOneAndUpdate({productId:{$eq:id}},{
            imageUrl:imageUrl,
            productName:productName,
            price:price,
            description:description,
            quantity:quantity
        });
        if(!prod) res.json({"message":"Product not found"})
        else res.status(200).json(prod)
    }catch(err){
        res.json({"message":"Error in loading the product data!!"})
    }
};

exports.productSave=async (req,res)=>{
    try{
        // console.log(req.body);
        const id=req.body.productId
        const prod=await productModel.create({
            productId:req.body.productId,
            imageUrl:req.body.imageUrl,
            productName:req.body.productName,
            price:req.body.price,
            description:req.body.description,
            quantity:req.body.quantity,
            prescriptionRequired:req.body.prescriptionRequired
        });
        await productModel.save();
        console.log(prod);
        res.status(200).json("Hello ",prod)
    }catch(err){
        res.json({"message":"Error in adding the product!!"})
    }
};

exports.productDelete=async (req,res)=>{
    const id=req.params.id;
    try{
        const prod=await productModel.findOneAndDelete({productId:{$eq:id}});
        console.log(prod);
        if(!prod) res.json({"message":"Product not found"})
        else res.status(200).json(prod)
    }catch(err){
        res.json({"message":"Error in deleting the product!!"})
    }
}

exports.getProdData=async (req,res)=>{
    const id=req.params.id;
    console.log(id)
    try{
        const prod=await productModel.findById(id);
        if(!prod) res.json({"message":"Product not found"})
        else res.status(200).json(prod)
    }catch(err){
        res.json({"message":"Error in loading the product data!!"})
    }
};
