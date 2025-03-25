const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

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
    authStrategy: new LocalAuth({ dataPath: './session' })
});

console.log('✅ Puppeteer configurado correctamente.');

// Variables de estado
let configurado = false;

// QR Code
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('📲 Escanea este QR con tu WhatsApp para vincular el bot.');
});

// Conexión Exitosa
client.on('ready', async () => {
    console.log(`✅ 🦆 ¡Bot conectado en modo BASICO!`);
});

// Manejo de Mensajes
client.on('message', async (message) => {
    const texto = message.body.toUpperCase();

    // Activación del Bot
    if (texto.includes('ACTIVARBOT')) {
        configurado = true;
        await message.reply(`🎯 Hola, gracias por activar el bot. Ahora puedes configurar:\n\n💜 El equipo de Plenty`);
        return;
    }

    if (!configurado) return message.reply("🔒 El bot está bloqueado. Usa la palabra de seguridad 'ACTIVARBOT' para comenzar.");

    // 🎯 Saludo en Audio
    if (texto.includes('HOLA')) {
        const formatos = ['mp3', 'ogg', 'opus'];
        let audioEnviado = false;

        for (const formato of formatos) {
            const saludoPath = path.join(__dirname, 'audios', `saludo_hola.${formato}`);
            console.log(`🔎 Intentando enviar el audio: ${saludoPath}`);

            if (fs.existsSync(saludoPath)) {
                try {
                    const saludoAudio = MessageMedia.fromFilePath(saludoPath);
                    await client.sendMessage(message.from, saludoAudio, { sendAudioAsVoice: true });
                    audioEnviado = true;
                    break; // Detiene el ciclo si el audio fue enviado exitosamente
                } catch (error) {
                    console.error(`❌ Error al enviar el audio ${formato}:`, error);
                }
            }
        }

        if (!audioEnviado) {
            await message.reply("🎧 Lo siento, pero el audio de saludo no está disponible en este momento.");
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

