const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userData = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
   joinedRooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RoomData' }],
   createdRooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RoomData' }]
});

// we hash the the password before saving it to the database i.e we are not stroing the password in plain text for security reasons
userData.pre('save', async function() {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userData.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('UserData', userData);
