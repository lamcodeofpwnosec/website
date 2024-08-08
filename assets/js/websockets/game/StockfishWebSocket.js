import { COLOR, MARKER_TYPE } from '@chesslablab/chessboard';
import { Movetext } from '@chesslablab/js-utils';
import AbstractGameWebSocket from './AbstractGameWebSocket.js';
import { stockfishPanel } from '../../pages/StockfishPanel.js';
import * as mode from '../../../mode.js';
import * as variant from '../../../variant.js';

export class StockfishWebSocket extends AbstractGameWebSocket {
  async connect() {
    await super.connect();

    this._socket.onmessage = (res) => {
      const data = JSON.parse(res.data);
      const msg = Object.keys(data)[0];
      this._response[msg] = data[msg];
      switch (msg) {
        case 'error':
          console.log('Whoops! Something went wrong.');
          break;

        case '/start':
          this.chessboard.disableMoveInput();
          this.chessboard.enableMoveInput(event => this.inputHandler(event));
          this.chessboard.setPosition(data[msg].fen, true);
          if (data[msg].color === COLOR.black) {
            this.chessboard.setOrientation(COLOR.black);
          }
          if (data[msg].fen.split(' ')[1] !== data[msg].color) {
            this.send(`/stockfish "{\\"Skill Level\\":${sessionStorage.getItem('skillLevel')}}" "{\\"depth\\":12}"`);
          }
          break;

        case '/legal':
          data[msg].forEach(sq => {
            this.chessboard.addMarker(MARKER_TYPE.dot, sq);
          });
          break;

        case '/play_lan':
          if (data[msg].isValid) {
            this.chessboard.setPosition(data[msg].fen, true);
            stockfishPanel.props.sanMovesBrowser.current = stockfishPanel.props.sanMovesBrowser.props.fen.length;
            stockfishPanel.props.sanMovesBrowser.props.movetext = Movetext.notation(localStorage.getItem('notation'), data[msg].movetext);
            stockfishPanel.props.sanMovesBrowser.props.fen = stockfishPanel.props.sanMovesBrowser.props.fen.concat(data[msg].fen);
            stockfishPanel.props.sanMovesBrowser.mount();
            stockfishPanel.props.openingTable.props.movetext = data[msg].movetext;
            stockfishPanel.props.openingTable.mount();
            if (!this._gameOver(data[msg])) {
              this.send(`/stockfish "{\\"Skill Level\\":${sessionStorage.getItem('skillLevel')}}" "{\\"depth\\":12}"`);
            }
          } else {
            this.chessboard.setPosition(data[msg].fen, false);
          }
          break;

        case '/undo':
          this.chessboard.setPosition(data[msg].fen, true);
          if (!data[msg].movetext) {
            this.chessboard.state.inputWhiteEnabled = true;
            this.chessboard.state.inputBlackEnabled = false;
          }
          stockfishPanel.props.sanMovesBrowser.current -= 1;
          stockfishPanel.props.sanMovesBrowser.props.fen.splice(-1);
          stockfishPanel.props.sanMovesBrowser.props.movetext = Movetext.notation(localStorage.getItem('notation'), data[msg].movetext);
          stockfishPanel.props.sanMovesBrowser.mount();
          stockfishPanel.props.openingTable.props.movetext = data[msg].movetext;
          stockfishPanel.props.openingTable.mount();
          break;

        case '/stockfish':
          this.chessboard.setPosition(data[msg].fen, true);
          stockfishPanel.props.sanMovesBrowser.current = stockfishPanel.props.sanMovesBrowser.props.fen.length;
          stockfishPanel.props.sanMovesBrowser.props.movetext = Movetext.notation(localStorage.getItem('notation'), data[msg].movetext);
          stockfishPanel.props.sanMovesBrowser.props.fen = stockfishPanel.props.sanMovesBrowser.props.fen.concat(data[msg].fen);
          stockfishPanel.props.sanMovesBrowser.mount();
          stockfishPanel.props.openingTable.props.movetext = data[msg].movetext;
          stockfishPanel.props.openingTable.mount();
          this._gameOver(data[msg]);
          break;

        case '/randomizer':
          this.chessboard.state.inputWhiteEnabled = false;
          this.chessboard.state.inputBlackEnabled = false;
          if (data[msg].turn === COLOR.white) {
            this.chessboard.state.inputWhiteEnabled = true;
          } else {
            this.chessboard.state.inputBlackEnabled = true;
          }
          sessionStorage.setItem('skillLevel', 20);
          sessionStorage.setItem('depth', 12);
          const settings = {
            color: data[msg].turn,
            fen: data[msg].fen
          };
          this.send(`/start ${variant.CLASSICAL} ${mode.STOCKFISH} "${JSON.stringify(settings).replace(/"/g, '\\"')}"`);
          break;

        default:
          break;
      }
    };
  }
}

export const stockfishWebSocket = new StockfishWebSocket();
