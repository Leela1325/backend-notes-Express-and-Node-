function authorize(...allowedRoles) {
    return (req, res, next) => {
        if (allowedRoles.includes(req.user.role)) {
            next(); 
        } else {
            res.status(403).send({ msg: "Access denied" });
        }
    }
}

export default authorize;