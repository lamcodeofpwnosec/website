import { Opening } from "https://cdn.jsdelivr.net/npm/@chesslablab/jsblab@0.0.9/src/index.min.js";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/app.css';
import * as mode from './modeConst.js';
import * as variant from './variantConst.js';

const openingsTableDomNode = (openings, tbody) => {
  tbody.replaceChildren();
  openings.forEach(opening => {
    const tr = document.createElement('tr');
    const ecoTd = document.createElement('td');
    const ecoText = document.createTextNode(opening.eco);
    const nameTd = document.createElement('td');
    const nameText = document.createTextNode(opening.name);
    const movetextTd = document.createElement('td');
    const movetextText = document.createTextNode(opening.movetext);
    ecoTd.appendChild(ecoText);
    nameTd.appendChild(nameText);
    movetextTd.appendChild(movetextText);
    tr.appendChild(ecoTd);
    tr.appendChild(nameTd);
    tr.appendChild(movetextTd);
    tr.addEventListener('click', event => {
      const add = {
        movetext: opening.movetext
      };
      localStorage.setItem(
        'msg',
        `/start ${variant.CLASSICAL} ${mode.SAN} "${JSON.stringify(add).replace(/"/g, '\\"')}"`
      );
      window.location.href = '/openings';
    });
    tbody.appendChild(tr);
  });
};

const chessboardSanMovetextModal = document.getElementById('chessboardSanMovetextModal');

const chessboardFenStringModal = document.getElementById('chessboardFenStringModal');

const playComputerModal = document.getElementById('playComputerModal');

const openingsEcoCodeModal = document.getElementById('openingsEcoCodeModal');

const openingsSanMovetextModal = document.getElementById('openingsSanMovetextModal');

const openingsNameModal = document.getElementById('openingsNameModal');

chessboardSanMovetextModal.getElementsByTagName('form')[0].addEventListener('submit', event => {
  event.preventDefault();
  const add = {
    ...(event.target.elements[1].value && {fen: event.target.elements[1].value}),
    movetext: event.target.elements[2].value
  };
  localStorage.setItem(
    'msg',
    `/start ${event.target.elements[0].value} ${mode.SAN} "${JSON.stringify(add).replace(/"/g, '\\"')}"`
  );
  window.location.href = '/chessboard/san-movetext';
});

chessboardFenStringModal.getElementsByTagName('form')[0].addEventListener('submit', event => {
  event.preventDefault();
  const add = {
    fen: event.target.elements[1].value
  };
  localStorage.setItem(
    'msg',
    `/start ${event.target.elements[0].value} ${mode.FEN} "${JSON.stringify(add).replace(/"/g, '\\"')}"`
  );
  window.location.href = '/chessboard/fen-string';
});

playComputerModal.getElementsByTagName('form')[0].addEventListener('submit', event => {
  event.preventDefault();
  const formData = new FormData(playComputerModal.getElementsByTagName('form')[0]);
  localStorage.setItem('mode', mode.STOCKFISH);
  localStorage.setItem('msg', `/start ${variant.CLASSICAL} ${mode.STOCKFISH} ${formData.get('color')}`);
  window.location.href = '/play/computer';
});

openingsEcoCodeModal.getElementsByTagName('select')[0].addEventListener('change', event => {
  event.preventDefault();
  const openings = Opening.byEco(event.target.value);
  const tbody = openingsEcoCodeModal.getElementsByTagName('tbody')[0];
  openingsTableDomNode(openings, tbody);
});

openingsSanMovetextModal.getElementsByTagName('form')[0].addEventListener('submit', event => {
  event.preventDefault();
  const formData = new FormData(openingsSanMovetextModal.getElementsByTagName('form')[0]);
  const openings = Opening.byMovetext(formData.get('movetext'));
  const tbody = openingsSanMovetextModal.getElementsByTagName('tbody')[0];
  openingsTableDomNode(openings, tbody);
});

openingsNameModal.getElementsByTagName('form')[0].addEventListener('submit', event => {
  event.preventDefault();
  const formData = new FormData(openingsNameModal.getElementsByTagName('form')[0]);
  const openings = Opening.byName(formData.get('name'));
  const tbody = openingsNameModal.getElementsByTagName('tbody')[0];
  openingsTableDomNode(openings, tbody);
});
