/**
 * Quick script to verify Telegram bot token
 * Run: node verify-token.js
 */

require('dotenv').config();
const axios = require('axios');

const token = process.env.TELEGRAM_BOT_TOKEN;

console.log('\n=== Telegram Bot Token Verification ===\n');

if (!token) {
  console.log('❌ TELEGRAM_BOT_TOKEN not found in .env file');
  console.log('\nPlease add your token to .env file:');
  console.log('TELEGRAM_BOT_TOKEN=your_token_here\n');
  process.exit(1);
}

// Check format
if (!/^\d+:[A-Za-z0-9_-]+$/.test(token.trim())) {
  console.log('❌ Invalid token format!');
  console.log('Expected format: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz');
  console.log(`Your token: ${token.substring(0, 20)}...`);
  console.log('\nPlease check your .env file and get a valid token from @BotFather\n');
  process.exit(1);
}

console.log('✅ Token format looks correct');
console.log(`Token preview: ${token.substring(0, 10)}...${token.substring(token.length - 10)}\n`);

// Test token with Telegram API
console.log('Testing token with Telegram API...\n');

axios.get(`https://api.telegram.org/bot${token}/getMe`)
  .then(response => {
    if (response.data.ok) {
      const bot = response.data.result;
      console.log('✅ Token is VALID!\n');
      console.log('Bot Information:');
      console.log(`  Name: ${bot.first_name}`);
      console.log(`  Username: @${bot.username}`);
      console.log(`  ID: ${bot.id}`);
      console.log(`  Can Join Groups: ${bot.can_join_groups}`);
      console.log(`  Can Read All Group Messages: ${bot.can_read_all_group_messages}`);
      console.log(`  Supports Inline Queries: ${bot.supports_inline_queries}\n`);
      console.log('🎉 Your bot is ready to use!\n');
    } else {
      console.log('❌ Token test failed:', response.data);
      process.exit(1);
    }
  })
  .catch(error => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      console.log(`❌ Token verification FAILED (HTTP ${status})`);
      console.log(`Error: ${data.description || data.error_code}\n`);
      
      if (status === 401 || data.error_code === 401) {
        console.log('This means your token is INVALID or REVOKED.');
        console.log('Please get a new token from @BotFather on Telegram.\n');
      } else if (status === 404 || data.error_code === 404) {
        console.log('This means your token is INVALID or NOT FOUND.');
        console.log('Please check your .env file and get a valid token from @BotFather.\n');
      }
    } else {
      console.log('❌ Network error:', error.message);
      console.log('Please check your internet connection.\n');
    }
    process.exit(1);
  });

