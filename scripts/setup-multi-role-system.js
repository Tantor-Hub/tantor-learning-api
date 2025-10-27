/**
 * Setup script for multi-role system
 * This script helps migrate from single role to multi-role system
 */

const { Sequelize } = require('sequelize');

// Database configuration - adjust as needed
const sequelize = new Sequelize({
  dialect: 'postgres', // or 'mysql', 'sqlite', etc.
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'tantor_learning',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

async function setupMultiRoleSystem() {
  try {
    console.log('🚀 Setting up multi-role system...');

    // 1. Run the migration to create user_roles table
    console.log('📋 Running migration to create user_roles table...');
    // Note: In production, use: npx sequelize-cli db:migrate

    // 2. Migrate existing single roles to multi-role system
    console.log('🔄 Migrating existing single roles to multi-role system...');

    const [users] = await sequelize.query(`
      SELECT id, role 
      FROM ___tbl_tantor_users 
      WHERE role IS NOT NULL
    `);

    console.log(`Found ${users.length} users with single roles to migrate`);

    for (const user of users) {
      // Check if user already has roles in the new table
      const [existingRoles] = await sequelize.query(
        `
        SELECT id FROM ___tbl_tantor_user_roles 
        WHERE user_id = :userId AND role = :role
      `,
        {
          replacements: { userId: user.id, role: user.role },
        },
      );

      if (existingRoles.length === 0) {
        // Add the role to the new table
        await sequelize.query(
          `
          INSERT INTO ___tbl_tantor_user_roles (id, user_id, role, is_active, created_at, updated_at)
          VALUES (gen_random_uuid(), :userId, :role, true, NOW(), NOW())
        `,
          {
            replacements: { userId: user.id, role: user.role },
          },
        );

        console.log(`✅ Migrated role '${user.role}' for user ${user.id}`);
      } else {
        console.log(
          `⏭️  Role '${user.role}' already exists for user ${user.id}`,
        );
      }
    }

    // 3. Verify the migration
    console.log('🔍 Verifying migration...');
    const [roleCounts] = await sequelize.query(`
      SELECT role, COUNT(*) as count 
      FROM ___tbl_tantor_user_roles 
      WHERE is_active = true 
      GROUP BY role
    `);

    console.log('📊 Role distribution after migration:');
    roleCounts.forEach((row) => {
      console.log(`  - ${row.role}: ${row.count} users`);
    });

    console.log('✅ Multi-role system setup completed successfully!');
    console.log('');
    console.log('🎯 Next steps:');
    console.log('1. Update your application to use the new multi-role guards');
    console.log('2. Test the new endpoints with different role combinations');
    console.log('3. Update your frontend to handle multiple roles');
    console.log(
      '4. Consider keeping the legacy role field for backward compatibility',
    );
  } catch (error) {
    console.error('❌ Error setting up multi-role system:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Example function to assign multiple roles to a user
async function assignMultipleRolesToUser(userId, roles) {
  try {
    console.log(
      `🔧 Assigning roles [${roles.join(', ')}] to user ${userId}...`,
    );

    for (const role of roles) {
      // Check if role already exists
      const [existing] = await sequelize.query(
        `
        SELECT id FROM ___tbl_tantor_user_roles 
        WHERE user_id = :userId AND role = :role
      `,
        {
          replacements: { userId, role },
        },
      );

      if (existing.length === 0) {
        await sequelize.query(
          `
          INSERT INTO ___tbl_tantor_user_roles (id, user_id, role, is_active, created_at, updated_at)
          VALUES (gen_random_uuid(), :userId, :role, true, NOW(), NOW())
        `,
          {
            replacements: { userId, role },
          },
        );
        console.log(`✅ Added role '${role}' to user ${userId}`);
      } else {
        console.log(`⏭️  Role '${role}' already exists for user ${userId}`);
      }
    }
  } catch (error) {
    console.error('❌ Error assigning roles:', error);
    throw error;
  }
}

// Example function to remove a role from a user
async function removeRoleFromUser(userId, role) {
  try {
    console.log(`🗑️  Removing role '${role}' from user ${userId}...`);

    const [result] = await sequelize.query(
      `
      UPDATE ___tbl_tantor_user_roles 
      SET is_active = false, updated_at = NOW()
      WHERE user_id = :userId AND role = :role
    `,
      {
        replacements: { userId, role },
      },
    );

    if (result[1] > 0) {
      console.log(`✅ Removed role '${role}' from user ${userId}`);
    } else {
      console.log(`⚠️  Role '${role}' not found for user ${userId}`);
    }
  } catch (error) {
    console.error('❌ Error removing role:', error);
    throw error;
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupMultiRoleSystem();
}

module.exports = {
  setupMultiRoleSystem,
  assignMultipleRolesToUser,
  removeRoleFromUser,
};
