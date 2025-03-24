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
    authStrategy: new LocalAuth({ dataPath: process.env.SESSION_PATH || './session' })
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

    const texto = message.body.toLowerCase().trim();

    // Mensaje de Bienvenida
    if (texto === 'activarbot') {
        return message.reply(`🎯 Hola, gracias por activar el bot. Ahora puedes configurar:

🟠 *Modo:*
 - BASICO: Respuestas generales.
 - PRO: Mensajes más amplios e informativos.
 - LEGENDARIO: Respuestas motivadoras y llenas de energía.

🟢 *Tono:*
 - FRIENDLY: Cercano y cálido.
 - PROFESSIONAL: Serio y directo.
 - EMOTIONAL: Con un toque sentimental.

✍️ Escribe: _CONFIGURAR MODO [BASICO/PRO/LEGENDARIO]_ y _CONFIGURAR TONO [FRIENDLY/PROFESSIONAL/EMOTIONAL]_

💜 El equipo de Plenty`);
    }

    // Detección directa de palabras clave
    if (['basico', 'pro', 'legendario'].includes(texto)) {
        return message.reply(`✅ ¡Modo *${texto.toUpperCase()}* activado correctamente!`);
    }

    // Triggers
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
    } else if (texto.includes('humano') || texto.includes('asesor')) {
        message.reply('Ahora te voy a transferir con un humano para que te ayude mejor. Tranquilo, esta persona sabe todo lo que necesitas saber. 😎');
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
