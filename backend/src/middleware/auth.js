import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Ei kirjautunut – token puuttuu' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.username = decoded.username;
    req.role = decoded.role;
    next();
  } catch {
    return res.status(401).json({ message: 'Virheellinen tai vanhentunut token' });
  }
};

export default authMiddleware;
