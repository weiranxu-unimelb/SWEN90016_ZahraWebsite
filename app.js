// app.js
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');

// Initialize the app.
const app = express();
app.use(express.static('public'));

// DB connect code for 'mongoose' package
const uri = "mongodb+srv://weiranx1:weiranxu123@swen90016.kohjae3.mongodb.net/Zahra_Data?retryWrites=true&w=majority";
mongoose.connect(uri, {
    useNewUrlParser: true,
});

// Get the connection status.
var connection = mongoose.connection;
connection.on('connected', function(err){
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
const upload = multer({ dest: 'uploads/PDF/' });
// Set Ejs
app.set('view engine', 'ejs');
// Router
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/customer', (req, res) => {
    res.render('customer');
});

app.post('/submit', upload.single('identifyingDocument'), (req, res) => {
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


// Run the server.
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('Server runs at port ' + port);
});