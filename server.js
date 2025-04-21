const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/profile-uploads', express.static(path.join(__dirname, 'profile-uploads')));
app.use('/car-uploads', express.static(path.join(__dirname, 'car-uploads')));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'pavithran@123',
    database: 'absoluteautos'
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL connected.');
});

app.post('/api/signin', (req, res) => {
    const { username, password } = req.body;

    const query = `
        SELECT id AS profile_id FROM users
        WHERE username = ?
        AND (
            (new_password IS NOT NULL AND new_password = ?)
            OR
            (new_password IS NULL AND password = ?)
        )
    `;

    db.query(query, [username, password, password], (err, results) => {
        if (err) {
            console.error(err);  // Logging the error for debugging
            return res.status(500).send({ message: "Database error" });
        }

        if (results.length > 0) {
            const { profile_id } = results[0];
            res.send({ success: true, profileId: profile_id });
        } else {
            res.send({ success: false, message: "Invalid credentials" });
        }
    });
});

app.post('/api/access_level', (req, res) => {
    const { userId } = req.body; // ✅ Get from req.body

    const query = `
        SELECT access_level FROM users
        WHERE id = ?`;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: "Database error" });
        }

        if (results.length > 0) {
            const { access_level } = results[0];
            res.send({ success: true, accessLevel: access_level });
        } else {
            res.send({ success: false, message: "Invalid user ID" });
        }
    });
});

app.post('/api/verifyPassword', (req, res) => {
    const { userId, currentPassword } = req.body;

    const query = 'SELECT password FROM users WHERE id = ?';
    db.query(query, [userId], (err, results) => {
        if (err || results.length === 0) {
            return res.send({ success: false, message: 'User not found' });
        }

        const userPassword = results[0].password;
        if (userPassword === currentPassword) {
            res.send({ success: true });
        } else {
            res.send({ success: false, message: 'Incorrect password' });
        }
    });
});

