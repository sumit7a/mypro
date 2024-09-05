const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title:{
        type: String,
        required:true,
    },
    description: String,

    image:{                             
        url: String,
        default:"https://images.unsplash.com/photo-1544894079-e81a9eb1da8b?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZnJlZSUyMGltYWdlc3xlbnwwfHwwfHx8MA%3D%3D",
        set:(v)=>(v === ""
        ?"https://picsum.photos/id/1/200/300"
        : v),
    },

    price: Number,
    location: String,
    country: String, 
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;


