import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  // ForbiddenException, // Commented out as it's not used in the provided snippet
} from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import { Request } from 'express';
import { RequestWithUser } from '../../common/interfaces';
import { Reflector } from '@nestjs/core';
// import { ROLES_KEY } from '../../common/decorators/roles.decorator'; // Commented out
import { LoggerService } from '../../common/services/logger.service';
import { FlowTrackerService } from '../../common/services/flow-tracker.service';
import { LogMethod } from '../../common/decorators/log-method.decorator';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import * as jwt from 'jsonwebtoken'; // Added import
import { ConfigService } from '@nestjs/config'; // Added import

@Injectable()
export class FirebaseGuard implements CanActivate {
  private readonly logger: LoggerService;
  private readonly flowTracker: FlowTrackerService;

  constructor(
    private firebaseService: FirebaseService,
    private reflector: Reflector,
    private configService: ConfigService, // Injected ConfigService
  ) {
    this.logger = LoggerService.getInstance();
    this.flowTracker = FlowTrackerService.getInstance();
    this.logger.debug(
      'FirebaseGuard oluşturuldu',
      'FirebaseGuard.constructor',
      __filename,
      // 22, // Line number might change
    );
  }

  @LogMethod()
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const httpRequest = context.switchToHttp().getRequest<Request>();
    const authHeader = httpRequest.headers.authorization;
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const path = httpRequest.route?.path || 'bilinmeyen-yol';
    const method = httpRequest.method || 'UNKNOWN';

