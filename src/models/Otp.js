
const mongoose=require('mongoose');

OtpSchema = new mongoose.Schema({

    phoneNumber: { type: String, required: true ,unique:true},
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true }
  },{
    timestamps:true,
  });



module.exports=mongoose.model('Otps',OtpSchema);
