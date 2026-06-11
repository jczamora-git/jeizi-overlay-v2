const client = String(process.env.DB_CLIENT || "mysql").toLowerCase() === "postgres"
  ? "postgres"
  : "mysql";

function param(index) {
  return client === "postgres" ? `$${index}` : "?";
}

function placeholders(count, startIndex = 1) {
  return Array.from({ length: count }, (_, offset) => param(startIndex + offset)).join(", ");
}

function whereId(column = "id", index = 1) {
  return `${column} = ${param(index)}`;
}

module.exports = {
  client,
  param,
  placeholders,
  whereId,
};
