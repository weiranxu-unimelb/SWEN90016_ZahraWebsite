// app.js
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken')

// Find your api_key here: https://plotly.com/settings/api
// var plotly = require('plotly')('zhihanzhang81', 'iw6gdoMZ6iJ7Ob1Vpkum'); //username, api_key 




// Initialize the app.
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'your-secret-key', // Change this to a secure secret key
    resave: false,
    saveUninitialized: true,
  }));

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
    solded : Number,
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
    solded : Number,
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
    itemList: [String],
    itemList_name: [String], 
    itemList_category: [String],
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
// Updated Checkout Page
app.get('/checkout', async (req, res) => {
    try {
      // Check if a user is logged in
      if (!req.session.user) {
        return res.status(401).render('login'); // Redirect to the login page if not logged in
      }
  
      // Access user information from the session
        const user = req.session.user;
        const currentDate = new Date().toLocaleDateString();
        const carpetItems = await CarpetItem.find();
        const carpetKitItems = await CarpetKitItem.find();
        const combinedItems = [...carpetKitItems, ...carpetItems]; // Merge into a single array
  
      // Continue with your existing code to fetch other data like carpet items, etc.
  
      // Render the 'checkout' page with the user's information
      res.render('checkout', {
        user: user,
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



app.post('/checkout', async (req, res) => {
    //const { quantity, totalCost, preferredPaymentMethod, deliveryInstructions, purchaseOrderDate, orderNumber, orderTotal, salesRepresentativeName, orderStatus, additionalNotes } = req.body;

    // Create a new checkout document
    try {
        const user = req.session.user;

        if (!user) {
            res.status(401).send('Please login to checkout');
            return;
        }

        const newCheckout = new Checkout({
            itemList: req.body.itemList,
            itemList_name: req.body.itemList_name,  // Current purchased Item's name
            itemList_category: req.body.itemList_category, // Current purchased Item's category
            totalCost: req.body.totalCost,
            preferredPaymentMethod: req.body.preferredPaymentMethod,
            deliveryInstructions: req.body.deliveryInstructions,
            purchaseOrderDate: req.body.purchaseOrderDate,
            orderNumber: req.body.orderNumber,
            discounts: req.body.discounts,
            salesRepresentativeName: req.body.salesRepresentative,
            orderStatus: req.body.orderStatus,
            additionalNotes: req.body.customerNotes
        });

        newCheckout.save()
            .then(() => {
                console.log('Successfully save carpet kit details');

                // 获取checkout数据
                const { customerId, description, amount } = req.body;

                // 创建新的订单记录
                const newOrder = new Order({
                    userId: user._id,   // 使用session中的user ID
                    customerId: customerId,
                    description: description,
                    amount: amount
                });

                // 保存订单到数据库
                return newOrder.save();
            })
            .then(() => {
                console.log('Order saved successfully');
                res.render('checkout_success');
            })
            .catch((error) => {
                console.log('Failed to save carpet kit details or order', error);
                res.render('checkout_error');
            });
    } catch (error) {
        console.error('Failed to record order during checkout', error);
        res.status(500).send('Internal Server Error');
    }
});



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
// let isAdminUser = false;
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
            return res.status(422).render('login_error')
        } else {
            // 用户验证成功，可以进行登录操作
            // 例如，设置用户的登录状态或创建会话等
            //req.session.user = user; // 存储用户信息到会话
            const token = jwt.sign({
                id: String(user._id),
            }, SECRET)

            // After successfully authenticating the user, store their information in the session
            req.session.user = {
                id: user._id,
                username: user.username,
                role: user.role,
              };
            //req.session.auth_username=user.username;
            //req.session.auth_password=user.password;
            //res.cookie('username',user.username, {maxAge:1000 * 60 * 60 * 24 * 7,signed:true});
            //res.cookie('password',user.password, {maxAge: 1000 * 60 * 60 * 24 * 7,signed:true})
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
        res.render('login');
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
        res.render('login');
    });
});

app.get('/login_error', (req, res) => {
    const message = 'Invalid username or password'; // Customize the error message
    res.render('login_error', { message });
});

// app.get('/salesDashboard', (req, res) => {
//     const user = req.session.user;
//     if (user.role == 'admin') {
//         res.render('salesDashboard');
//     } else {
//         res.render('salesDashboard_user');
//         console.log("Not an administrator");
//     }
    
// })



//Analytics Dashboard
app.get('/salesDashboard', async (req, res) => {
    try {
        const user = req.session.user;
        if (user.role == 'admin') {
            // Fetch Top 5 carpet items with low/high inventory
            const lowInventoryItems = await CarpetItem.find().sort({ quantity: 1 }).limit(5);
            const highInventoryItems = await CarpetItem.find().sort({ quantity: -1 }).limit(5);
            
            // await Checkout.deleteMany({}); // ! Delete all current Checkout records
            // const totalCosts = checkout_list.map((checkout) => checkout.totalCost);

            // Fetch Top 5 sold Name/Category
            const checkout_list = await Checkout.find();
            console.log(checkout_list);
            const combinedItemList = checkout_list
            .map(item => item.itemList_name[0]) // Extract the only element of each array
            .filter(item => item && item !== '[]') // Filter out empty and '[]' strings
            .flatMap(item => item.split(',')) 
                .map(item => item.trim());
            
            // Fetch Top 5 sold Name Dictionary ({"name": ; "count": })
            const top5KitNames = findTop5FrequentKitNames(combinedItemList);

            const combinedItemList_cate = checkout_list
            .map(item => item.itemList_category[0]) 
            .filter(item => item && item !== '[]')
            .flatMap(item => item.split(',')) 
                .map(item => item.trim()); 
            
            // Fetch Top 5 sold Category Dictionary [ { name: '65183', count: 2 }, { name: 'NaN', count: 2 } ]
            const top5KitCates = findTop5FrequentKitNames(combinedItemList_cate);
            console.log(top5KitCates); // Use for debugging

            

            res.render('salesDashboard', {
                lowInventoryItems: lowInventoryItems,
                highInventoryItems: highInventoryItems,
                checkout_list: checkout_list,
                sold_name_json: top5KitNames,
                sold_cate_json: top5KitCates, 
                //plot_1: plot_1_html
            });
        } else {
            res.render('salesDashboard_user');
            console.log("Not an administrator");
        }
        
       
    } catch (error) {
        console.error('Failed to fetch carpet items', error);
        res.render('dashboard_error');
    }
});

app.post('/salesDashboard', (req, res) => {
    const user = req.session.user;
    if (user.role == 'admin') {
        res.render('salesDashboard');
    } else {
        res.render('salesDashboard_user');
        console.log("Not an administrator");
    }
    // if(req.session.user.role == 'admin') res.render('salesDashboard', { message: 'Fail to register, Pls retry!' })
    // else console.log("Not an administrator");
})

app.post('/salesDashboard_pie', (req, res) => {
    const user = req.session.user;
    if (user.role == 'admin') {
        res.render('salesDashboard_pie');
    } else {
        res.render('salesDashboard_user');
        console.log("Not an administrator");
    }
})

app.get('/salesDashboard_pie', async (req, res) => {
    try {
        const user = req.session.user;
        if (user.role == 'admin') {
            const lowInventoryItems = await CarpetItem.find().sort({ quantity: 1 }).limit(5);
            const highInventoryItems = await CarpetItem.find().sort({ quantity: -1 }).limit(5);
            // Fetch Top 5 sold Name/Category
            const checkout_list = await Checkout.find();
            const combinedItemList = checkout_list
            .map(item => item.itemList_name[0]) 
            .filter(item => item && item !== '[]') 
            .flatMap(item => item.split(',')) 
            .map(item => item.trim());
            const top5KitNames = findTop5FrequentKitNames(combinedItemList);

            const combinedItemList_cate = checkout_list
            .map(item => item.itemList_category[0]) 
            .filter(item => item && item !== '[]')
            .flatMap(item => item.split(',')) 
            .map(item => item.trim()); 
            
            const top5KitCates = findTop5FrequentKitNames(combinedItemList_cate);
            console.log(top5KitCates);

            res.render('salesDashboard_pie', {
                lowInventoryItems: lowInventoryItems,
                highInventoryItems: highInventoryItems,
                checkout_list: checkout_list,
                sold_name_json: top5KitNames,
                sold_cate_json: top5KitCates, 
            });


        } else {
            res.render('salesDashboard_user');
            console.log("Not an administrator");
        }


    } catch (error) {
        console.error('Failed to fetch carpet items', error);
        res.render('salesDashboard_user');
    }
});


app.get('/index', (req, res) => {
    res.render('index'); 
});

// Run the server.
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('Server runs at port ' + port);
});


