const { Client, Buttons, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

// Modo de Mantenimiento
if (process.env.MAINTENANCE_MODE === 'ON') {
    console.log('🚧 El bot está en mantenimiento temporalmente. 🛠️');
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

// Variables de estado
let configurado = false;
let modo = "BASICO";
let tono = "FRIENDLY";

// QR Code
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('📲 Escanea este QR con tu WhatsApp para vincular el bot.');
});

// Conexión Exitosa
client.on('ready', async () => {
    console.log(`🟡 Variable de entorno 'MODE': ${modo}`);
    console.log(`✅ 🦆 ¡Bot conectado en modo ${modo}!`);
});

// Manejo de Mensajes
client.on('message', async (message) => {
    if (process.env.MAINTENANCE_MODE === 'ON') {
        return message.reply('⚠️ El bot está en mantenimiento temporalmente. Vuelve pronto. 🚧');
    }

    const texto = message.body.toUpperCase();

    // Activación del Bot
    if (texto.includes('ACTIVARBOT')) {
        configurado = true;
        await message.reply(`🎯 Hola, gracias por activar el bot. Ahora puedes configurar:

🟠 *Modo:*
 - BASICO: Respuestas generales.
 - PRO: Mensajes más amplios e informativos.
 - LEGENDARIO: Respuestas motivadoras y llenas de energía.

🟢 *Tono:*
 - FRIENDLY: Cercano y cálido.
 - PROFESSIONAL: Serio y directo.
 - EMOTIONAL: Con un toque sentimental.

💜 El equipo de Plenty`);
        return;
    }

    if (!configurado) return message.reply("🔒 El bot está bloqueado. Usa la palabra de seguridad 'ACTIVARBOT' para comenzar.");

    // 🎯 Saludo en Audio
if (texto.includes('HOLA')) {
    const path = require('path');

    // Intentar con múltiples formatos
    const formatos = ['saludo_hola_plenty.mp3', 'saludo_hola_plenty.ogg', 'saludo_hola_plenty.opus'];

    let audioEnviado = false;

    for (const formato of formatos) {
        const saludoPath = path.join(__dirname, 'audios', formato);
        console.log('🔎 Intentando enviar el audio:', saludoPath);

        if (fs.existsSync(saludoPath)) {
            const saludoAudio = MessageMedia.fromFilePath(saludoPath);
            await client.sendMessage(message.from, saludoAudio, { sendAudioAsVoice: true });
            audioEnviado = true;
            break; // Detiene el ciclo si se envía con éxito
        }
    }

    // Si no encontró el audio localmente, intenta enviar desde un enlace directo
    if (!audioEnviado) {
        const saludoAudioUrl = 'https://drive.google.com/uc?export=download&id=12YhRNY7bftezDVCin6ylXINTDe9D-OOi';
    
        try {
            const saludoAudio = await MessageMedia.fromUrl(saludoAudioUrl, { unsafeMime: true });
            await client.sendMessage(message.from, saludoAudio, { sendAudioAsVoice: true });
        } catch (error) {
            console.error('❌ Error al enviar el audio desde el enlace:', error);
            await message.reply("🔊 Lo siento, el audio no está disponible en este momento.");
        }
    }

    return;
}

    // Configuración de Modo
    if (texto.includes('CONFIGURAR MODO')) {
        const nuevoModo = texto.split('CONFIGURAR MODO ')[1];
        if (['BASICO', 'PRO', 'LEGENDARIO'].includes(nuevoModo)) {
            modo = nuevoModo;
            await message.reply(`✅ Modo configurado exitosamente a: *${modo}*`);
        } else {
            await message.reply('❌ Modo no reconocido. Usa BASICO, PRO o LEGENDARIO.');
        }
        return;
    }

    // Respuestas Generales
    if (texto.includes('PRECIO')) {
        message.reply('El precio de LA PLENTY KIT es $90.000 COP e incluye envío gratis. 🚀💜');
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
