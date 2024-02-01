const { execSync } = require('child_process');
const exec = (commands) => {
  execSync(commands, { stdio: 'inherit', shell: true });
};

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Please enter file name: ', (fileName) => {
  exec(
    `npm run typeorm -- migration:generate ./src/database/migrations/${fileName}`,
  );
  rl.close();
});