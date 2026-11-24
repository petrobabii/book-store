import { useState, useEffect } from 'react';
import { Form, Button, Table, Alert, Card } from 'react-bootstrap';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/books';
const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY;

function Admin() {
  const [books, setBooks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ text: '', variant: '' });
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [formData, setFormData] = useState(() => {
    const savedDraft = sessionStorage.getItem('admin_book_draft');
    return savedDraft
      ? JSON.parse(savedDraft)
      : { title: '', text: '', price: '', imgurl: '/images/Kobzar.jpg' };
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!editingId) {
      sessionStorage.setItem('admin_book_draft', JSON.stringify(formData));
    }
  }, [formData, editingId]);

  const loadBooks = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setBooks(data);
    } catch {
      setMessage({ text: 'Не вдалося з’єднатися з сервером', variant: 'danger' });
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadBooks();
    };
    init();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', variant: '' });

    if (!formData.title.trim() || !formData.text.trim() || Number(formData.price) <= 0) {
      setMessage({ text: 'Заповніть усі поля коректно', variant: 'warning' });
      return;
    }

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ADMIN_KEY,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage({ text: result.error || 'Помилка збереження', variant: 'danger' });
        return;
      }

      setMessage({
        text: editingId ? 'Книгу успішно оновлено!' : 'Нову книгу додано до бази даних!',
        variant: 'success',
      });

      setEditingId(null);
      const emptyForm = { title: '', text: '', price: '', imgurl: '/images/Kobzar.jpg' };
      setFormData(emptyForm);
      sessionStorage.removeItem('admin_book_draft');
      loadBooks();
    } catch {
      setMessage({ text: 'Помилка мережі при відправці форми', variant: 'danger' });
    }
  };

  const handleEdit = (book) => {
    setEditingId(book.id);
    setFormData({
      title: book.title,
      text: book.text,
      price: book.price,
      imgurl: book.imgurl,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'x-api-key': ADMIN_KEY },
      });
      if (response.ok) {
        setMessage({ text: 'Книгу видалено', variant: 'info' });
        loadBooks();
      }
    } catch {
      setMessage({ text: 'Помилка при видаленні', variant: 'danger' });
    }
  };

  if (authLoading) {
    return <p className="mt-4">Перевірка прав доступу...</p>;
  }

  if (!currentUser || currentUser.email !== import.meta.env.VITE_ADMIN_EMAIL) {
    return (
      <Alert variant="danger" className="mt-4">
        <Alert.Heading>Доступ заборонено (403 Forbidden)</Alert.Heading>
        <p className="mb-0">
          Ця сторінка доступна лише для адміністратора інтернет-магазину. Будь ласка, увійдіть під обліковим записом адміністратора.
        </p>
      </Alert>
    );
  }

  return (
    <div className="pb-5">
      <h2 className="mb-4">Панель керування книгами</h2>

      {message.text && (
        <Alert variant={message.variant} onClose={() => setMessage({ text: '', variant: '' })} dismissible>
          {message.text}
        </Alert>
      )}

      <Card className="p-4 mb-5 shadow-sm">
        <h5 className="mb-3">{editingId ? `Редагування книги #${editingId}` : 'Додати нову книгу'}</h5>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Назва книги</Form.Label>
            <Form.Control
              type="text"
              name="title"
              placeholder="Наприклад: Кобзар"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Автор</Form.Label>
            <Form.Control
              type="text"
              name="text"
              placeholder="Наприклад: Тарас Шевченко"
              value={formData.text}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Ціна (грн)</Form.Label>
            <Form.Control
              type="number"
              name="price"
              placeholder="550"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Шлях до фото</Form.Label>
            <Form.Control
              type="text"
              name="imgurl"
              value={formData.imgurl}
              onChange={handleChange}
            />
          </Form.Group>

          <div className="d-flex gap-2">
            <Button variant="primary" type="submit">
              {editingId ? 'Зберегти зміни' : 'Додати книгу'}
            </Button>
            {editingId && (
              <Button
                variant="secondary"
                onClick={() => {
                  setEditingId(null);
                  setFormData({ title: '', text: '', price: '', imgurl: '/images/Kobzar.jpg' });
                }}
              >
                Скасувати
              </Button>
            )}
          </div>
        </Form>
      </Card>

      <h4 className="mb-3">Список книг у базі даних ({books.length})</h4>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Назва</th>
            <th>Автор</th>
            <th>Ціна</th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id}>
              <td>{book.id}</td>
              <td>{book.title}</td>
              <td>{book.text}</td>
              <td>{book.price} грн</td>
              <td>
                <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(book)}>
                  Редагувати
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(book.id)}>
                  Видалити
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default Admin;