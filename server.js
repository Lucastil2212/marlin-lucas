require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || '');
const fs = require('fs-extra');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Serve music files with proper MIME type
app.use('/chingon-full-album', express.static(path.join(__dirname, 'chingon-full-album'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.wav')) {
            res.setHeader('Content-Type', 'audio/wav');
        }
    }
}));

// Serve favicon
app.get('/favicon.ico', (req, res) => {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.sendFile(path.join(__dirname, 'favicon.svg'));
});

app.get('/favicon.svg', (req, res) => {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.sendFile(path.join(__dirname, 'favicon.svg'));
});

// Route for the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Get Stripe publishable key
app.get('/api/stripe-config', (req, res) => {
    res.json({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || ''
    });
});

// Create payment intent for single song download
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { songIndex, songName, packageType } = req.body;
        const amount = packageType === 'full' 
            ? parseInt(process.env.FULL_PACKAGE_PRICE || 1000)
            : parseInt(process.env.SINGLE_SONG_PRICE || 500);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            metadata: {
                songIndex: songIndex.toString(),
                songName: songName,
                packageType: packageType
            },
            description: `${songName} - ${packageType === 'full' ? 'Full Package' : 'Single Song'}`,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create payment intent for donation
app.post('/api/create-donation-intent', async (req, res) => {
    try {
        const { amount } = req.body;
        const minAmount = parseInt(process.env.MIN_DONATION_AMOUNT || 100);
        const donationAmount = parseInt(amount);

        if (donationAmount < minAmount) {
            return res.status(400).json({ error: `Minimum donation is $${minAmount / 100}` });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: donationAmount,
            currency: 'usd',
            metadata: {
                type: 'donation'
            },
            description: 'Donation to Marlín Lucas',
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error creating donation intent:', error);
        res.status(500).json({ error: error.message });
    }
});

// Webhook endpoint for Stripe events
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET || ''
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const { songIndex, songName, packageType, type } = paymentIntent.metadata;
        const customerEmail = paymentIntent.receipt_email || paymentIntent.metadata.email;

        if (type === 'donation') {
            console.log(`Donation received: $${paymentIntent.amount / 100} from ${customerEmail || 'anonymous'}`);
            // Store donation record
            await storeDonationRecord(paymentIntent);
        } else {
            console.log(`Payment successful for: ${songName} (${packageType}) - $${paymentIntent.amount / 100}`);
            // Store payment record with email for file delivery
            await storePaymentRecord(paymentIntent, songIndex, songName, packageType);
        }
    }

    res.json({ received: true });
});

// Store payment records
async function storePaymentRecord(paymentIntent, songIndex, songName, packageType) {
    const record = {
        paymentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        songIndex: songIndex,
        songName: songName,
        packageType: packageType,
        email: paymentIntent.receipt_email || paymentIntent.metadata.email || null,
        timestamp: new Date().toISOString(),
        status: 'paid'
    };

    const recordsPath = path.join(__dirname, 'data', 'payments.json');
    await fs.ensureDir(path.dirname(recordsPath));
    
    let records = [];
    if (await fs.pathExists(recordsPath)) {
        records = await fs.readJson(recordsPath);
    }
    
    records.push(record);
    await fs.writeJson(recordsPath, records, { spaces: 2 });
}

// Store donation records
async function storeDonationRecord(paymentIntent) {
    const record = {
        paymentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        email: paymentIntent.receipt_email || paymentIntent.metadata.email || null,
        timestamp: new Date().toISOString(),
        status: 'paid'
    };

    const recordsPath = path.join(__dirname, 'data', 'donations.json');
    await fs.ensureDir(path.dirname(recordsPath));
    
    let records = [];
    if (await fs.pathExists(recordsPath)) {
        records = await fs.readJson(recordsPath);
    }
    
    records.push(record);
    await fs.writeJson(recordsPath, records, { spaces: 2 });
}

// Handle email subscription
app.post('/api/subscribe', async (req, res) => {
    try {
        const { email, type } = req.body;
        
        // Store subscription
        const subscriptionsPath = path.join(__dirname, 'data', 'subscriptions.json');
        await fs.ensureDir(path.dirname(subscriptionsPath));
        
        let subscriptions = [];
        if (await fs.pathExists(subscriptionsPath)) {
            subscriptions = await fs.readJson(subscriptionsPath);
        }
        
        subscriptions.push({
            email: email,
            type: type || 'lyrics_stems',
            timestamp: new Date().toISOString()
        });
        
        await fs.writeJson(subscriptionsPath, subscriptions, { spaces: 2 });
        
        // Log to console (you can set up email service later)
        const toEmail = process.env.TO_EMAIL || 'your_email@example.com';
        console.log(`\n📧 New subscription from ${email} (${type || 'lyrics_stems'})`);
        console.log(`   Send to: ${toEmail}\n`);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error storing subscription:', error);
        res.status(500).json({ error: error.message });
    }
});

