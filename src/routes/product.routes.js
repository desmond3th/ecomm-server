import { Router } from "express";
import { 
    addProduct, updateProduct, getProductByCategory, getProductById, 
    getAllProducts } from "../controllers/product.controller.js";
import {createProductValidator, updateProductValidator } from "../../validators/product.validator.js";
import { mongoIdPathVariableValidator } from "../../validators/mongodb.validator.js";
import { validate } from "../../validators/validator";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = new Router();

router.route('/add-product').post(verifyJWT, upload.single("productImage"), createProductValidator(), validate,  addProduct);

router.route('/update-product/:productId')
.patch(verifyJWT, upload.single("productImage"), 
updateProductValidator(), mongoIdPathVariableValidator("productId"), updateProduct);

router.route('/get-product/:productId').get(mongoIdPathVariableValidator("productId"), getProductById);
router.route('/get-product-by-category/:categoryId').get(mongoIdPathVariableValidator("categoryId"), getProductByCategory);

router.route('/get-all-products').get(getAllProducts);