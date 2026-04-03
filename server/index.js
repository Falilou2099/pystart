const app = require('./app');

const port = parseInt(process.env.PORT || '3000', 10);
const server = app.listen(port, () => {
  console.log(`PyStart → http://localhost:${port}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `\nLe port ${port} est déjà utilisé (souvent un ancien \`npm run dev\` encore actif).\n\n` +
        `  Arrêter ce qui écoute sur ${port} :  fuser -k ${port}/tcp\n` +
        `  Ou lancer sur un autre port :       PORT=3001 npm run dev\n`
    );
    process.exit(1);
  }
  throw err;
});