app.get('/api/getProfile/:userId', (req, res) => {
    const userId = req.params.userId;

    const query = `SELECT * FROM profiles WHERE user_id = ?`;

    db.query(query, [userId, userId], (err, results) => {
        if (err) {
            console.error('Error fetching profile:', err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }

        res.json({ success: true, data: results[0] });
    });
});

app.post('/api/updatePassword', (req, res) => {
    const { userId, newPassword } = req.body;

    const query = 'UPDATE users SET new_password = ? WHERE id = ?';
    db.query(query, [newPassword, userId], (err, result) => {
        if (err) {
            console.error('Error updating password:', err);
            return res.send({ success: false });
        }
        res.send({ success: true });
    });
});

// Save profile data
app.post('/api/saveProfile', (req, res) => {
    const data = req.body;

    const query = `INSERT INTO profiles SET ?`;
    db.query(query, data, (err, result) => {
        if (err) {
            console.error('Error saving profile:', err);
            return res.status(500).send('Error saving profile.');
        }
        res.send({ success: true, profileId: result.insertId });
    });
});

// Send email and create user
app.post('/api/sendEmail', async (req, res) => {
    console.log("sendEmail API hit");

    const { email, companyName, contactPerson, mobileNumber, profileId } = req.body;

    // Generate username and password
    const username = `${contactPerson.toLowerCase().replace(/\s/g, '')}_${Math.floor(1000 + Math.random() * 9000)}`;
    const password = Math.random().toString(36).slice(-8); // 8-character random password

    const connection = db.promise(); // Using promise-based connection for transaction

    try {
        // Start transaction
        await connection.beginTransaction();

        // Insert into users table
        const insertUserQuery = `INSERT INTO users (username, password) VALUES (?, ?)`;
        const [userResult] = await connection.query(insertUserQuery, [username, password]);
        const insertedUserId = userResult.insertId;

        console.log("Inserted user ID:", insertedUserId);

        // Update profiles table with the user_id
        const updateProfileQuery = `UPDATE profiles SET user_id = ? WHERE id = ?`;
        await connection.query(updateProfileQuery, [insertedUserId, profileId]);

        // Setup transporter
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'vv.pavithran12@gmail.com',
                pass: 'aajuyoahcuszqrey'
            }
        });

        // Email content
        let mailOptions = {
            from: 'vv.pavithran12@gmail.com',
            to: email,
            subject: 'Registration Successful - Absolute Autos',
            html: `
                <p>Hi ${contactPerson},</p>
                <p>Thank you for registering with <strong>Absolute Autos</strong>. Your profile has been successfully submitted.</p>
                <p>Your login credentials are:</p>
                <ul>
                    <li><strong>Username:</strong> ${username}</li>
                    <li><strong>Password:</strong> ${password}</li>
                </ul>
                <p>Please log in to your account and change your password after the first login.</p>
                <br><p>Best regards,<br>Absolute Autos Team</p>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);

        // Commit transaction
        await connection.commit();

        res.send({ success: true });

    } catch (error) {
        // Rollback transaction if error occurs
        await connection.rollback();

        console.error("Error during email or profile update:", error);
        res.status(500).send({ success: false, message: "Profile update or email failed" });
    } finally {
        // Close the connection
        connection.end();
    }
});

app.post('/api/uploadDocuments', async (req, res) => {
    const { profileId, documents } = req.body;

    try {
        for (const doc of documents) {
            const fileName = `${Date.now()}_${doc.name}`;
            const filePath = path.join(__dirname, 'profile-uploads', fileName);

            // Convert base64 to binary and save
            const base64Data = doc.base64.replace(/^data:.*;base64,/, "");
            fs.writeFileSync(filePath, base64Data, 'base64');

            // Check if document already exists
            const [existingDoc] = await db.promise().query(
                'SELECT id FROM documents WHERE profile_id = ? AND file_name = ?',
                [profileId, doc.name]
            );

            if (existingDoc.length > 0) {
                await db.promise().query(
                    'UPDATE documents SET file_path = ? WHERE id = ?',
                    [filePath, existingDoc[0].id]
                );
            } else {
                await db.promise().query(
                    'INSERT INTO documents (profile_id, file_name, file_path) VALUES (?, ?, ?)',
                    [profileId, doc.name, filePath]
                );
            }
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error uploading documents', error);
        res.status(500).json({ success: false, message: 'Failed to upload documents' });
    }
});

// Node.js/Express API to update profile information
app.post('/api/updateProfile', async (req, res) => {
    const {
        user_id,
        company_name,
        company_type,
        mailing_address,
        billing_address,
        telephone,
        fax,
        website,
        contact_person1,
        contact_number1,
        email1,
        contact_person2,
        contact_number2,
        email2
    } = req.body;

    try {
        const query = `
            UPDATE profiles
            SET company_name = ?, company_type = ?, mailing_address = ?, billing_address = ?, 
                telephone = ?, fax = ?, website = ?, contact_person1 = ?, contact_number1 = ?, 
                email1 = ?, contact_person2 = ?, contact_number2 = ?, email2 = ?
            WHERE user_id = ?;
        `;
        const values = [
            company_name, company_type, mailing_address, billing_address,
            telephone, fax, website, contact_person1, contact_number1,
            email1, contact_person2, contact_number2, email2, user_id
        ];
        await db.query(query, values);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating profile', error);
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
});

app.post('/api/carupload', upload.fields([
    { name: 'exterior_photos', maxCount: 10 },
    { name: 'interior_photos', maxCount: 10 },
    { name: 'engine_bay_photo', maxCount: 1 },
    { name: 'video_walkaround', maxCount: 1 },
    { name: 'documents', maxCount: 10 }
]), async (req, res) => {
    const connection = db.promise();

    const {
        profile_id,
        make,
        model,
        purchase_year,
        vin,
        mileage,
        car_condition,
        transmission,
        drive_type,
        fuel_type,
        color,
        title_status,
        accident_history,
        additional_features,
        service_records,
        vehicle_available_for_inspection,
        starting_bid,
        bidding_end_time,
        buy_now_price,
        bidding_increment,
        seller_name,
        contact_email,
        contact_phone,
        location,
        seller_available_for_inspection
    } = req.body;

    const {
        exterior_photos = [],
        interior_photos = [],
        engine_bay_photo = [],
        video_walkaround = [],
        documents = []
    } = req.files;

    try {
        await connection.beginTransaction();

        const featuresString = Array.isArray(additional_features)
            ? additional_features.join(', ')
            : additional_features;

        // 1. Insert into car_details
        const [carResult] = await connection.query(
            `INSERT INTO car_details (
                profile_id, make, model, purchase_year, vin, mileage, car_condition,
                transmission, drive_type, fuel_type, color, title_status, accident_history,
                additional_features, service_records, vehicle_available_for_inspection
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                profile_id, make, model, purchase_year, vin, mileage, car_condition,
                transmission, drive_type, fuel_type, color, title_status, accident_history,
                featuresString, service_records, vehicle_available_for_inspection
            ]
        );

        const car_id = carResult.insertId;

        // 2. File saving helper
        const saveUploadedFiles = (filesArray) => {
            return filesArray.map(file => {
                if (!file || !file.buffer) return null; // Add this check

                const fileName = `${Date.now()}_${file.originalname}`;
                const filePath = path.join(__dirname, 'car-uploads', fileName);
                fs.writeFileSync(filePath, file.buffer);
                return `/car-uploads/${fileName}`;
            }).filter(Boolean); // Filter out null entries
        };

        const savedExteriorPhotos = saveUploadedFiles(exterior_photos || []);
        const savedInteriorPhotos = saveUploadedFiles(interior_photos || []);
        const savedDocuments = saveUploadedFiles(documents || []);

        let savedEngineBayPhoto = null;
        if (engine_bay_photo && engine_bay_photo[0]) {
            const file = engine_bay_photo[0];
            const fileName = `${Date.now()}_${file.originalname}`;
            const filePath = path.join(__dirname, 'car-uploads', fileName);
            fs.writeFileSync(filePath, file.buffer);
            savedEngineBayPhoto = `/car-uploads/${fileName}`;
        }

        let savedVideoWalkaround = null;
        if (video_walkaround && video_walkaround[0]) {
            const file = video_walkaround[0];
            const fileName = `${Date.now()}_${file.originalname}`;
            const filePath = path.join(__dirname, 'car-uploads', fileName);
            fs.writeFileSync(filePath, file.buffer);
            savedVideoWalkaround = `/car-uploads/${fileName}`;
        }

        // 3. Insert into photos_media
        const safe = (val) => (typeof val === 'undefined' ? null : val);

        await connection.query(
            `INSERT INTO photos_media (
                car_id, exterior_photos, interior_photos, engine_bay_photo, video_walkaround, documents
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                car_id,
                JSON.stringify(savedExteriorPhotos),
                JSON.stringify(savedInteriorPhotos),
                safe(savedEngineBayPhoto),
                safe(savedVideoWalkaround),
                JSON.stringify(savedDocuments)
            ]
        );

        // 4. Insert into bidding_info
        await connection.query(
            `INSERT INTO bidding_info (
                car_id, starting_bid, bidding_end_time, buy_now_price, bidding_increment
            ) VALUES (?, ?, ?, ?, ?)`,
            [car_id, starting_bid, bidding_end_time, buy_now_price, bidding_increment]
        );

        // 5. Insert into seller_info
        await connection.query(
            `INSERT INTO seller_info (
                car_id, seller_name, contact_email, contact_phone, location, seller_available_for_inspection
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                car_id,
                seller_name,
                contact_email,
                contact_phone,
                location,
                seller_available_for_inspection
            ]
        );

        await connection.commit();
        res.json({ success: true, carId: car_id });

    } catch (error) {
        await connection.rollback();
        console.error("Error uploading car data:", error);
        res.status(500).json({ success: false, message: "Car upload failed" });
    }
});

app.get('/api/caruploads', async (req, res) => {
    const connection = db.promise();
    try {
        const [rows] = await connection.query(`
            SELECT cd.id AS car_id, cd.*, pm.*, bi.*, si.* 
            FROM car_details cd
            LEFT JOIN photos_media pm ON cd.id = pm.car_id
            LEFT JOIN bidding_info bi ON cd.id = bi.car_id
            LEFT JOIN seller_info si ON cd.id = si.car_id
            ORDER BY cd.created_at DESC
        `);

        res.json(rows);
    } catch (error) {
        console.error("Error fetching car uploads:", error);
        res.status(500).json({ success: false, message: "Failed to fetch car uploads" });
    }
});


app.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});
