import { Router } from "express";
import { getUserCart, clearCart, deleteCart, addOrUpdateCartQuantity } from "../controllers/cart.controller";
import { addItemOrUpdateQuantityValidator } from "../../validators/cart.validator";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../../validators/validator.js";
import { mongoIdPathVariableValidator } from "../../validators/mongodb.validator";

const router = new Router();

router.use(verifyJWT);

router.route("/get-user-cart").get(getUserCart);

router.route("/clear").delete(clearCart);

router.route("/item/:productId")
.post(mongoIdPathVariableValidator("productId"), addItemOrUpdateQuantityValidator(), validate, addOrUpdateCartQuantity);

router.route("/item/:productId").delete(mongoIdPathVariableValidator("productId"), validate, deleteCart);

export default router;