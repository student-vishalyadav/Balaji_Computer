require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./config/db");

const PORT = process.env.PORT || 8080;

// Connect to Database and start server
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`===============================================`);
            console.log(` Balaji Computer Server is running on port: ${PORT}`);
            console.log(` Institute: Balaji Computer`);
            console.log(` Tagline: Learn Today, Lead Tomorrow`);
            console.log(` API Endpoint: http://localhost:${PORT}/api`);
            console.log(`===============================================`);
        });
    })
    .catch((err) => {
        console.error("Failed to connect to DB, starting server anyway...", err.message);
        app.listen(PORT, () => {
            console.log(`Balaji Computer Server started in fallback mode on port: ${PORT}`);
        });
    });
