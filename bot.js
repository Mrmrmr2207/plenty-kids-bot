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
        const { MessageMedia } = require('whatsapp-web.js'); // Importar para manejar audios

        // Dentro del evento de mensaje:
        if (texto.includes('hola')) {
            const saludoAudio = MessageMedia.fromFilePath('./audios/saludo_hola.mp3');
            await client.sendMessage(message.from, saludoAudio, { sendAudioAsVoice: true });
        }        
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

Escribe: *CONFIGURAR MODO [BASICO/PRO/LEGENDARIO]* y *CONFIGURAR TONO [FRIENDLY/PROFESSIONAL/EMOTIONAL]*`);
        return;
    }

    if (!configurado) return message.reply("🔒 El bot está bloqueado. Usa la palabra de seguridad 'ACTIVARBOT' para comenzar.");

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

    // Configuración de Tono
    if (texto.includes('CONFIGURAR TONO')) {
        const nuevoTono = texto.split('CONFIGURAR TONO ')[1];
        if (['FRIENDLY', 'PROFESSIONAL', 'EMOTIONAL'].includes(nuevoTono)) {
            tono = nuevoTono;
            await message.reply(`✅ Tono configurado exitosamente a: *${tono}*`);
        } else {
            await message.reply('❌ Tono no reconocido. Usa FRIENDLY, PROFESSIONAL o EMOTIONAL.');
        }
        return;
    }

    // Respuestas Generales
    if (texto.includes('PRECIO')) {
        message.reply('El precio de LA PLENTY KIT es $90.000 COP e incluye envío gratis. 🚀💜');
    } else if (texto.includes('INFORMACIÓN')) {
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
    } else if (texto.includes('COMPRAR') || texto.includes('ADQUIRIR')) {
        message.reply('Puedes adquirir tu PLENTY KIT visitando el sitio web: cursos.goplenty.net 🌐');
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