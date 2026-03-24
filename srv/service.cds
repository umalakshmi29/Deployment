using {db} from '../db/schema';
service Sample{
    entity Books as projection on db.Books;
    entity Author as projection on db.Author;
} 