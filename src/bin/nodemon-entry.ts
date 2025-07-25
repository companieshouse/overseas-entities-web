import app from '../app';

const PORT = 3000;

app.set('port', PORT);

app.listen(PORT, () => {
  console.log(`✅  Application Ready. Running on port ${PORT}`);
});
