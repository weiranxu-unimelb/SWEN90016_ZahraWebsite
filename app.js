// app.js
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');

// Initialize the app.
const app = express();
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// DB connect code for 'mongoose' package.
const uri = "mongodb+srv://weiranx1:weiranxu123@swen90016.kohjae3.mongodb.net/Zahra_Data?retryWrites=true&w=majority";
mongoose.connect(uri, {
    useNewUrlParser: true,
});

// Get the connection status.
var connection = mongoose.connection;
connection.on('connected', function (err) {
    if (err) console.log('Bad connection: ' + err);
    else console.log('Successfully connect to the database.');
});

// Usercase 1.
// Create the customer schema.
const customerSchema = mongoose.Schema({
    name: String,
    age: Number,
    email: String,
    shippingAddress: String,
    billingAddress: String,
    primaryContact: String,
    secondaryContact: String,
    identifyingDocument: String,
    newsletter: String
});
const Customer = mongoose.model('Customer', customerSchema);
// Set Multer
const storage_PDF = multer.diskStorage({
    destination: 'uploads/PDF/',
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const fileName = file.originalname.replace(ext, '') + Date.now() + ext;
        cb(null, fileName);
    }
});
const uploadPDF = multer({ storage: storage_PDF, });
// Set Ejs
app.set('view engine', 'ejs');
// Router
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/customer', (req, res) => {
    res.render('customer');
});

app.post('/submit', uploadPDF.single('identifyingDocument'), (req, res) => {
    const customer = new Customer({
        name: req.body.name,
        age: req.body.age,
        email: req.body.email,
        shippingAddress: req.body.shippingAddress,
        billingAddress: req.body.billingAddress,
        primaryContact: req.body.primaryContact,
        secondaryContact: req.body.secondaryContact,
        identifyingDocument: req.file.filename,
        newsletter: req.body.newsletter
    });

    customer.save()
        .then(() => {
            res.render('customer_success');
        })
        .catch((error) => {
            console.log('Failed to save customer details', error);
            res.render('customer_error');
        });
});

// Usercase 5,6,7.
// Create CarpetCategory schema.
const carpetCategorySchema = new mongoose.Schema({
    name: String,
});

// Create CarpetItem schema.
const carpetItemSchema = new mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CarpetCategory'
    },
    length: Number,
    breadth: Number,
    weight: Number,
    dimensions: String,
    colour: String,
    pattern: String,
    dominantColour1: String,
    dominantColour2: String,
    images: [String],
    size: {
        type: String,
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    },
    numericSize: Number,
    quantity: Number,
    countryOfOrigin: String
});

// Create CarpetKitItem schema.
const carpetKitItemSchema = new mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CarpetCategory'
    },
    length: Number,
    breadth: Number,
    weight: Number,
    dimensions: String,
    images: [String],
    quantity: Number,
    countryOfPackaging: String
});


// Create model.
const CarpetCategory = mongoose.model('CarpetCategory', carpetCategorySchema);
const CarpetItem = mongoose.model('CarpetItem', carpetItemSchema);
const CarpetKitItem = mongoose.model('CarpetKitItem', carpetKitItemSchema);

// Usercase 5 -> Create carpet category.
app.get('/carpetCategories', (req, res) => {
    res.render('carpetCategories');
});

app.post('/carpet-category', async (req, res) => {
    const carpetCategory = new CarpetCategory({
        name: req.body.name
    });

    carpetCategory.save()
        .then(() => {
            res.render('carpetCategories_success');
        })
        .catch((error) => {
            console.log('Failed to save carpet category details', error);
            res.render('carpetCategories_error');
        });
});

// Usercase 6 -> Create carpet item.
// Get all carpet categories.
app.get('/carpetItems', async (req, res) => {
    try {
        const carpetCategories = await CarpetCategory.find();
        res.render('carpetItems', {
            carpetCategories: carpetCategories
        });
    } catch (error) {
        console.log('Failed to retrieve carpet categories', error);
        res.render('carpetKitItems_error');
    }
});

const storage_item = multer.diskStorage({
    destination: 'uploads/PNG_item/',
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const fileName = file.originalname.replace(ext, '') + Date.now() + ext;
        cb(null, fileName);
    }
});

const uploadPNG_item = multer({ storage: storage_item, });

app.post('/carpet-item', uploadPNG_item.array('images'), async (req, res) => {
    try {
        const files = req.files;
        const filePaths = files.map(file => file.path + path.extname(file.originalname));
        const carpetItem = new CarpetItem({
            category: req.body.category,
            length: req.body.length,
            breadth: req.body.breadth,
            weight: req.body.weight,
            dimensions: req.body.dimensions,
            colour: req.body.colour,
            pattern: req.body.pattern,
            dominantColour1: req.body.dominantColour1,
            dominantColour2: req.body.dominantColour2,
            images: filePaths,
            size: req.body.size,
            numericSize: req.body.numericSize,
            quantity: req.body.quantity,
            countryOfOrigin: req.body.countryOfOrigin
        });

        await carpetItem.save();
        res.render('carpetItems_success');
    } catch (error) {
        console.log('Failed to save carpet item details', error);
        res.render('carpetItems_error');
    }
});

// Usercase 7 -> Create carpet kits.
app.get('/carpetKitItems', async (req, res) => {
    try {
        const carpetCategories = await CarpetCategory.find();
        res.render('carpetKitItems', {
            carpetCategories: carpetCategories
        });
    } catch (error) {
        console.log('Failed to retrieve carpet categories', error);
        res.render('carpetKitItems_error');
    }
});

const storage_kit = multer.diskStorage({
    destination: 'uploads/PNG_kit/',
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const fileName = file.originalname.replace(ext, '') + Date.now() + ext;
        cb(null, fileName);
    }
});

const uploadPNG_kit = multer({ storage: storage_kit, });

app.post('/carpet-kit-item', uploadPNG_kit.array('images'), async (req, res) => {
    const files = req.files;
    const filePaths = files.map(file => file.path);
    const carpetKitItems = new CarpetKitItem({
        category: req.body.category,
        length: req.body.length,
        breadth: req.body.breadth,
        weight: req.body.weight,
        dimensions: req.body.dimensions,
        images: req.filePaths,
        size: req.body.size,
        numericSize: req.body.numericSize,
        quantity: req.body.quantity,
        countryOfOrigin: req.body.countryOfOrigin
    });

    carpetKitItems.save()
        .then(() => {
            res.render('carpetKitItems_success');
        })
        .catch((error) => {
            console.log('Failed to save carpet kit details', error);
            res.render('carpetKitItems_error');
        });

});


// Run the server.
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('Server runs at port ' + port);
});