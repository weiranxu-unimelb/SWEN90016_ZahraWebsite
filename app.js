// app.js
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken')


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
    // Pass the message variable as null (or a default value) initially
    const message = '';
    res.render('login', { message });
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
    name: String,
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
    countryOfOrigin: String,
    price: {
        type: Number,
        default: 0
    }
});

// Create CarpetKitItem schema.
const carpetKitItemSchema = new mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CarpetCategory'
    },
    name: String,
    length: [Number],
    breadth: [Number],
    weight: [Number],
    dimensions: [String],
    images: [String],
    quantity: Number,
    countryOfPackaging: String,
    price: {
        type: Number,
        default: 0
    }
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

//At least three images.
const checkImagesCount = (req, res, next) => {
    if (req.files.length >= 3) {
        next();
    } else {
        res.status(400).send('At least three images are required');
    }
};

app.post('/carpet-item', uploadPNG_item.array('images'), checkImagesCount, async (req, res) => {
    try {
        const files = req.files;
        const filePaths = files.map(file => file.path + path.extname(file.originalname));
        const carpetItem = new CarpetItem({
            category: req.body.category,
            name: req.body.name,
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
            countryOfOrigin: req.body.countryOfOrigin,
            price: req.body.price
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

app.post('/carpet-kit-item', uploadPNG_kit.array('images'), checkImagesCount, async (req, res) => {
    const files = req.files;
    const filePaths = files.map(file => file.path);
    const carpetKitItems = new CarpetKitItem({
        category: req.body.category,
        name: req.body.name,
        length: req.body.length.split(','),
        breadth: req.body.breadth.split(','),
        weight: req.body.weight.split(','),
        dimensions: req.body.dimensions.split(','),
        images: req.filePaths,
        size: req.body.size,
        numericSize: req.body.numericSize,
        quantity: req.body.quantity,
        countryOfOrigin: req.body.countryOfOrigin,
        price: req.body.price
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

// Checkout Page
// app.get('/checkout', (req, res) => {
//     res.render('checkout');
// });

// Create an empty cart (array) to store selected items
const cart = [];


const checkoutSchema = new mongoose.Schema({
    // TODO: add the schema of selectedItems / selectedKits
    quantity: Number,
    totalCost: Number,
    preferredPaymentMethod: String,
    deliveryInstructions: String,
    purchaseOrderDate: Date,
    orderNumber: String,
    discounts: String,
    salesRepresentativeName: String,
    orderStatus: String,
    additionalNotes: String
});

const Checkout = mongoose.model('Checkout', checkoutSchema);

//module.exports = Checkout;

// Just assume the Logged in Customer to be the first in Customer list
app.get('/checkout', async (req, res) => {
    try {
        const customers = await Customer.find();
        const firstCustomer = customers.length > 0 ? customers[0] : null;
        const currentDate = new Date().toLocaleDateString();
        const carpetItems = await CarpetItem.find();
        const carpetKitItems = await CarpetKitItem.find();
        const combinedItems = [...carpetKitItems, ...carpetItems]; // Merge into a single array


        res.render('checkout', {
            // Parameter to be transmitted
            firstCustomer: firstCustomer,
            currentDate: currentDate,
            carpetItems: carpetItems,
            carpetKitItems: carpetKitItems,
            combinedItems: combinedItems
        });
    } catch (error) {
        console.log('Failed to show customer information', error);
        res.render('checkout_error');
    }
});


//const Checkout = require('./models/checkout'); // Replace with the actual path to your Checkout model

app.post('/checkout', async (req, res) => {
    //const { quantity, totalCost, preferredPaymentMethod, deliveryInstructions, purchaseOrderDate, orderNumber, orderTotal, salesRepresentativeName, orderStatus, additionalNotes } = req.body;

    // Create a new checkout document
    const newCheckout = new Checkout({

        quantity: req.body.quantity,
        totalCost: req.body.totalCost,
        preferredPaymentMethod: req.body.preferredPaymentMethod,
        deliveryInstructions: req.body.deliveryInstructions,
        purchaseOrderDate: req.body.purchaseOrderDate,
        orderNumber: req.body.orderNumber,
        discounts: req.body.discounts,
        salesRepresentativeName: req.body.salesRepresentative,
        orderStatus: req.body.orderStatus,
        additionalNotes: req.body.additionalNotes
    });

    newCheckout.save()
        .then(() => {
            console.log('Successfully save carpet kit details');
            res.render('checkout_success');
        })
        .catch((error) => {
            console.log('Failed to save carpet kit details', error);
            res.render('checkout_error');
        });

});





// document.addEventListener('DOMContentLoaded', () => {
//     // Simulate default customer data (replace with actual data)
//     const defaultCustomerData = {
//         customerName: 'John Doe',
//         email: 'johndoe@example.com',
//         phoneNumber: '123-456-7890',
//         shippingAddress: '123 Shipping St, City, Country',
//         billingAddress: '123 Billing St, City, Country',
//         purchaseOrderDate: new Date().toLocaleDateString(),
//         orderNumber: '12345',
//         orderTotal: '$100.00',
//         salesRepresentative: 'Jane Smith'
//     };

//     // Populate default customer data in the form
//     document.getElementById('customerName').value = defaultCustomerData.customerName;
//     document.getElementById('email').value = defaultCustomerData.email;
//     document.getElementById('phoneNumber').value = defaultCustomerData.phoneNumber;
//     document.getElementById('shippingAddress').value = defaultCustomerData.shippingAddress;
//     document.getElementById('billingAddress').value = defaultCustomerData.billingAddress;
//     document.getElementById('purchaseOrderDate').value = defaultCustomerData.purchaseOrderDate;
//     document.getElementById('orderNumber').value = defaultCustomerData.orderNumber;
//     document.getElementById('orderTotal').value = defaultCustomerData.orderTotal;
//     document.getElementById('salesRepresentative').value = defaultCustomerData.salesRepresentative;

//     // Handle form submission (you can send this data to your server)
//     document.getElementById('submitOrder').addEventListener('click', () => {
//         const formData = {
//             carpetItem: document.getElementById('carpetItem').value,
//             quantity: document.getElementById('quantity').value,
//             preferredPaymentMethod: document.getElementById('preferredPaymentMethod').value,
//             deliveryInstructions: document.getElementById('deliveryInstructions').value,
//             orderStatus: document.getElementById('orderStatus').value,
//             discounts: document.getElementById('discounts').value,
//             customerNotes: document.getElementById('customerNotes').value
//         };

//         // You can now send formData to your server for further processing
//         // using AJAX or fetch.
//     });
// });


const userSchema = mongoose.Schema({
    username: String,
    password: String,
    role: {
        type: String,
        enum: ['user', 'admin'], // 'user' 表示一般用户，'admin' 表示管理员
        default: 'user' // 默认为一般用户
    }
});
const User = mongoose.model('User', userSchema);


// 登录路由
// 处理登录表单提交
const SECRET = "fdfhfjdfdjfdjerwrereresaassa2dd@ddds"
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    let message = ''; // 初始化 message 变量为空

    try {
        const user = await User.findOne({ username: username });

        if (!user) {
            message = '用户不存在';
            //return res.status(422).send({
            //    message: 'Invalid User'
            //})
            return res.status(422).render('login_error')
        } else if (user.password !== password) {
            //return res.status(422).send({
            //    message: 'Incorrect Password'
            //})
            return res.status(422).render('login_error')
        } else {
            // 用户验证成功，可以进行登录操作
            // 例如，设置用户的登录状态或创建会话等
            //req.session.user = user; // 存储用户信息到会话
            const token = jwt.sign({
                id: String(user._id),
            }, SECRET)
            return res.status(200).render('index');

        }
    } catch (error) {
        console.error('Failed to log in', error);
        message = '登录失败';
    }

    // 无论成功还是失败，都传递 message 变量给模板
    res.render('login', { message });
});


// 注销路由
app.get('/logout', (req, res) => {
    // 清除用户的登录状态或会话信息
    req.session.destroy((err) => {
        if (err) {
            console.log('Failed to log out', err);
        }
        res.render('logout_success');
    });
});

// 注册页面
app.get('/register', (req, res) => {
    res.render('register');
});

// 处理注册表单提交
app.post('/register', async (req, res) => {
    const { username, password, adminKey } = req.body;
    let newUser; // 声明 newUser 变量在条件之外的作用域

    // 检查是否输入了管理员密钥
    if (adminKey === '12345678') {
        // 输入了正确的管理员密钥，将用户角色设置为管理员
        newUser = new User({
            username: username,
            password: password,
            role: 'admin' // 设置用户为管理员
        });
    } else {
        // 未输入管理员密钥或输入错误，将用户角色设置为一般用户
        newUser = new User({
            username: username,
            password: password,
            role: 'user' // 设置用户为一般用户
        });
    }

    try {
        await newUser.save();
        res.render('login');
    } catch (error) {
        console.error('Failed to register user', error);

        res.render('registration_error', { message: 'Fail to register, Pls retry!' });
    }
});

// 登录页面
app.get('/login', (req, res) => {
    const message = ''; // 初始化 message 变量为空
    res.send(req.params);
    res.render('login'); // 传递 message 变量给模板
});


// 注销
app.get('/logout', (req, res) => {
    // 清除用户的登录状态或会话信息
    req.session.destroy((err) => {
        if (err) {
            console.error('Failed to log out', err);
        }
        res.render('logout_success');
    });
});

app.get('/login_error', (req, res) => {
    const message = 'Invalid username or password'; // Customize the error message
    res.render('login_error', { message });
});



// Run the server.
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('Server runs at port ' + port);
});