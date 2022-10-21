const mongoose = require("mongoose");
const validator=require("validator")
const alert=require("alert")
mongoose.connect("mongodb://localhost:27017/bankDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const newschema = new mongoose.Schema({
 
    sender:{
        type:String,
        require: true
    },
    receiptner:{
        type:String,
        require: true
    },
    amount:{
      type:Number,
      require:true,
      validate:{
        validator: (value)=>
        {
            if(value.includes(this.amount.type==String))
            {
                req.flash ("amount should be in number")
            }
        }

        
      }
    },
    date:{
        type: Date,
        default: Date.now
    }
  });
  


  newschema.pre("save", function (next) {
    if (this.amount.type==String) {
      alert("this field should be in number")
    }
    next()
  });
  

const user2 = new mongoose.model('user2', newschema);

module.exports = user2;