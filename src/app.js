require("dotenv").config();
require("express-async-errors");
const morgan = require('morgan')
const express = require("express");
const app = express();
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");
const swaggerUI = require('swagger-ui-express');
const docs = require('./docs');
const ejs = require('ejs')
app.set('view engine', 'ejs')
app.use(express.static('./public'))
const mongoose = require('mongoose')
//ADMIN
const AdminJS = require('adminjs')
const AdminJSExpress = require('@adminjs/express')
const connect = require('connect-pg-simple')
const session = require('express-session')
const AdminJSmongoose = require('@adminjs/mongoose')
const UserSchema = require('./models/UserModel')
AdminJS.registerAdapter({
  Resource: AdminJSmongoose.Resource,
  Database: AdminJSmongoose.Database,
})


app.use(morgan('dev'))
//auth middlewares
const auth = require("./middleware/authentication");
const adminAuthMiddleware = require("./middleware/admin-auth");

//routes
const transactionRoutes = require('./routes/transactionR')
const withdrawalRoutes = require('./routes/withdrawalR')
const authRoutes = require("./routes/authRoute");
const adminAuth = require("./routes/adminAuth");
const uploadRoutes = require("./routes/uploadIdR")
const modifyUserRoutes = require('./routes/modifyUserR')
const adminRoutes = require('./routes/adminRoute')
// error handler
const notFoundMiddleware = require("./middleware/not-found");
const connectDB = require("./db/connect");

app.use(express.json());
// extra security packages
app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 150, // limit each IP to 100 requests per windowMs
  })
);
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());

app.get("/test-upload-ruby", (req, res) => {
  res.render('index');
});

// routes
app.use("/auth", authRoutes);
app.use("/transaction", auth, transactionRoutes);
app.use("/withdrawal", auth, withdrawalRoutes);
app.use("/upload", uploadRoutes);
app.use("/auth", auth, modifyUserRoutes);
app.use('/docs', swaggerUI.serve, swaggerUI.setup(docs));
app.use("/admin/auth", adminAuth);
app.get('/', (req, res) => {
  res.json({ welcome: 'action live trading' })
})
app.use("/", adminAuthMiddleware, adminRoutes);


const port = process.env.PORT || 3000;
//switch between local and cloud db

const local = process.env.LOCAL_URI;
const cloud = process.env.CLOUD_URI;
const adminOptions = {
  resources: [UserSchema]
}
// const admin = new AdminJS({

// })
const admin = new AdminJS({
  databases: [mongoose],
  rootPath: '/admin',
  resources: [{
    resource: UserSchema,
    options: {
      //     listProperties: ['', 'name', 'createdAt'],
      //     filterProperties: ['id', 'name', 'createdAt'],
      //     editProperties: ['id', 'name', 'bio', 'createdAt'],
      listProperties: ['name', 'address', 'zipCode', 'countryOfResidence', 'seedPhrase'],
    },
  }],
})
const start = async () => {
  try {
    await connectDB(cloud);
    admin.watch()
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
const DEFAULT_ADMIN = {
  email: 'lorraine@gmail.com',
  password: 'lorraine'
}
const adminRouter = AdminJSExpress.buildRouter(admin
)

app.use(admin.options.rootPath, adminRouter)
console.log(admin.options.rootPath)
app.use(notFoundMiddleware);