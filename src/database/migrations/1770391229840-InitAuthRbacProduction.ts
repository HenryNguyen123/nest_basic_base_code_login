import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitAuthRbacProduction1770391229840 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // USERS
    await queryRunner.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,

        email VARCHAR(255) NOT NULL UNIQUE,
        user_name VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,

        is_active BOOLEAN DEFAULT TRUE,
        is_verified BOOLEAN DEFAULT FALSE,

        failed_login_attempts INT DEFAULT 0,
        locked_until TIMESTAMP NULL,
        last_login_at TIMESTAMP NULL,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ROLES
    await queryRunner.query(`
      CREATE TABLE roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(50) NOT NULL UNIQUE,
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // PERMISSIONS
    await queryRunner.query(`
      CREATE TABLE permissions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        code VARCHAR(100) NOT NULL UNIQUE,
        description VARCHAR(255),
        module VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // PROFILES
    await queryRunner.query(`
      CREATE TABLE profiles (
        id SERIAL PRIMARY KEY,
        user_id BIGINT UNIQUE NOT NULL,

        full_name VARCHAR(255),
        gender VARCHAR(50),
        dob DATE,
        phone VARCHAR(50),
        avatar VARCHAR(255),

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_profiles_user
          FOREIGN KEY (user_id) REFERENCES users(id)
          ON DELETE CASCADE
      )
    `);

    // USER_ROLES
    await queryRunner.query(`
      CREATE TABLE user_roles (
        user_id BIGINT NOT NULL,
        role_id BIGINT NOT NULL,

        PRIMARY KEY (user_id, role_id),

        CONSTRAINT fk_ur_user FOREIGN KEY (user_id)
          REFERENCES users(id) ON DELETE CASCADE,

        CONSTRAINT fk_ur_role FOREIGN KEY (role_id)
          REFERENCES roles(id) ON DELETE CASCADE
      )
    `);

    // ROLE_PERMISSIONS
    await queryRunner.query(`
      CREATE TABLE role_permissions (
        role_id BIGINT NOT NULL,
        permission_id BIGINT NOT NULL,

        PRIMARY KEY (role_id, permission_id),

        CONSTRAINT fk_rp_role FOREIGN KEY (role_id)
          REFERENCES roles(id) ON DELETE CASCADE,

        CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id)
          REFERENCES permissions(id) ON DELETE CASCADE
      )
    `);

    // REFRESH TOKENS
    await queryRunner.query(`
      CREATE TABLE refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL,
        token TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_rt_user FOREIGN KEY (user_id)
          REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // AUDIT LOGS
    await queryRunner.query(`
      CREATE TABLE audit_logs (
        id SERIAL PRIMARY KEY,
        user_id BIGINT,
        action VARCHAR(100),
        ip_address VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_audit_user FOREIGN KEY (user_id)
          REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // INDEXES
    await queryRunner.query(`CREATE INDEX idx_users_email ON users(email)`);
    await queryRunner.query(
      `CREATE INDEX idx_users_username ON users(user_name)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_user_roles_user ON user_roles(user_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_role_permissions_role ON role_permissions(role_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_refresh_user ON refresh_tokens(user_id)`,
    );

    // ===== SEED DATA =====

    await queryRunner.query(`
      INSERT INTO roles (name, code, description) VALUES
      ('Super Admin', 'SUPER_ADMIN', 'Full system access'),
      ('Administrator', 'ADMIN', 'System administrator'),
      ('User', 'USER', 'Normal user')
    `);

    await queryRunner.query(`
      INSERT INTO permissions (name, code, module) VALUES
      ('Create User', 'CREATE_USER', 'USER'),
      ('Update User', 'UPDATE_USER', 'USER'),
      ('Delete User', 'DELETE_USER', 'USER'),
      ('View Dashboard', 'VIEW_DASHBOARD', 'DASHBOARD')
    `);

    // SUPER_ADMIN full quyền
    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id
      FROM roles r, permissions p
      WHERE r.code = 'SUPER_ADMIN'
    `);

    // USER chỉ xem dashboard
    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id
      FROM roles r
      JOIN permissions p ON p.code = 'VIEW_DASHBOARD'
      WHERE r.code = 'USER'
    `);

    // seed fake user
    await queryRunner.query(`
      INSERT INTO users (email, user_name, password)
      VALUES
      (
        'admin@gmail.com',
        'admin',
        '$2b$10$rvYkmCsdWQpSVkW0BPp9RuHdHsnTpXuxOHjW5GGYyoy7aJ9.H/xsy'
      ),
      (
        'user@gmail.com',
        'user',
        '$2b$10$rvYkmCsdWQpSVkW0BPp9RuHdHsnTpXuxOHjW5GGYyoy7aJ9.H/xsy'
      )
    `);
    await queryRunner.query(`
      INSERT INTO profiles (user_id, full_name, gender, dob, phone)
      SELECT id, 'System Admin', 'Male', '1995-01-01', '0900000001'
      FROM users WHERE user_name = 'admin'
    `);

    await queryRunner.query(`
      INSERT INTO profiles (user_id, full_name, gender, dob, phone)
      SELECT id, 'Normal User', 'Male', '2000-01-01', '0900000002'
      FROM users WHERE user_name = 'user'
    `);
    // Admin → SUPER_ADMIN
    await queryRunner.query(`
      INSERT INTO user_roles (user_id, role_id)
      SELECT u.id, r.id
      FROM users u
      JOIN roles r ON r.code = 'SUPER_ADMIN'
      WHERE u.user_name = 'admin'
    `);
    // User → USER
    await queryRunner.query(`
      INSERT INTO user_roles (user_id, role_id)
      SELECT u.id, r.id
      FROM users u
      JOIN roles r ON r.code = 'USER'
      WHERE u.user_name = 'user'
    `);
    //fake permission
    await queryRunner.query(`
      INSERT INTO permissions (name, code, module)
      VALUES
      ('Create Category', 'CREATE_CATEGORY', 'CATEGORY'),
      ('Update Category', 'UPDATE_CATEGORY', 'CATEGORY'),
      ('Delete Category', 'DELETE_CATEGORY', 'CATEGORY'),
      ('View Category Detail', 'VIEW_CATEGORY', 'CATEGORY'),
      ('List Categories', 'LIST_CATEGORY', 'CATEGORY'),
      ('test Categories', 'TEST_CATEGORY', 'CATEGORY')
    `);
    //SUPER_ADMIN full quyền
    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id
      FROM roles r
      JOIN permissions p ON p.code = 'TEST_CATEGORY'
      WHERE r.code = 'SUPER_ADMIN'
    `);
    //USER chỉ có quyền test
    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id
      FROM roles r
      JOIN permissions p ON p.code = 'TEST_CATEGORY'
      WHERE r.code = 'USER'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE audit_logs`);
    await queryRunner.query(`DROP TABLE refresh_tokens`);
    await queryRunner.query(`DROP TABLE role_permissions`);
    await queryRunner.query(`DROP TABLE user_roles`);
    await queryRunner.query(`DROP TABLE profiles`);
    await queryRunner.query(`DROP TABLE IF EXISTS audit_logs`);
    await queryRunner.query(`DROP TABLE users`);
    await queryRunner.query(`DROP TABLE permissions`);
    await queryRunner.query(`DROP TABLE roles`);
  }
}
