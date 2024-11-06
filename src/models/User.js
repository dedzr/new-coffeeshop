const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');
const validator=require('validator');



const UserSchema=new mongoose.Schema({
    name: { 
        type: String,
        required: true,
        default:`User${ Date.now()}`,

        },
    phoneNumber: {
        type: String, 
        unique: [true,"This phone number is already registered"], 
        required: [true ,"You must provide a phonenumber"],
        validate: { // Change 'validator' to 'validate'
            validator: function(value) {
                return validator.isMobilePhone(value, 'bn-BD'); // Return the validation result
            },
            message: props => `${props.value} is not a valid Bangladeshi phone number!`
          },
    },
    password: {
         type: String,   
         required:[true,"please provide a password"],
         minlength:[3,"password must be atleast 3 characters"], 
    },
    isVerified: { type: Boolean, default: false},
    role:{
        type:String,
        enums:['user','admin','super-admin'],
        default:'user',
    }

},
{
    timestamps:true
});

UserSchema.pre('save',async function(){

    if(!this.isModified('password'))
        return;

    const salt=bcrypt.genSaltSync(10);
    this.password=bcrypt.hashSync(this.password,salt);


});

UserSchema.methods.comparePassword=function (candidatePassword)
{
    return bcrypt.compareSync(candidatePassword,this.password);
}




module.exports=mongoose.model("Users",UserSchema);
