namespace db;
entity Books{
    key ID: UUID;
    name: String;
    author: Association to Author;
}

entity Author{
    key ID: UUID;
    name: String;
}
