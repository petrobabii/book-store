import { useState, useEffect } from 'react';

export const useBooks = () => {
  const [books, setBooks] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState("Всі");
  const [sortOrder, setSortOrder] = useState("default");
  const [activePage, setActivePage] = useState(0);

  const fetchBooks = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL || 'http://localhost:5000/api/books');
      const data = await response.json();
      const formattedData = data.map((book) => ({
        ...book,
        price: Number(book.price),
      }));
      setBooks(formattedData);
    } catch (error) {
      console.error("Помилка завантаження книг із сервера:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchBooks();
    };
    init();
  }, []);

  const authors = ["Всі", ...new Set(books.map((book) => book.text))];

  const filteredBooks = selectedAuthor === "Всі"
    ? books
    : books.filter((book) => book.text === selectedAuthor);

  const sortedBooks = sortOrder === "asc"
    ? [...filteredBooks].sort((a, b) => a.price - b.price)
    : sortOrder === "desc"
    ? [...filteredBooks].sort((a, b) => b.price - a.price)
    : filteredBooks;

  return {
    books: sortedBooks,
    authors,
    selectedAuthor,
    setSelectedAuthor,
    sortOrder,
    setSortOrder,
    activePage,
    setActivePage,
    refetchBooks: fetchBooks
  };
};