// Find top 5 counts of array
function findTop5FrequentKitNames(combinedItemList) {
    const kitNameCounts = {};
    combinedItemList.forEach(item => {
      if (item && item !== '') {
        kitNameCounts[item] = (kitNameCounts[item] || 0) + 1;
      }
    });
    const kitNameCountsArray = Object.entries(kitNameCounts).map(([name, count]) => ({
      name,
      count,
    }));
  
    // Sort the array by count in descending order
    kitNameCountsArray.sort((a, b) => b.count - a.count);
  
    // Get the top 5 frequently occurred kit names
    const top5KitNames = kitNameCountsArray.slice(0, 5);
    return top5KitNames;
  }

//MyOrder
const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    description: String,
    amount: Number
});

const Order = mongoose.model('Order', orderSchema);
app.get('/myOrders', async (req, res) => {
    try {
        const user = req.session.user;

        if (!user) {
            res.redirect('/login'); // 如果用户未登录，重定向到登录页面
            return;
        }

        // 获取与当前用户关联的订单，并与Customer模型一起填充
        const userOrders = await Order.find({ userId: user._id }).populate('customerId');

        if (userOrders.length === 0) {
            // 如果用户没有订单，可以渲染一个特定的页面，提示用户没有订单
            res.render('noOrders', { user: user });
        } else {
            // 渲染myOrders视图并传递用户订单数据
            res.render('myOrders', {
                user: user,
                orders: userOrders
            });
        }
    } catch (error) {
        console.error('Failed to fetch user orders', error);
        res.status(500).send('Internal Server Error');
    }
});

