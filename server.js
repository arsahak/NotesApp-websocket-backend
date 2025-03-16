// const express = require("express");
// const morgan = require("morgan");
// const cors = require('cors')
// const bodyParser = require("body-parser");
// const createError = require("http-errors");
// const xssClean = require("xss-clean");
// const cookieParser = require("cookie-parser");
// const rateLimit = require("express-rate-limit");
// const { userRouter } = require("./routers/userRouter");
// const { seedRouter } = require("./routers/seedRouter");
// const { authRouter } = require("./routers/authRouter");
// const { categoryRouter } = require("./routers/categoryRouter");
// const { productRouter } = require("./routers/productRouter");
// const { orderRouter } = require("./routers/orderRouter");
// const { errorResponse } = require("./controllers/responseController");

// require("./config/db");


// // const limiter = rateLimit({
// //   windowMs: 15 * 60 * 1000,
// //   limit: 100,
// //   message: "Too many reqeust from this ip please try later",
// //   // standardHeaders: "draft-7",
// //   // legacyHeaders: false,
// // });

// const app = express();

// app.use(cookieParser());
// // app.use(limiter);
// app.use(cors())
// app.use(xssClean());
// app.use(morgan("dev"));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));


// app.use("/api/seed", seedRouter);

// app.use("/api", authRouter);
// app.use("/api", userRouter);



// app.get("/", (req, res) => {
//   return res.status(201).json({success: true, message:"welcome to the server"});
// });


// //client error handling

// app.use((req, res, next) => {
//   next(createError(404, "route not found"));
// });

// //server error handling

// app.use((err, req, res, next) => {
//   return errorResponse(res, { statusCode: err.status, message: err.message });
// });

// module.exports = app;

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const createError = require("http-errors");
const xssClean = require("xss-clean");
const cookieParser = require("cookie-parser");
const { userRouter } = require("./routers/userRouter");
const { errorResponse } = require("./controllers/responseController");
const noteRouter = require("./routers/noteRouter");

require("./config/db");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// ✅ Attach `io` to the request object so controllers can access it
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(cookieParser());
app.use(cors());
app.use(xssClean());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api", userRouter);
app.use("/api/notes", noteRouter);



// WebSocket connection
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("updateNote", (data) => {
    io.emit("noteUpdated", data);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Root Route
app.get("/", (req, res) => {
  return res.status(200).json({ success: true, message: "Welcome to the server" });
});

// Handle 404 errors
app.use((req, res, next) => {
  next(createError(404, "Route not found"));
});

// Server error handling
app.use((err, req, res, next) => {
  return errorResponse(res, { statusCode: err.status || 500, message: err.message || "Internal Server Error" });
});

// ✅ Export `server` for starting, and `io` for real-time updates
module.exports = { app, server };
