import fetch from "node-fetch";

async function test() {
  const res = await fetch("http://localhost:3000/api/generate-exercises", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ level: "A1", grammarTopic: "sein", vocabulary: [{ word: "ich" }] })
  });
  console.log(res.status);
  console.log(await res.text());
}
test();
