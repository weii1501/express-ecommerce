const mongoose = require('mongoose');
const validateMongodbid = (id) => {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
        throw new Error('Invalid MongoDB id');
    }
};

module.exports = validateMongodbid;