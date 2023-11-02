exports.home = (req, res) => {
    res.status(200).send("This is homepage of shopping app");
}

exports.login = (req, res) => {
    res.status(200).send("Login to proceed...");
}