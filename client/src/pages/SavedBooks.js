import React from "react";
import {
  Jumbotron,
  Container,
  CardColumns,
  Card,
  Button,
} from "react-bootstrap";

import { useQuery, useMutation } from "@apollo/client";
import { QUERY_ME } from "../utils/queries";
import { REMOVE_BOOK } from "../utils/mutations";
import { removeBookId } from "../utils/localStorage";

import Auth from "../utils/auth";

const SavedBooks = () => {
  const { loading, data } = useQuery(QUERY_ME);
  const [removeBook, { error }] = useMutation(REMOVE_BOOK);

  const userData = data?.me || {};

  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  const handleDeleteBook = async (bookId) => {
    // get token
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      const { data } = await removeBook({
        variables: { bookId },
      });

      // upon success, remove book's id from localStorage
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <h2>LOADING...</h2>;
  }
  const truncateText = (text, maxLength) => {
    if (text && text.length > maxLength) {
      return `${text.slice(0, maxLength)}...`;
    }
    return text;
  };
  return (
    <>
      <Jumbotron fluid className="text-light bg-dark">
        <Container>
          <h1>Viewing {userData.username}'s books!</h1>
        </Container>
      </Jumbotron>
      <Container>
        <h2>
          {userData.savedBooks?.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? "book" : "books"
              }:`
            : "You have no saved books!"}
        </h2>
        <div
          style={{
            flexDirection: "col", // Set the direction to row
            overflowX: "auto",
          }}
        >
          {userData &&
            userData.savedBooks?.map((book) => (
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
                  <p>{truncateText(book.description, 250)}</p>
                  <div
                    style={{
                      width: "500px",
                    }}
                  >
                    <Button
                      className="btn-block btn-danger"
                      onClick={() => handleDeleteBook(book.bookId)}
                    >
                      Delete this Book!
                    </Button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </Container>
    </>
  );
};

export default SavedBooks;
