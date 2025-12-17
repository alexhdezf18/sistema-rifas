import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // 1. Le decimos que busque el token en el Header "Authorization: Bearer <token>"
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // 2. ¡IMPORTANTE! Debe ser la misma clave secreta que pusiste en auth.module.ts
      secretOrKey: 'MI_PALABRA_SECRETA_SUPER_SEGURA',
    });
  }

  // 3. Si el token es válido, esto nos devuelve los datos del usuario
  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}
