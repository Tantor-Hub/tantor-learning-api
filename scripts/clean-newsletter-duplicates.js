const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.APP_BD_HOST,
  port: process.env.APP_BD_PORT,
  username: process.env.APP_BD_USERNAME,
  password: process.env.APP_BD_PASSWORD,
  database: process.env.APP_BD_NAME,
  logging: false,
});

async function cleanDuplicates() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    const tableName = '___tbl_tantor_newsletter';

    // Find duplicates
    const duplicates = await sequelize.query(
      `
      SELECT user_email, COUNT(*) as count
      FROM ${tableName}
      GROUP BY user_email
      HAVING COUNT(*) > 1
    `,
      { type: Sequelize.QueryTypes.SELECT },
    );

    console.log(`Found ${duplicates.length} duplicate email(s).`);

    for (const dup of duplicates) {
      const { user_email } = dup;

      // Keep the first occurrence (assuming by id or createdAt)
      const keepId = await sequelize.query(
        `
        SELECT id FROM ${tableName}
        WHERE user_email = ?
        ORDER BY id ASC
        LIMIT 1
      `,
        {
          replacements: [user_email],
          type: Sequelize.QueryTypes.SELECT,
        },
      );

      if (keepId.length > 0) {
        // Delete others
        await sequelize.query(
          `
          DELETE FROM ${tableName}
          WHERE user_email = ? AND id != ?
        `,
          {
            replacements: [user_email, keepId[0].id],
            type: Sequelize.QueryTypes.DELETE,
          },
        );

        console.log(
          `Cleaned duplicates for ${user_email}, kept ID: ${keepId[0].id}`,
        );
      }
    }

    console.log('Duplicate cleanup completed.');
  } catch (error) {
    console.error('Error cleaning duplicates:', error);
  } finally {
    await sequelize.close();
  }
}

cleanDuplicates();
