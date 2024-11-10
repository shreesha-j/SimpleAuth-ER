import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(403).send({ message: 'No token provided!' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded) {
            return res.status(401).send({ message: 'Unauthorized! token not valid' });
        }

        req.usedId = decoded.userId;
        next();
    }
    catch(error) {
        return res.status(401).json({
            success: false,
            message: 'Server error'
        })
    }
}