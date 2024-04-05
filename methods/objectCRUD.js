const validateMongodbid = require("../utils/validateMongodbid");

class objectCRUD {
  constructor(model) {
    this.model = model;
    this.createdData = {};
    this.updatedData = {};
  }

  async create(obj) {
    try {
      const newObj = await new this.model(obj);
      console.log(newObj);
      newObj.save();
      this.createdData = newObj;
      return newObj;
    } catch (error) {
      throw new Error("Product not created");
    }
  }

  get() {}

  async update(_id, obj) {
    validateMongodbid(_id);
    try {
      const updatedObj = await this.model.findByIdAndUpdate(_id, obj, { new: true });
      console.log(updatedObj);
      this.updatedData = updatedObj;
      return updatedObj;
    } catch (error) {
      throw new Error(`Error: ${error}`);
    }
    // return null;
  }

  delete(index) {}
}

module.exports = objectCRUD;
