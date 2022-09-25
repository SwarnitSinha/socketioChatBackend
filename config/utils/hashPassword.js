const bcrypt = require('bcrypt');
const saltRounds = 10;

export const hashPassword = async (password)=>{
    const salt = await bcrypt.genSaltSync(saltRounds);
    const hashedPass = await bcrypt.hashSync(password, salt);

    return hashedPass;
}
//what more I can do