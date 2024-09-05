const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const{ listingSchema } = require("./schema.js");


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
main().then(()=>{
    console.log("connect to db");
}).catch((err)=>{
    console.log("the err is ",err);
})
async function main(){
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");// Set EJS as the templating engine
app.set("views", path.join(__dirname,"views"));// Set the views directory
app.use(express.urlencoded({extended: true})); // Parse URL-encoded bodies
app.use(methodOverride("_method"));//method override
app.engine("ejs",ejsMate);// Use EJS Mate for EJS layouts
app.use(express.static(path.join(__dirname,"/public")));// Serve static files from the 'public' directory


app.get("/",(req, res)=>{
    res.send("Hi i am root");
});
// main route for the listing list(1)
app.get("/listings",wrapAsync(async (req,res)=>{
    //this is collection into bd as Listing we just use one mongo query to insert all the data into allListing
   const allListings =await Listing.find({});

   //call the "index.ejs" and provide all the listings we insert into the allListing veriable
   res.render("listings/index.ejs", { allListings });    
}));

//New Route(2)
app.get("/listings/new",(req,res)=>{

    res.render("listings/new.ejs")// Render the new.ejs view for creating a new listing
})

//create Route(2)
app.post(
    "/listings",
    wrapAsync(async(req,res,next)=>{

        let result=listingSchema.validate(req.body);

    console.log(result);
    console.log(req.body);


    if(result.error){
        throw new ExpressError(400, result.error);
    }
   const newListing = new Listing(req.body.listing);//Create a new Listing object with the data from the form which is avalible at new.ejs
   await newListing.save();//save the newlisting to the database
    res.redirect("/listings");// Redirect to the index route to display all listings
   
   
}));

//show Route (3)
app.get("/listings/:id",wrapAsync(async(req,res)=>{
    let {id} = req.params;// Extract the id from the URL parameters
    const listing=await Listing.findById(id);// Find a listing by its id
    res.render("listings/show.ejs",{listing});// Find a listing by its id

}));



//Edit Route(4)
app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
    let{id} = req.params; // Extract the id from the URL parameters
    const listing = await Listing.findById(id); // Find the listing by its id
    res.render("listings/edit",{ listing }); // Render the edit.ejs view and pass the listing to it
}));

//update Route(4)
app.put("/listings/:id",wrapAsync(async(req,res)=>{
    let{id} = req.params;// Extract the id from the URL parameters
    await Listing.findByIdAndUpdate(id,{...req.body.listing});// Update the listing with new data
    // the ... syntax is called the spread operator in JavaScript.
    res.redirect(`/listings/${id}`);// Redirect to the show route to see the updated listing
}));

//delete route(5)
app.delete("/listings/:id",wrapAsync(async(req,res)=>{
    let{id} = req.params;// Extract the id from the URL parameters
    let deleteListing = await Listing.findByIdAndDelete(id); // Find the listing by its id and delete it
    console.log(deleteListing);
    res.redirect("/listings"); // Redirect to the index route to display all remaining listings
}));



app.all("*",(req, res, next)=>{
    next(new ExpressError(404,"Page Not Found"));
})



app.use((err,req,res,next)=>{
    let{statusCode=500, message="something went wrong"}=err;
    res.status(statusCode).render("error.ejs",{err});
    // res.status(statusCode).send(message);
    
});

app.listen(8080, ()=>{
    console.log("server is properly working");
});