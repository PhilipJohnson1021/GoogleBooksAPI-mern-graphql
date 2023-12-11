import React, { useState, useEffect } from "react";
import {
  Jumbotron,
  Container,
  Col,
  Form,
  Button,
  Card,
  CardColumns,
  Row,
} from "react-bootstrap";

import { useMutation } from "@apollo/client";
import { SAVE_BOOK } from "../utils/mutations";
import { saveBookIds, getSavedBookIds } from "../utils/localStorage";

import Auth from "../utils/auth";

const SearchBooks = () => {
  // create state for holding returned google api data
  const [searchedBooks, setSearchedBooks] = useState([]);
  // create state for holding our search field data
  const [searchInput, setSearchInput] = useState("");

  // create state to hold saved bookId values
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());

  const [saveBook, { error }] = useMutation(SAVE_BOOK);
  const [showFullDescriptionMap, setShowFullDescriptionMap] = useState({});

  // set up useEffect hook to save `savedBookIds` list to localStorage on component unmount
  // learn more here: https://reactjs.org/docs/hooks-effect.html#effects-with-cleanup
  useEffect(() => {
    return () => saveBookIds(savedBookIds);
  });

  // create method to search for books and set state on form submit
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!searchInput) {
      return false;
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${searchInput}`
      );

      if (!response.ok) {
        throw new Error("something went wrong!");
      }

      const { items } = await response.json();

      const bookData = items.map((book) => ({
        bookId: book.id,
        authors: book.volumeInfo.authors || ["No author to display"],
        title: book.volumeInfo.title,
        description: book.volumeInfo.description,
        image: book.volumeInfo.imageLinks?.thumbnail || "",
      }));

      setSearchedBooks(bookData);
      setSearchInput("");
    } catch (err) {
      console.error(err);
    }
  };

  // create function to handle saving a book to our database
  const handleSaveBook = async (bookId) => {
    // find the book in `searchedBooks` state by the matching id
    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);

    // get token
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      const { data } = await saveBook({
        variables: { bookData: { ...bookToSave } },
      });
      console.log(savedBookIds);
      setSavedBookIds([...savedBookIds, bookToSave.bookId]);
    } catch (err) {
      console.error(err);
    }
  };
  const truncateText = (text, maxLength, bookId) => {
    if (text && text.length > maxLength && !showFullDescriptionMap[bookId]) {
      return `${text.slice(0, maxLength)}...`;
    }
    return text;
  };
  return (
    <>
      <Jumbotron fluid className="text-light bg-dark">
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Form.Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name="searchInput"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type="text"
                  size="lg"
                  placeholder="Search for a book"
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type="submit" variant="success" size="lg">
                  Submit Search
                </Button>
              </Col>
            </Form.Row>
          </Form>
        </Container>
      </Jumbotron>
      <Container>
        <h2>
          {searchedBooks && searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : "Search for a book to begin"}
        </h2>
        <div
          style={{
            flexDirection: "col", // Set the direction to row
            overflowX: "auto",
          }}
        >
          {searchedBooks &&
            searchedBooks.map((book) => (
              <div
                key={book.bookId}
                style={{
                  minWidth: "250px",
                  marginBottom: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "10px",
                  boxSizing: "border-box",
                  display: "flex",
                  backgroundColor: "white",
                }}
              >
                {book.image && (
                  <img
                    src={book.image}
                    alt={`The cover for ${book.title}`}
                    style={{
                      height: "auto",
                      objectFit: "cover",
                      marginBottom: "10px",
                    }}
                  />
                )}
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    paddingLeft: "20px",
                  }}
                >
                  <h5>{book.title}</h5>
                  <p className="small">Authors: {book.authors}</p>
                  <p>
                    {showFullDescriptionMap[book.bookId]
                      ? book.description
                      : truncateText(book.description, 250, book.bookId)}
                    {book.description && book.description.length > 250 && (
                      <span
                        style={{ cursor: "pointer", color: "blue" }}
                        onClick={() =>
                          setShowFullDescriptionMap((prev) => ({
                            ...prev,
                            [book.bookId]: !prev[book.bookId],
                          }))
                        }
                      >
                        {showFullDescriptionMap[book.bookId]
                          ? " less..."
                          : " more..."}
                      </span>
                    )}
                  </p>
                  {
                    <div
                      style={{
                        width: "500px",
                      }}
                    >
                      <Button
                        disabled={savedBookIds?.some(
                          (savedId) => savedId === book.bookId
                        )}
                        className="btn-block btn-info"
                        onClick={() => handleSaveBook(book.bookId)}
                      >
                        {savedBookIds?.some(
                          (savedId) => savedId === book.bookId
                        )
                          ? "Book Already Saved!"
                          : "Save This Book!"}
                      </Button>
                    </div>
                  }
                </div>
              </div>
            ))}
        </div>
      </Container>
      ; ;
    </>
  );
};

export default SearchBooks;
