// A turn's whole drawing as one compact block of bytes (spec §6.3), for a browser that joins or
// reloads mid-turn. Points are in half board units, so each fits in two bytes.
import type { BoardAction, FillAction, StrokeAction } from '@scribble-table/protocol';

const formatVersion = 1;
const strokeKind = 0;
const fillKind = 1;

// Ids are ASCII: the protocol allows only letters, digits, _ and - (and session ids are the same).
const toAscii = (text: string): Uint8Array => Uint8Array.from(text, (char) => char.charCodeAt(0) & 0x7f);
const fromAscii = (bytes: Uint8Array): string => String.fromCharCode(...bytes);

// Board units to the two-byte form and back.
const toHalves = (value: number): number => Math.min(0xffff, Math.max(0, Math.round(value * 2)));

class ByteWriter {
  readonly #view: DataView;
  #at = 0;

  constructor(size: number) {
    this.#view = new DataView(new ArrayBuffer(size));
  }

  get bytes(): Uint8Array {
    return new Uint8Array(this.#view.buffer, 0, this.#at);
  }

  u8(value: number): void {
    this.#view.setUint8(this.#at, value);
    this.#at += 1;
  }

  u16(value: number): void {
    this.#view.setUint16(this.#at, value, true);
    this.#at += 2;
  }

  u32(value: number): void {
    this.#view.setUint32(this.#at, value, true);
    this.#at += 4;
  }

  // Up to 255 characters.
  text(bytes: Uint8Array): void {
    this.u8(bytes.length);
    new Uint8Array(this.#view.buffer).set(bytes, this.#at);
    this.#at += bytes.length;
  }
}

class ByteReader {
  readonly #view: DataView;
  #at = 0;

  constructor(bytes: Uint8Array) {
    this.#view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  }

  u8(): number {
    this.#at += 1;

    return this.#view.getUint8(this.#at - 1);
  }

  u16(): number {
    this.#at += 2;

    return this.#view.getUint16(this.#at - 2, true);
  }

  u32(): number {
    this.#at += 4;

    return this.#view.getUint32(this.#at - 4, true);
  }

  text(): string {
    const length = this.u8();

    this.#at += length;

    return fromAscii(new Uint8Array(this.#view.buffer, this.#view.byteOffset + this.#at - length, length));
  }
}

// An upper bound of the encoded size, so the buffer is allocated once.
const sizeOf = (actions: readonly BoardAction[], authors: readonly Uint8Array[], ids: readonly Uint8Array[]): number => {
  const authorBytes = authors.reduce((sum, author) => sum + 1 + author.length, 0);
  const actionBytes = actions.reduce((sum, action, index) => sum + 3 + (ids[index]?.length ?? 0) + (action.kind === 'stroke' ? 7 + 2 * action.points.length : 5), 0);

  return 2 + authorBytes + 4 + actionBytes;
};

const writeAction = (writer: ByteWriter, action: BoardAction, id: Uint8Array, author: number): void => {
  writer.u8(action.kind === 'stroke' ? strokeKind : fillKind);
  writer.text(id);
  writer.u8(author);
  writer.u8(action.color);

  if (action.kind === 'fill') {
    writer.u16(toHalves(action.x));
    writer.u16(toHalves(action.y));

    return;
  }

  writer.u8(action.size);
  writer.u8(action.eraser ? 1 : 0);
  writer.u32(action.points.length);
  action.points.forEach((value) => writer.u16(toHalves(value)));
};

export const encodeDrawing = (actions: readonly BoardAction[]): Uint8Array => {
  const authorIds = [...new Set(actions.map((action) => action.authorId))];
  const authors = authorIds.map(toAscii);
  const ids = actions.map((action) => toAscii(action.id));
  const writer = new ByteWriter(sizeOf(actions, authors, ids));

  writer.u8(formatVersion);
  writer.u8(authors.length);
  authors.forEach((author) => writer.text(author));
  writer.u32(actions.length);
  actions.forEach((action, index) => writeAction(writer, action, ids[index] ?? new Uint8Array(), authorIds.indexOf(action.authorId)));

  return writer.bytes;
};

const readStroke = (reader: ByteReader, id: string, authorId: string, color: number): StrokeAction => {
  const size = reader.u8();
  const eraser = reader.u8() === 1;
  const points = Array.from({ length: reader.u32() }, () => reader.u16() / 2);

  return { kind: 'stroke', id, authorId, color, size, eraser, points };
};

const readFill = (reader: ByteReader, id: string, authorId: string, color: number): FillAction => {
  const x = reader.u16() / 2;
  const y = reader.u16() / 2;

  return { kind: 'fill', id, authorId, x, y, color };
};

const readAction = (reader: ByteReader, authors: readonly string[]): BoardAction => {
  const kind = reader.u8();
  const id = reader.text();
  const authorId = authors[reader.u8()] ?? '';
  const color = reader.u8();

  return kind === fillKind ? readFill(reader, id, authorId, color) : readStroke(reader, id, authorId, color);
};

// Throws on bytes that aren't a drawing of this format.
export const decodeDrawing = (bytes: Uint8Array): BoardAction[] => {
  const reader = new ByteReader(bytes);

  if (reader.u8() !== formatVersion) throw new Error('Unknown drawing format');

  const authors = Array.from({ length: reader.u8() }, () => reader.text());

  return Array.from({ length: reader.u32() }, () => readAction(reader, authors));
};
