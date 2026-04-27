import CustomerTypesService from "../Services/CustomerTypesService.js";

export const createCustomerType = async (req, res) => {
    try {
        const customerTypeData = req.body;
        const newCustomerType = await CustomerTypesService.createCustomerType(customerTypeData);
        res.status(201).json(newCustomerType);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllCustomerTypes = async (req,res) => {
    try{
        const allCustomerTypes = await CustomerTypesService.getAllCustomerTypes();
        res.status(200).json({ types: allCustomerTypes });
    }
    catch(error){
        res.status(500).json({error:error.message})
    }
}