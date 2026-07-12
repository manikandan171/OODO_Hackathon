import { Request, Response, NextFunction } from "express";
import { Role } from "../db.js";

/**
 * RBAC Helper that checks if the authenticated user has the required role.
 * Matches the matrix in Blueprint §4.
 */
export const requireRole = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      res.status(403).json({
        error: `Access Denied: Your current role is '${user?.role}'. This action requires one of: ${roles.join(", ")}.`
      });
      return;
    }
    next();
  };
};
