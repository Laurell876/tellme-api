const jwt = require("jsonwebtoken");

module.exports = (req,res,next) => {
    //const token = req.header("auth-token");
    //if (!token) return res.status(401).send({message: "Unauthorized"});
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).send({message: "Unauthorized"});

    const accessToken = authHeader.split(" ")[1];
    if (!accessToken || accessToken === "") return res.status(401).send({message: "Unauthorized"});

    try{
        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        req.user = decodedToken.user;
        next();
    } catch(err) {
        res.status(400).send({message: err.message});
    }
} 