const express = require("express");
const app = express()
const mongoose = require("mongoose");
const Listing = require("../Major Project/models/listing.js")
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


main()
    .then(() => {
        console.log("connection to DB");
    })
    .catch(err => {
        console.log(err)
    });

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
};


app.get("/", (req, res) => {
    res.send("Hi , I am root")
});

//Index Route
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//New Route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
})

//Show Route
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
}));

//create Route
app.post("/listings", wrapAsync(async(req, res) => {
    let { title, description, image, price, country } = req.body;

    let result = listingSchema.validate(req.body)
    console.log(result)
    const newListing = new Listing({ title: title, descrription: description, image: image, price: price, country: country });
    await newListing.save();
    res.redirect("/listings");
}));

//Edit and Update Route

app.get("/listings/:id/edit" ,wrapAsync(async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});

}));

app.put("/listings/:id" , wrapAsync(async(req,res) =>{
    let {id} = req.params;
    let { title, description, image, price, country } = req.body;
    await Listing.findByIdAndUpdate(id , { title: title, descrription: description, image: image, price: price, country: country });
   res.redirect("/listings");

}));

app.delete("/listings/:id", wrapAsync(async(req,res) => {
    let {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");

}));

// error handling for any other route
app.all("*" ,(req,res,next) => {
    next(new ExpressError(404,"page not found"));
})

app.use((err,req,res,next) => {
    let{statusCode=500,message="Something went wrong!"}= err;
    res.status(statusCode).render("error.ejs",{message})
    // res.status(statusCode).send(message);
    
});



// app.get("/testlisting",async (req,res) => {
//     let sampleListenting = new Listing ({
//         title:"My new Villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Calangute,Goa",
//         country:  "India",
//     });

//     await sampleListenting.save();
//     console.log("sample was saved");
//     res.send("successfull testing");
// })

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});
