
module.exports = (req, res) => {
    if (req.user.is_admin === "f") {
        return res.status(401).send({ message: "UNAUTHORIZED" });
      }
}
