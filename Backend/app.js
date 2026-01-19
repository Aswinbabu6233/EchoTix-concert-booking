require("dotenv").config();

const createError = require("http-errors");
var express = require("express");
var cors = require("cors");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const db = require("./database/db");
var indexRouter = require("./routes/index");
var adminRouter = require("./routes/admin");
var userRouter = require("./routes/user");
var apiuserRouter = require("./routes/Api/user");
var apiadminRouter = require("./routes/Api/admin");
var apiindexRouter = require("./routes/Api/index");
var apiimagesRouter = require("./routes/Api/images");
const session = require("express-session");
const flash = require("connect-flash");

const User = require("./model/usermodel");

require("dotenv").config();

const expressLayouts = require("express-ejs-layouts");

var app = express();

// CORS setup - Enhanced configuration for production and development
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://echo-tix-concert-booking.vercel.app",
  process.env.CORS_ORIGIN,
].filter(Boolean);

// Manual CORS fallback for safety
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Handle preflight requests for all routes
app.options("*", cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  credentials: true,
  maxAge: 86400, // Cache preflight response for 24 hours
}));

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
    credentials: true,
    maxAge: 86400, // Cache preflight response for 24 hours
  })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//layout setup

// session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "BlueEyeTen",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

app.use((req, res, next) => {
  res.locals.hidenav = false;
  next();
});

app.use(async (req, res, next) => {
  if (req.session.user && req.session.user._id) {
    try {
      const user = await User.findById(req.session.user._id).lean();
      if (user) {
        res.locals.userdetails = user;
        res.locals.userpresent = user.role === "user";
        res.locals.adminpresent = user.role === "admin";
      } else {
        res.locals.userdetails = null;
        res.locals.userpresent = false;
        res.locals.adminpresent = false;
      }
    } catch (err) {
      console.error("Session fetch error:", err);
      res.locals.userdetails = null;
      res.locals.userpresent = false;
      res.locals.adminpresent = false;
    }
  } else {
    res.locals.userdetails = null;
    res.locals.userpresent = false;
    res.locals.adminpresent = false;
  }
  next();
});

app.use(expressLayouts);
app.set("layout", "layouts/main-layout");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/admin", adminRouter);
app.use("/user", userRouter);
app.use("/api/user", apiuserRouter);
app.use("/api/admin", apiadminRouter);
app.use("/api", apiindexRouter);
app.use("/api/images", apiimagesRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  const statusCode = err.status || 500;
  const isDev = req.app.get("env") === "development";

  // For API routes, return JSON instead of rendering HTML
  if (req.originalUrl.startsWith("/api")) {
    return res.status(statusCode).json({
      success: false,
      message: err.message || "Internal Server Error",
      ...(isDev && { stack: err.stack }),
    });
  }

  // For non-API routes, render the error page
  res.locals.message = err.message;
  res.locals.error = isDev ? err : {};
  res.status(statusCode);
  res.render("error");
});

module.exports = app;
