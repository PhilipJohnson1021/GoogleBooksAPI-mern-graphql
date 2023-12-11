import { gql } from "@apollo/client";

export const QUERY_ME = gql`
  {
    me {
      _id
      username
      email
      savedBooks {
        bookId
        authors
        image
        description
        title
        link
        binding: String
        isbn10: String
        isbn13: String
        language: String
        pages: Int
        ratingCount: Int
        type: String
        year: Int
        publisher: String
      }
    }
  }
`;
