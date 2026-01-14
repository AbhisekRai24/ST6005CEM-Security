require("dotenv").config()
const { server } = require("./index");

const PORT = process.env.PORT || 5050

// server.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});