// Handle contact form
app.post('/api/contact', async (req, res) => {
    try {
        const { email, type } = req.body;
        
        // Store contact request
        const contactsPath = path.join(__dirname, 'data', 'contacts.json');
        await fs.ensureDir(path.dirname(contactsPath));
        
        let contacts = [];
        if (await fs.pathExists(contactsPath)) {
            contacts = await fs.readJson(contactsPath);
        }
        
        contacts.push({
            email: email,
            type: type || 'contact',
            timestamp: new Date().toISOString()
        });
        
        await fs.writeJson(contactsPath, contacts, { spaces: 2 });
        
        // Log to console (you can set up email service later)
        const toEmail = process.env.TO_EMAIL || 'your_email@example.com';
        console.log(`\n📧 New contact from ${email}`);
        console.log(`   Send to: ${toEmail}\n`);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error storing contact:', error);
        res.status(500).json({ error: error.message });
    }
});

// Download file after payment (protected endpoint)
app.get('/api/download/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;
        const recordsPath = path.join(__dirname, 'data', 'payments.json');
        
        if (!(await fs.pathExists(recordsPath))) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        
        const records = await fs.readJson(recordsPath);
        const payment = records.find(r => r.paymentId === paymentId && r.status === 'paid');
        
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found or not completed' });
        }
        
        // Verify payment with Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ error: 'Payment not completed' });
        }
        
        const songIndex = parseInt(payment.songIndex);
        const musicFiles = getMusicFiles();
        
        if (songIndex >= 0 && songIndex < musicFiles.length) {
            const filePath = path.join(__dirname, musicFiles[songIndex]);
            const fileName = path.basename(filePath);
            
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.setHeader('Content-Type', 'audio/wav');
            res.sendFile(filePath);
        } else {
            res.status(404).json({ error: 'File not found' });
        }
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get music files list
function getMusicFiles() {
    return [
        'chingon-full-album/¿Dónde estaban los policías_ (Remastered).wav',
        'chingon-full-album/As Fast As You Can Go, As High As You Can Go (Remastered).wav',
        'chingon-full-album/Berlín (Remastered).wav',
        'chingon-full-album/Brisa (Remastered).wav',
        'chingon-full-album/CHILL (Remastered).wav',
        'chingon-full-album/Chingón (Remastered).wav',
        'chingon-full-album/Corrido para cantar (Remastered).wav',
        'chingon-full-album/De nuevo tropiezo (Remastered).wav',
        'chingon-full-album/Desaparecer (Remastered).wav',
        'chingon-full-album/Destruir el Sistema (Remastered).wav',
        'chingon-full-album/El León (Remastered).wav',
        'chingon-full-album/En el rancho (Remastered).wav',
        'chingon-full-album/Estambul Turquía (Remastered).wav',
        'chingon-full-album/Harmonizing at the Campfire (Remastered).wav',
        'chingon-full-album/India (Remastered).wav',
        'chingon-full-album/Invierno (Remastered).wav',
        'chingon-full-album/Lluvia (Remastered).wav',
        'chingon-full-album/Look at Me Now (Remastered).wav',
        'chingon-full-album/Loving You Is Easy (Remastered).wav',
        'chingon-full-album/Me ahogo en alcohol (Remastered).wav',
        'chingon-full-album/Mi religión (Remastered).wav',
        'chingon-full-album/Nunca Olvidaré Aquella Noche (Remastered).wav',
        'chingon-full-album/Nunca vuelvo a California (Remastered).wav',
        'chingon-full-album/Odio cuando no estás aquí (Remastered).wav',
        'chingon-full-album/Paysundú (Remastered).wav',
        'chingon-full-album/Pecadores (Remastered).wav',
        'chingon-full-album/Si el cielo cae (Remastered).wav',
        'chingon-full-album/Siempre traigo cruz (Remastered).wav',
        'chingon-full-album/Soy Quien Soy (Remastered).wav',
        'chingon-full-album/Te Dejo Mi Amor (Remastered).wav',
        'chingon-full-album/Un Beso Más Antes de Irme (Remastered).wav',
        'chingon-full-album/You Lost My Trust (Remastered).wav'
    ];
}

// Start server
app.listen(PORT, () => {
    console.log(`\n🎵 Marlín Lucas Music Player is running!`);
    console.log(`📡 Server started at http://localhost:${PORT}`);
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('your_secret_key')) {
        console.log(`\n⚠️  WARNING: Stripe keys not configured!`);
        console.log(`   Please set up your .env file with Stripe credentials.`);
        console.log(`   See env.example for reference.\n`);
    } else {
        console.log(`✅ Stripe configured`);
    }
    console.log(`\nPress Ctrl+C to stop the server\n`);
});
