const { Client, Buttons, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

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

    // Mensaje de Bienvenida
    const welcomeMessage = `✅ ${emoji} ¡Hola! Gracias por adquirir este bot. Estoy aquí para ayudarte con mi configuración.\n\n` +
        `🔧 Para comenzar, por favor configura lo siguiente:\n` +
        `1️⃣ **Modo:** Escribe \`MODO BASICO\`, \`MODO PRO\` o \`MODO LEGENDARIO\` según tus preferencias.\n` +
        `2️⃣ **Tono:** Escribe \`TONO AMISTOSO\`, \`TONO GRACIOSO\` o \`TONO FORMAL\`.\n` +
        `3️⃣ **Palabra de seguridad:** Escribe \`PALABRA [TU_PALABRA]\` (Debe ser en MAYÚSCULAS y sin espacios).\n\n` +
        `✨ ¡Listo! Una vez completes estos pasos, el bot estará configurado.`;

    client.sendMessage(process.env.SUPPORT_CONTACT || '573193930821@c.us', welcomeMessage);
});

// Manejo de Mensajes
client.on('message', async (message) => {
    if (process.env.MAINTENANCE_MODE === 'ON') {
        return message.reply('⚠️ El bot está en mantenimiento temporalmente. Vuelve pronto. 🚧');
    }

    const texto = message.body.toLowerCase();

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
    } else if (texto.includes('modo')) {
        const modoSeleccionado = texto.split(' ')[1]?.toUpperCase();
        if (['BASICO', 'PRO', 'LEGENDARIO'].includes(modoSeleccionado)) {
            process.env.MODE = modoSeleccionado;
            message.reply(`✅ ¡Modo actualizado a **${modoSeleccionado}** correctamente!`);
        } else {
            message.reply('❌ Modo no reconocido. Prueba con: `MODO BASICO`, `MODO PRO` o `MODO LEGENDARIO`.');
        }
    } else if (texto.includes('tono')) {
        const tonoSeleccionado = texto.split(' ')[1]?.toUpperCase();
        if (['AMISTOSO', 'GRACIOSO', 'FORMAL'].includes(tonoSeleccionado)) {
            process.env.DEFAULT_TONE = tonoSeleccionado;
            message.reply(`✅ ¡Tono actualizado a **${tonoSeleccionado}** correctamente!`);
        } else {
            message.reply('❌ Tono no reconocido. Prueba con: `TONO AMISTOSO`, `TONO GRACIOSO` o `TONO FORMAL`.');
        }
    } else if (texto.includes('palabra')) {
        const palabraClave = texto.split(' ')[1]?.toUpperCase();
        if (palabraClave && /^[A-Z]+$/.test(palabraClave)) {
            process.env.SECURITY_WORD = palabraClave;
            message.reply(`✅ ¡Palabra de seguridad configurada como **${palabraClave}** correctamente!`);
        } else {
            message.reply('❌ Palabra no válida. La palabra debe estar en MAYÚSCULAS y sin espacios.');
        }
    } else {
        message.reply('¿En qué más puedo ayudarte? 😊');
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