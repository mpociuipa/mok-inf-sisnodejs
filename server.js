const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

const students = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'students.json')).toString());

// Pagrindinis puslapis su moksleivių kortelėmis
app.get('/', (req, res) => {
  res.render('index', { students });
});

// Moksleivio kortelės mygtukas "Detali informacija"
app.get('/student/:id', (req, res) => {
  const student = students.find(s => s.id == req.params.id);
  res.render('details', { student });
});

// Moksleivių rikiavimas pagal pavardę
app.get('/sort/lastname', (req, res) => {
  const sortedStudents = students.slice().sort((a, b) => a.lastName.localeCompare(b.lastName));
  res.render('index', { students: sortedStudents });
});

// Moksleivio paieška
app.post('/search', (req, res) => {
  const { firstname, lastName, class: className } = req.body;
  const results = students.filter(student =>
    (!firstname || student.firstname.includes(firstname)) &&
    (!lastName || student.lastName.includes(lastName)) &&
    (!className || student.class === className)
  );
  res.render('index', { students: results });
});

// Vidurkių apskaičiavimas ir įrašymas į failą
app.get('/average', (req, res) => {
  const averages = students.map(student => {
    const grades = Object.values(student.subjects_grades);
    const average = (grades.reduce((sum, val) => sum + val, 0) / grades.length).toFixed(2);
    return { ...student, average };
  });

  fs.writeFileSync(path.join(__dirname, 'data', 'averages.txt'), JSON.stringify(averages, null, 2));

  res.send('Vidurkiai buvo apskaičiuoti ir įrašyti į failą.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveris veikia ant http://localhost:${PORT}`));
