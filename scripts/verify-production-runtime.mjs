const baseUrl = (process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/$/, "");

async function inspect(path) {
  const response = await fetch(`${baseUrl}${path}`);
  const body = await response.arrayBuffer();
  console.log(JSON.stringify({ path, status: response.status, bytes: body.byteLength }));
  return { response, body };
}

for (const path of [
  "/",
  "/produkte",
  "/produkte/artikel/kunststoff-gestellgleiter",
  "/raumplaner",
  "/robots.txt",
  "/sitemap.xml",
  "/nicht-vorhanden-wp191",
]) {
  await inspect(path);
}

const search = await inspect("/api/search?q=gleiter");
console.log(JSON.stringify({
  path: "/api/search?q=gleiter headers",
  cacheControl: search.response.headers.get("cache-control"),
  cdnCacheControl: search.response.headers.get("cdn-cache-control"),
  etag: search.response.headers.get("etag"),
}));

const model = await inspect("/models/dalemans-chair-low-web.glb");
const modelEtag = model.response.headers.get("etag");
const modelLastModified = model.response.headers.get("last-modified");
console.log(JSON.stringify({
  path: "/models/dalemans-chair-low-web.glb headers",
  cacheControl: model.response.headers.get("cache-control"),
  etag: modelEtag,
  lastModified: modelLastModified,
}));
const conditionalModel = await fetch(`${baseUrl}/models/dalemans-chair-low-web.glb`, {
  headers: modelEtag ? { "If-None-Match": modelEtag } : {},
});
console.log(JSON.stringify({
  path: "/models/dalemans-chair-low-web.glb conditional",
  status: conditionalModel.status,
  bytes: (await conditionalModel.arrayBuffer()).byteLength,
}));
const modifiedSinceModel = await fetch(`${baseUrl}/models/dalemans-chair-low-web.glb`, {
  headers: modelLastModified ? { "If-Modified-Since": modelLastModified } : {},
});
console.log(JSON.stringify({
  path: "/models/dalemans-chair-low-web.glb if-modified-since",
  status: modifiedSinceModel.status,
  bytes: (await modifiedSinceModel.arrayBuffer()).byteLength,
}));

const contact = await fetch(`${baseUrl}/api/contact`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: baseUrl },
  body: JSON.stringify({
    firstName: "Erika",
    lastName: "Muster",
    organization: "Test",
    email: "erika@example.test",
    phone: "",
    subject: "Technischer Test",
    message: "Diese synthetische Anfrage darf nicht versendet werden.",
    submissionId: "wp191-standalone-0001",
    website: "",
  }),
});
console.log(JSON.stringify({
  path: "/api/contact safe failure",
  status: contact.status,
  body: await contact.json(),
}));
