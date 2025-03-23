const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});
console.log('✅ Puppeteer configurado correctamente.');

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('Escanea este QR con tu WhatsApp para vincular el bot.');
});

client.on('ready', () => {
    console.log('✅ ¡Bot conectado y listo para responder!');
});

client.on('message', message => {
    const texto = message.body.toLowerCase();

    if (texto.includes('precio')) {
        message.reply('El precio de LA PLENTY KIT es $90.000 COP e incluye envío gratis. 🚚💜');
    } else if (texto.includes('información')) {
        message.reply('LA PLENTY KIT es una caja educativa con actividades diseñadas para estimular la mente de los niños. 🧠💡');
    } else if (texto.includes('comprar') || texto.includes('adquirir')) {
        message.reply('Puedes adquirir tu PLENTY KIT visitando el sitio web: cursos.goplenty.net 🌐');
    } else {
        message.reply('¿En qué más puedo ayudarte? 😊');
    }
});

client.initialize().catch(err => {
    console.error('❌ Error al inicializar el cliente:', err);
});

