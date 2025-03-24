const { Client, Buttons } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Lógica para el Modo de Mantenimiento
if (process.env.MAINTENANCE_MODE === 'ON') {
    console.log('🚧 El bot está en mantenimiento temporalmente. 🛠️');
    console.log('🔒 Finalizando el proceso para evitar que el bot se ejecute.');
    process.exit(0);
}

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
    const modo = (process.env.MODE || 'BASICO').toUpperCase();
    let emoji = '🦆';

    if (modo === 'PRO') {
        emoji = '❤️';
    } else if (modo === 'LEGENDARIO') {
        emoji = '💜';
    }

    console.log(`✅ ${emoji} ¡Bot conectado en modo ${modo}!`);
});

client.on('message', async (message) => {
    if (process.env.MAINTENANCE_MODE === 'ON') {
        return message.reply('⚠️ El bot está en mantenimiento temporalmente. Vuelve pronto. 🚧');
    }

    const texto = message.body.toLowerCase();
    const modo = (process.env.MODE || 'BASICO').toUpperCase();

    if (texto.includes('precio')) {
        message.reply('El precio de LA PLENTY KIT es $90.000 COP e incluye envío gratis. 🚀💜');
    } else if (texto.includes('información')) {
        const botones = new Buttons(
            '¿Quieres más información detallada o cómo adquirirlo?',
            [
                { body: '💡 Más Información' },
                { body: '🛒 Cómo Comprar' },
                { body: '📞 Hablar con un Humano' }
            ],
            '¿En qué te puedo ayudar?',
            'Elige una opción:'
        );
        await message.reply(botones);
    } else if (texto.includes('comprar') || texto.includes('adquirir')) {
        message.reply('Puedes adquirir tu PLENTY KIT visitando el sitio web: cursos.goplenty.net 🌐');
    } else if (texto.includes('humano')) {
        message.reply('Ahora te voy a transferir con un humano para que te ayude mejor. Tranquilo, esta persona sabe todo lo que necesitas saber. 😎');
    } else {
        if (modo === 'LEGENDARIO') {
            message.reply('🤩 Esa es una gran pregunta. ¿Qué tal si te explico más sobre cómo **LA PLENTY KIT** puede ayudar a tus hijos a desarrollar habilidades sorprendentes?');
        } else {
            message.reply('¿En qué más puedo ayudarte? 😊');
        }
    }
});

// Lógica de Reconexión Automática
client.on('disconnected', () => {
    console.log('❗ Bot desconectado. Intentando reconectar en 5 segundos...');
    setTimeout(() => {
        client.initialize();
    }, 5000); // 5 segundos
});

// Inicialización del Bot
client.initialize().catch(err => {
    console.error('❌ Error al inicializar el cliente:', err);
});
