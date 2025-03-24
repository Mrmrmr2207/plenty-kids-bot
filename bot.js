const { Client, Buttons, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

// Modo de Mantenimiento
if (process.env.MAINTENANCE_MODE === 'ON') {
    console.log('🚧 El bot está en mantenimiento temporalmente. 🛠️');
    console.log('🔒 Finalizando el proceso para evitar que el bot se ejecute.');
    process.exit(0);
}

// Configuración del Cliente
const client = new Client({
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ],
        executablePath: require('puppeteer').executablePath()
    },
    authStrategy: new LocalAuth({ dataPath: process.env.SESSION_PATH || './session' }) // Sesión persistente
});

console.log('✅ Puppeteer configurado correctamente.');

// QR Code
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('📲 Escanea este QR con tu WhatsApp para vincular el bot.');
});

// Conexión Exitosa
client.on('ready', async () => {
    const modo = (process.env.MODE || 'BASICO').trim().toUpperCase();
    console.log(`🟡 Variable de entorno 'MODE': ${modo}`);

    let emoji = modo === 'PRO' ? '❤️' : modo === 'LEGENDARIO' ? '💜' : '🦆';
    console.log(`✅ ${emoji} ¡Bot conectado en modo ${modo}!`);
});

// Manejo de Mensajes
client.on('message', async (message) => {
    if (process.env.MAINTENANCE_MODE === 'ON') {
        return message.reply('⚠️ El bot está en mantenimiento temporalmente. Vuelve pronto. 🚧');
    }

    const texto = message.body.toLowerCase();
    const modo = (process.env.MODE || 'BASICO').trim().toUpperCase();

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
    } else {
        if (modo === 'LEGENDARIO') {
            message.reply('🤩 Esa es una gran pregunta. ¿Qué tal si te explico más sobre cómo **LA PLENTY KIT** puede ayudar a tus hijos a desarrollar habilidades sorprendentes?');
        } else {
            message.reply('¿En qué más puedo ayudarte? 😊');
        }
    }
});

// Reconexión Automática
client.on('disconnected', async (reason) => {
    console.log(`❗ Bot desconectado. Motivo: ${reason}. Intentando reconectar en 10 segundos...`);

    setTimeout(() => {
        client.initialize().catch(err => {
            console.error('❌ Error al reiniciar el bot:', err);
        });
    }, 10000);
});

// Inicialización del Bot
client.initialize().catch(err => {
    console.error('❌ Error al inicializar el cliente:', err);
});