    this.flowTracker.trackStep(
      `Firebase Guard: ${method} ${path} kimlik doğrulama`,
      'FirebaseGuard',
    );

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    if (!authHeader) {
      this.logger.warn(
        'Authorization başlığı eksik',
        'FirebaseGuard.canActivate',
        __filename,
        // 38,
      );
      throw new UnauthorizedException('Missing authentication token');
    }

    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0].toLowerCase() !== 'bearer') {
      this.logger.warn(
        'Geçersiz Authorization başlık formatı',
        'FirebaseGuard.canActivate',
        __filename,
      );
      throw new UnauthorizedException('Invalid token format (must be Bearer token)');
    }
    const token = tokenParts[1];


    if (!token) { // Should be caught by the split check, but good to have
      this.logger.warn(
        'Token bulunamadı (Authorization başlığından sonra)',
        'FirebaseGuard.canActivate',
        __filename,
        // 48,
      );
      throw new UnauthorizedException('Invalid token format');
    }

    let decodedToken: any;
    let isFirebaseToken = false;
    let isCustomJwt = false;
    let userPrincipal: any = {};

    // Attempt to verify as Firebase ID Token
    try {
      this.logger.debug('Attempting to verify as Firebase ID Token', 'FirebaseGuard.canActivate', __filename);
      decodedToken = await this.firebaseService.auth.verifyIdToken(token, true); // true for checkRevoked
      isFirebaseToken = true;
      this.logger.debug('Successfully verified as Firebase ID Token', 'FirebaseGuard.canActivate', __filename, undefined, undefined, { uid: decodedToken.uid });
    } catch (firebaseError) {
      this.logger.warn(`Firebase ID Token verification failed: ${firebaseError.message}`, 'FirebaseGuard.canActivate', __filename);
      // If Firebase verification fails, try to verify as custom JWT
      try {
        this.logger.debug('Attempting to verify as Custom JWT', 'FirebaseGuard.canActivate', __filename);
        const jwtSecret = this.configService.get<string>('JWT_SECRET') || process.env.JWT_SECRET || 'bitirme_projesi_gizli_anahtar';
        if (!jwtSecret) {
            this.logger.error('JWT_SECRET is not defined. Cannot validate custom JWT.', 'FirebaseGuard.canActivate', __filename);
            throw new UnauthorizedException('Internal server configuration error for JWT validation.');
        }
        decodedToken = jwt.verify(token, jwtSecret) as any;
        isCustomJwt = true;
        // For custom JWT, 'uid' might be in 'sub' field or already as 'uid'
        if (decodedToken.sub && !decodedToken.uid) {
          decodedToken.uid = decodedToken.sub;
        }
        this.logger.debug('Successfully verified as Custom JWT', 'FirebaseGuard.canActivate', __filename, undefined, undefined, { uid: decodedToken.uid });
      } catch (jwtError) {
        this.logger.error(`Custom JWT verification failed: ${jwtError.message}`, 'FirebaseGuard.canActivate', __filename);
        throw new UnauthorizedException('Invalid token: Verification failed for both Firebase and Custom JWT');
      }
    }

    if (!decodedToken || !decodedToken.uid) {
      this.logger.error('Token decoded but UID is missing.', 'FirebaseGuard.canActivate', __filename, undefined, undefined, { decodedTokenString: JSON.stringify(decodedToken) });
      throw new UnauthorizedException('Invalid token: UID missing after decoding');
    }
    
    const uid = decodedToken.uid;

    const now = Math.floor(Date.now() / 1000);
    if (decodedToken.exp && decodedToken.exp < now) {
      this.logger.warn(`Token expired: User ${uid}, exp: ${decodedToken.exp}, now: ${now}`, 'FirebaseGuard.canActivate', __filename);
      throw new UnauthorizedException('Authentication token has expired');
    }

    if (isFirebaseToken) {
      try {
        const firebaseUser = await this.firebaseService.auth.getUser(uid);
        userPrincipal = {
          id: firebaseUser.uid, // Usually, id and uid are the same for Firebase
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          firstName: firebaseUser.displayName?.split(' ')[0] || '',
          lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
          profileImageUrl: firebaseUser.photoURL || null,
          role: decodedToken.role || 'USER', // Role from Firebase token claims
          createdAt: firebaseUser.metadata.creationTime,
          lastLogin: firebaseUser.metadata.lastSignInTime,
          isFirebaseToken: true,
          firebaseDecodedToken: decodedToken, // Keep original decoded Firebase token if needed
        };
      } catch (userError) {
        this.logger.error(`Firebase user info retrieval failed for UID ${uid}: ${userError.message}`, 'FirebaseGuard.canActivate', __filename);
        // Special handling for refresh-token path might still be needed if a Firebase user record is mandatory even for custom JWTs
        if (path.includes('refresh-token')) {
             this.logger.warn(`Refresh token isteği için eksik Firebase kullanıcı bilgisi: ${uid}`, 'FirebaseGuard.canActivate', __filename);
             // For refresh token, we might allow proceeding if the custom JWT is valid,
             // as the refresh logic itself will validate the refresh token from cookie.
             // However, if the access token (custom JWT) is invalid, it should fail earlier.
             // This part depends on whether refresh-token endpoint *also* requires a valid access token.
             // Assuming for now that if the access token (custom JWT) is valid, we can proceed for refresh.
        } else {
            throw new UnauthorizedException('Firebase user not found after token verification');
        }
        // If we reached here for refresh-token path with a valid custom JWT but no Firebase user,
        // we might need to populate userPrincipal from the custom JWT claims directly.
        if (isCustomJwt && !userPrincipal.uid) { // If firebaseUser fetch failed but custom JWT was fine
             userPrincipal = {
                id: decodedToken.sub || decodedToken.uid,
                uid: decodedToken.uid || decodedToken.sub,
                email: decodedToken.email || '',
                role: decodedToken.role || 'USER',
                isFirebaseToken: false,
                customJwtPayload: decodedToken,
            };
        } else if (!userPrincipal.uid) { // If still no user principal
             throw new UnauthorizedException('User context could not be established.');
        }

      }
    } else if (isCustomJwt) {
      // For custom JWT, claims are already in decodedToken
      userPrincipal = {
        id: decodedToken.sub || decodedToken.uid, // Use 'sub' as primary ID if that's your convention
        uid: decodedToken.uid || decodedToken.sub,
        email: decodedToken.email || '',
        displayName: decodedToken.name || '', // Assuming 'name' might be in custom JWT
        firstName: decodedToken.firstName || decodedToken.name?.split(' ')[0] || '',
        lastName: decodedToken.lastName || decodedToken.name?.split(' ').slice(1).join(' ') || '',
        profileImageUrl: decodedToken.picture || null, // Assuming 'picture' might be in custom JWT
        role: decodedToken.role || 'USER',
        isFirebaseToken: false,
        customJwtPayload: decodedToken,
      };
      // Optionally, fetch freshest user data from your DB if needed
      // const dbUser = await this.usersService.findByFirebaseUid(uid);
      // if (dbUser) { /* merge dbUser properties into userPrincipal */ }
    }

    if (!userPrincipal.uid) {
       this.logger.error('User principal could not be established from token after all checks.', 'FirebaseGuard.canActivate', __filename);
       throw new UnauthorizedException('User identification failed');
    }

    request.user = userPrincipal;
    this.logger.debug(
      `User authenticated: ${userPrincipal.uid}, role: ${userPrincipal.role}, type: ${isFirebaseToken ? 'Firebase' : 'CustomJWT'}`,
      'FirebaseGuard.canActivate',
      __filename,
    );
    
    // Role-based access control (if you use @Roles decorator)
    // const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
    //   context.getHandler(),
    //   context.getClass(),
    // ]);
    // if (requiredRoles) {
    //   const userRoles = Array.isArray(userPrincipal.role) ? userPrincipal.role : [userPrincipal.role];
    //   const hasRole = () => requiredRoles.some((role) => userRoles.includes(role));
    //   if (!hasRole()) {
    //     this.logger.warn(`User ${userPrincipal.uid} does not have required roles: ${requiredRoles}`, 'FirebaseGuard.canActivate');
    //     throw new ForbiddenException('Insufficient permissions');
    //   }
    // }

    return true;
  }
}
