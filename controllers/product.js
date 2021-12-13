const Product = require('../models/product')
const path = require('path')

const formidable = require('formidable')
const _ = require('lodash')
const fs = require('fs')
const { sortBy } = require('lodash')

exports.getProductbyId = (req, res, next, id) =>{
    Product.findById(id)
    .populate('category')
    .exec((err,product) =>{
        if(err){
            return res.status(400).json({
                error: "Product not found"
            })
        }
        req.product = product
        next()
    })
}
exports.createProduct = (req, res) =>{
    let form = new formidable.IncomingForm()
    form.keepExtensions = true;

    form.parse(req, (err,fields, file)=> {
        if(err){
            return res.status(400).json({
                error: "Issues with image"
            })
        }

        //destructuring field
        const {name, description, price, category, stock} = fields
        
        //need to provide validation at route level and remove this check here
        if( !name || !description ||!price || !category || !stock){
            return res.status(400).json({
                error: "Please include all fields"
            })
        }

        let product = new Product(fields)

        //handle file
        if(file.photo){
            //max size(approx 3MB)
            if(file.photo.size > 3000000){
                return res.status(400).json({
                    error: "Image is too large"
                })
            }
            product.photo.data = fs.readFileSync(file.photo.filepath)
            product.photo.contentType = file.photo.mimetype
        }
        //save to DB
        product.save((err,product)=> {
            if(err){
                res.status(400).json({
                    error: "Saving t-shirt in database failed"
                })
            }
            res.json(product)
        })
    })
}

exports.getProduct = (req, res) =>{
    req.product.photo = undefined
    return res.json(req.product)
}
//middleware --load photo in the background to avoid perf hit in above req
exports.photo = (req, res, next) => {
    if(req.product.photo.data){
        res.set('Content-Type', req.product.photo.contentType)
        return res.send(req.product.photo.data)
    }
    next()
}  

//delete controllers

exports.deleteProduct = (req, res) => {
    let product = req.product
    product.remove((err, deletedProduct) => {
        if(err){
            return res.status(400).json({
                error: "Failed to delete the product"
            })
        }
        res.json({
            message: "Deletion was successful !!",
            deletedProduct
        })
    })

}
//update controllers

exports.updateProduct = (req, res) => {
    let form = new formidable.IncomingForm()
    form.keepExtensions = true;

    form.parse(req, (err,fields, file)=> {
        if(err){
            return res.status(400).json({
                error: "Issues with image"
            })
        }

        //updation code
        let product = req.product
        product = _.extend(product, fields)

        //handle file
        if(file.photo){
            //max size(approx 3MB)
            if(file.photo.size > 3000000){
                return res.status(400).json({
                    error: "Image is too large"
                })
            }
            product.photo.data = fs.readFileSync(file.photo.filepath)
            product.photo.contentType = file.photo.mimetype
        }
        //save to DB
        product.save((err,product)=> {
            if(err){
                res.status(400).json({
                    error: "Updation of product failed "
                })
            }
            res.json(product)
        })
    })

    
}

exports.getAllProducts = (req, res) => {
    let limit = req.query.limit ? parseInt(req.query.limit) : 8
    let sortBy = req.query.sortBy? req.query.sortBy: '_id'
    Product.find()
    .select('-photo')
    .populate('category')
    .sort([[sortBy, 'asc']])
    .limit(limit)
    .exec((err, products) => {
        if(err){
            return res.status(400).json({
                error: "No products found"
            })
        }
        res.json(products)
    })
}

exports.getAllUniqueCategories = (req, res) => {
    Product.distinct('category', {}, (err, category) => {
        if(err){
            return res.status(400).json({
                error: "No category found"
            })
        }
        res.json(category)
    })
}

exports.updateStock = (req, res, next) => {

    let myOperations = req.body.order.products.map(prod => {
        return {
            updateOne: {
                filter: {_id: prod._id },
                update: {$inc: {stock: -prod.count, sold: +prod.count}}
            }
        }
    })
//decrease stock and increase sold
    Product.bulkWrite(myOperations, {}, (err,products) => {
        if(err){
            return res.status(400).json({
                error: "Bulk Operations failed"
            })
        }
        next()
    })

}