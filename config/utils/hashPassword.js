const bcrypt = require('bcrypt');
const saltRounds = 10;

const hashPassword = async (password)=>{
    const salt = await bcrypt.genSaltSync(saltRounds);
    const hashedPass = await bcrypt.hashSync(password, salt);

    return hashedPass;
}

const correctPassword = async (enteredPass,originalPass)=>{
    const correct = await bcrypt.compare(enteredPass,originalPass);
    return correct;
}

module.exports = {
    hashPassword,
    correctPassword
}