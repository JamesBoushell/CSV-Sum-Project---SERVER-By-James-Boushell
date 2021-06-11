const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');
const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname)
    }
})
const upload = multer({ storage });

const app = express();
const port = 4000;
app.use(cors({ origin: true }));
app.use(express.json());

app.post('/get-csv-sum', upload.single('csv'), (req, res) => {
    const file = req.file;
    let cols = [];

    fs.createReadStream(file.path)
        .pipe(csv({
            mapValues: ({ header, index, value }) => parseFloat(value),
        }))
        .on('data', record => {
            // Push records to cols array on read
            for (const feature in record) {
                cols[feature] ? cols[feature].push(record[feature]) : cols[feature] = [record[feature]]
            }
        })
        .on('end', () => {
            // Sum each column and store it to that column name
            for (let col in cols) {
                cols[col] = cols[col].reduce((a, b) => (a || 0) + (b || 0))
            }
            // Send the JSON response to the browser with all of the column sums
            res.json({
                ...cols
            })

        })
})



app.listen(port, async () => {
    console.log(`Example app listening at http://localhost:${port}`)
})