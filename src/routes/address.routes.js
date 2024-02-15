import { Router } from "express";
import { 
    addAddress, updateAddress, getAllAddresses,deleteAddress,
    getAdressById } from "../controllers/address.controller";
import { addAddressValidator, updateAddressValidator } from "../../validators/address.validator";
import { validate } from "../../validators/validator";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = new Router();

router.use(verifyJWT)

router.route("/add-address").post(addAddressValidator(), validate, addAddress);
router.route("/get-addresses").get(getAllAddresses);

router.route("/update-address/:addressId")
    .patch(updateAddressValidator(), mongoIdPathVariableValidator("addressId"), validate, updateAddress);
router.route("/delete-address/:addressId").delete(mongoIdPathVariableValidator("addressId"), validate, deleteAddress);
router.route("get-address-by-id/:addressId").get(mongoIdPathVariableValidator("addressId"), validate, getAdressById);

export default router;