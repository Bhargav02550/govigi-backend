import CustomerType from "../Models/CustomerType.js";
import BaseRepository from "../Repository/BaseRepository.js";

class CustomerTypesService extends BaseRepository {
    constructor(){
        super(CustomerType);
    }
    async createCustomerType(data) {
        return await this.create(data);
    }

    async getCustomerTypeById(id) {
        return await this.findById(id);
    }

    async getAllCustomerTypes() {
        const customerTypes = await this.findAll();
        return customerTypes.filter(type => type.status === 'active');
    }
}

export default new CustomerTypesService();