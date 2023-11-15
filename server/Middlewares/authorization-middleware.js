exports.checkUserRole = (req, res, next) => {
    const userRole = req.get('X-USER-ROLE');
    if (!userRole) {
      return res.status(401).json({ error: 'X-USER-ROLE header is missing' });
    }  
    req.role = userRole;
    next();
};