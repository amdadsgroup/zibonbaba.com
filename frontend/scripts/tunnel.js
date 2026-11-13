const localtunnel = require('localtunnel');

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

async function startTunnel() {
  try {
    const tunnel = await localtunnel({ port: 3000 });
    console.log('PUBLIC_TUNNEL_URL:' + tunnel.url);

    tunnel.on('close', () => {
      console.log('Tunnel closed, restarting in 5s...');
      setTimeout(startTunnel, 5000);
    });

    tunnel.on('error', (err) => {
      console.error('Tunnel error:', err);
    });
  } catch (err) {
    console.error('Error starting tunnel, retrying in 5s:', err);
    setTimeout(startTunnel, 5000);
  }
}

startTunnel();
