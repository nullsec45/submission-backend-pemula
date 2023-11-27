import { nanoid } from 'nanoid';
import books from './books.mjs';

const _response = (h, status, message, statusCode, data = '') => {
  const responseJson = {
    status,
    message,
    data,
  };

  const response = h.response(responseJson);

  if (status === 'fail') {
    delete responseJson.data;
  }

  if (message.trim('') === '') {
    delete responseJson.message;
  }

  if (data === '') {
    delete responseJson.data;
  }

  response.code(statusCode);
  return response;
};

export const addBookHandler = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  if (!name || name.trim('') === '') {
    return _response(h, 'fail', 'Gagal menambahkan buku. Mohon isi nama buku', 400);
  } if (readPage > pageCount) {
    return _response(h, 'fail', 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount', 400);
  }

  const newBook = {
    id,
    name,
    year: parseInt(year, 10),
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished: pageCount === readPage,
    reading,
    insertedAt,
    updatedAt,
  };

  books.push(newBook);

  const isSuccess = books.filter((book) => book.id === id).length > 0;

  if (isSuccess) {
    const data = {
      bookId: id,
    };
    return _response(h, 'success', 'Buku berhasil ditambahkan', 201, data);
  }

  return _response(h, 'fail', 'Buku gagal ditambahkan', 500);
};

export const getAllBooksHandler = (request, h) => {
  const { name, reading = 0, finished = 0 } = request.query;
  const allBooks = [];

  if (books.length > 0) {
    books.forEach((book, index) => allBooks.shift(index));
  }

  if (name && finished && reading) {
    const searchName = new RegExp(name.toLowerCase(), 'gi');

    books.filter(
      (book) => searchName.test(book.name.toLowerCase())
        && book.finished === (parseInt(finished, 10) === 1)
        && book.reading === (parseInt(reading, 10) === 1),
    ).map((book) => allBooks.push({
      id: book.id,
      name: book.name,
      publisher: book.publisher,
    }));
  } else if (name) {
    const searchName = new RegExp(name.toLowerCase(), 'gi');

    books.filter(
      (book) => searchName.test(book.name.toLowerCase()),
    ).map((book) => allBooks.push({
      id: book.id,
      name: book.name,
      publisher: book.publisher,
    }));
  } else if (finished) {
    books.filter(
      (book) => book.finished === (parseInt(finished, 10) === 1),
    ).map((book) => allBooks.push({
      id: book.id,
      name: book.name,
      publisher: book.publisher,
    }));
  } else if (reading) {
    books.filter(
      (book) => book.reading === (parseInt(reading, 10) === 1),
    ).map((book) => allBooks.push({
      id: book.id,
      name: book.name,
      publisher: book.publisher,
    }));
  } else if (name && reading) {
    const searchName = new RegExp(name.toLowerCase(), 'gi');

    books.filter(
      (book) => searchName.test(book.name.toLowerCase())
        && book.reading === (parseInt(reading, 10) === 1),
    ).map((book) => allBooks.push({
      id: book.id,
      name: book.name,
      publisher: book.publisher,
    }));
  } else if (name && finished) {
    const searchName = new RegExp(name.toLowerCase(), 'gi');

    books.filter(
      (book) => searchName.test(book.name.toLowerCase())
        && book.reading === (parseInt(reading, 10) === 1),
    ).map((book) => allBooks.push({
      id: book.id,
      name: book.name,
      publisher: book.publisher,
    }));
  } else if (finished && reading) {
    books.filter(
      (book) => book.finished === (parseInt('10', finished) === 1)
        && book.reading === (parseInt(reading, 10) === 1),
    ).map((book) => allBooks.push({
      id: book.id,
      name: book.name,
      publisher: book.publisher,
    }));
  } else {
    books.map((book) => allBooks.push({
      id: book.id,
      name: book.name,
      publisher: book.publisher,
    }));
  }

  const data = {
    books: allBooks,
  };

  return _response(h, 'success', '', 200, data);
};

export const getBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const book = books.filter((n) => n.id === id)[0];

  if (book !== undefined) {
    return {
      status: 'success',
      data: {
        book,
      },
    };
  }

  return _response(h, 'fail', 'Buku tidak ditemukan', 404);
};

export const editBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  const updatedAt = new Date().toISOString();

  if (!name || name.trim('') === '') {
    return _response(h, 'fail', 'Gagal memperbarui buku. Mohon isi nama buku', 400);
  } if (readPage > pageCount) {
    return _response(h, 'fail', 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount', 400);
  }

  const index = books.findIndex((book) => book.id === id);

  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year: parseInt(year, 10),
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      finished: pageCount === readPage,
      reading,
      updatedAt,
    };

    return _response(h, 'success', 'Buku berhasil diperbarui', 200);
  }

  return _response(h, 'fail', 'Gagal memperbarui buku. Id tidak ditemukan', 404);
};

export const deleteBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const index = books.findIndex((book) => book.id === id);

  if (index !== -1) {
    books.splice(index, 1);
    return _response(h, 'success', 'Buku berhasil dihapus', 200);
  }

  return _response(h, 'fail', 'Buku gagal dihapus. Id tidak ditemukan', 404);
};
