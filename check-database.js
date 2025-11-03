// Check Database Tables
// Run this with: node check-database.js

const { Sequelize } = require('sequelize');

async function checkDatabase() {
  console.log('🔍 Checking Database Tables...\n');

  // Initialize Sequelize connection (adjust these values to match your database)
  const sequelize = new Sequelize({
    dialect: process.env.APP_BD_DIALECT || 'postgres',
    host: process.env.APP_BD_HOST || 'localhost',
    port: Number(process.env.APP_BD_PORT) || 5432,
    database: process.env.APP_BD_NAME || 'default_database',
    username: process.env.APP_BD_USERNAME || 'postgres',
    password: process.env.APP_BD_PASSWORD || 'admin',
    logging: false, // Set to console.log to see SQL queries
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.\n');

    // Check paymentmethodcard table
    console.log('💳 Checking paymentmethodcard table...');
    const [paymentMethodCards] = await sequelize.query(`
      SELECT 
        id,
        id_session,
        id_user,
        id_stripe_payment,
        status,
        created_at,
        updated_at
      FROM ___tbl_tantor_paymentmethodcard 
      ORDER BY created_at DESC 
      LIMIT 10
    `);

    console.log(`Found ${paymentMethodCards.length} payment method cards:`);
    paymentMethodCards.forEach((card, index) => {
      console.log(
        `  ${index + 1}. ID: ${card.id}, Session: ${card.id_session}, User: ${card.id_user}, Status: ${card.status}, Stripe: ${card.id_stripe_payment}`,
      );
    });

    // Check userinsession table
    console.log('\n👤 Checking userinsession table...');
    const [userInSessions] = await sequelize.query(`
      SELECT 
        id,
        id_user,
        id_session,
        status,
        created_at,
        updated_at
      FROM ___tbl_tantor_userinsession 
      ORDER BY created_at DESC 
      LIMIT 10
    `);

    console.log(`Found ${userInSessions.length} user in sessions:`);
    userInSessions.forEach((session, index) => {
      console.log(
        `  ${index + 1}. ID: ${session.id}, User: ${session.id_user}, Session: ${session.id_session}, Status: ${session.status}`,
      );
    });

    // Check document_templates table
    console.log('\n📄 Checking ___tbl_tantor_documenttemplate table...');
    try {
      const [documentTemplates] = await sequelize.query(`
        SELECT
          id,
          title,
          "createdById",
          "sessionId",
          type,
          variables,
          "createdAt",
          "updatedAt"
        FROM ___tbl_tantor_documenttemplate
        ORDER BY "createdAt" DESC
        LIMIT 10
      `);

      console.log(`Found ${documentTemplates.length} document templates:`);
      documentTemplates.forEach((template, index) => {
        console.log(
          `  ${index + 1}. ID: ${template.id}, Title: ${template.title}, Type: ${template.type}, Session: ${template.sessionId}`,
        );
      });
    } catch (error) {
      console.log(
        '❌ ___tbl_tantor_documenttemplate table does not exist or error:',
        error.message,
      );
    }

    // Check document_instances table
    console.log('\n📋 Checking ___tbl_tantor_documentinstance table...');
    try {
      const [documentInstances] = await sequelize.query(`
        SELECT
          id,
          "templateId",
          "userId",
          "filledContent",
          "variableValues",
          "createdAt",
          "updatedAt"
        FROM ___tbl_tantor_documentinstance
        ORDER BY "createdAt" DESC
        LIMIT 10
      `);

      console.log(`Found ${documentInstances.length} document instances:`);
      documentInstances.forEach((instance, index) => {
        console.log(
          `  ${index + 1}. ID: ${instance.id}, Template: ${instance.templateId}, User: ${instance.userId}`,
        );
      });
    } catch (error) {
      console.log(
        '❌ ___tbl_tantor_documentinstance table does not exist or error:',
        error.message,
      );
    }

    // Check for recent entries (last 24 hours)
    console.log('\n⏰ Checking recent entries (last 24 hours)...');
    const [recentPayments] = await sequelize.query(`
      SELECT
        'paymentmethodcard' as table_name,
        id,
        id_session,
        id_user,
        status,
        created_at
      FROM ___tbl_tantor_paymentmethodcard
      WHERE created_at >= NOW() - INTERVAL '24 hours'

      UNION ALL

      SELECT
        'userinsession' as table_name,
        id,
        id_session,
        id_user,
        status,
        created_at
      FROM ___tbl_tantor_userinsession
      WHERE created_at >= NOW() - INTERVAL '24 hours'

      ORDER BY created_at DESC
    `);

    console.log(`Found ${recentPayments.length} recent entries:`);
    recentPayments.forEach((entry, index) => {
      console.log(
        `  ${index + 1}. Table: ${entry.table_name}, ID: ${entry.id}, User: ${entry.id_user}, Session: ${entry.id_session}, Status: ${entry.status}, Created: ${entry.created_at}`,
      );
    });
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await sequelize.close();
  }
}

// Run the check
checkDatabase();
