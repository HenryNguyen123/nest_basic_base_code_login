import { IsBoolean, IsDate, IsEmail, IsNotEmpty, IsNumber, IsString, MaxLength, MinLength } from 'class-validator';
import { AuditLog } from 'src/audits/entities/audit-log.entity';
import { RefreshToken } from 'src/auth/entities/refresh-token.entity';
import { Role } from 'src/roles/entities/role.entity';
import { UserRole } from 'src/roles/entities/user-role.entity';
import { Profile } from 'src/users/entities/profile.entity';
import { Transform } from 'stream';
import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_name', unique: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  userName: string;

  @Column({ unique: true })
  @IsEmail()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(150)
  email: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(50)
  password: string;

  @Column({ name: 'is_active' })
  @IsBoolean()
  isActive: boolean;

  @Column({ name: 'failed_login_attempts' })
  @IsNumber()
  failedLoginAttempts: number;

  @Column({ name: 'locked_until' })
  @IsDate()
  lockedUntil: Date;

  @Column({ name: 'last_login_at' })
  @IsDate()
  lastLoginAt?: Date;

  @Column()
  @IsDate()
  createdAt: Date;

  @Column()
  @IsDate()
  updatedAt: Date;

  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => AuditLog, (auditLog) => auditLog.user)
  auditLogs: AuditLog[];

  @ManyToOne(() => Role, (role) => role.users)
  role: Role;
}